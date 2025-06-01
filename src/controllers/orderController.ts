import stripe from "stripe";
import { Request, Response } from "express";
import { CartItem, OrderItem, PrismaClient, Product } from "@prisma/client";

const prisma = new PrismaClient();
// Place Order COD: /api/order/cod
export const placeOrderCOD = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const { items, addressId } = req.body;

    if (!addressId || !items || items.length === 0) {
      res.json({ success: false, message: "Invalid data" });
      return;
    }

    const productsWithQuantities = await Promise.all(
      items.map(async (item: Partial<OrderItem>) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          offerPrice: product?.offerPrice ?? 0,
          quantity: item.quantity,
        };
      })
    );

    let amount = productsWithQuantities.reduce((acc, item) => {
      return acc + item.offerPrice * item.quantity;
    }, 0);

    amount += Math.floor(amount * 0.02); // Add tax

    await prisma.order.create({
      data: {
        userId: id,
        addressId,
        amount,
        paymentType: "COD",
        items: {
          create: items.map((item: Partial<OrderItem>) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
    });

    res.json({ success: true, message: "Order Placed Successfully" });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Place Order Stripe: /api/order/stripe
export const placeOrderStripe = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const { items, addressId } = req.body;

    const { origin } = req.headers;
    if (!addressId || items.length === 0) {
      res.json({ success: false, message: "Invalid data" });
      return;
    }

    const productsWithDetailsAndQuantities = await Promise.all(
      items.map(async (item: Partial<OrderItem>) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
        });
        return {
          product,
          offerPrice: product?.offerPrice ?? 0,
          quantity: item.quantity,
        };
      })
    );

    let amount = productsWithDetailsAndQuantities.reduce((acc, item) => {
      return acc + item.offerPrice * item.quantity;
    }, 0);
    // Add Tax Charge (2%)
    amount += Math.floor(amount * 0.02);

    const order = await prisma.order.create({
      data: {
        userId: id,
        items: {
          create: items.map((item: Partial<OrderItem>) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        amount,
        addressId,
        paymentType: "Online",
      },
    });

    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!);

    // Create line items for stripe
    const line_items = productsWithDetailsAndQuantities.map(
      (item: { product: Product; offerPrice: number; quantity: number }) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,
          },
          unit_amount: Math.floor(
            (item.offerPrice + item.offerPrice * 0.02) * 100
          ),
        },
        quantity: item.quantity,
      })
    );

    // Create session
    const session = await stripeInstance.checkout.sessions.create({
      line_items,
      mode: "payment",
      success_url: `${origin}/loader?next=my-orders`,
      cancel_url: `${origin}/cart`,
      metadata: {
        orderId: order.id.toString(),
        userId: id,
      },
    });

    res.json({ success: true, url: session.url });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Stripe Webhooks to Verify Payments Action: /stripe
export const stripeWebhooks = async (req: Request, res: Response) => {
  // Stripe Gateway Initialize
  const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY!);

  const sig = req.headers["stripe-signature"] as string;

  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // Handle the event
  switch (event!.type) {
    case "payment_intent.succeeded": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId, userId } = session.data[0].metadata!;

      // Mark Payment as Paid
      await prisma.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
      // Clear user cart
      await prisma.cartItem.deleteMany({
        where: { userId },
      });
      break;
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object;
      const paymentIntentId = paymentIntent.id;

      // Getting session metadata
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { orderId } = session.data[0].metadata!;

      await prisma.order.deleteMany({
        where: { id: orderId },
      });

      break;
    }

    default:
      console.error(`Unhandled event type ${event!.type}`);
      break;
  }
  res.json({ received: true });
};

// Get Orders by User ID: /api/order/user
export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const orders = await prisma.order.findMany({
      where: {
        userId: id,
        OR: [{ paymentType: "COD" }, { isPaid: true }],
      },
      include: {
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({ success: true, orders });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get All Orders (for seller / admin): /api/order/seller
export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ paymentType: "COD" }, { isPaid: true }],
      },
      include: {
        address: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.json({ success: true, orders });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
