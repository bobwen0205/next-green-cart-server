import { Request, Response } from "express";
import { CartItem, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Update User CartData: /api/cart/update
export const updateCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const { cartItems } = req.body;
    // Delete old cart items
    await prisma.cartItem.deleteMany({
      where: { userId: id },
    });

    // Re-create with new cartItems array
    await prisma.cartItem.createMany({
      data: cartItems.map((item: CartItem) => ({
        userId: id,
        productId: item.productId,
        quantity: item.quantity,
      })),
    });

    res.json({ success: true, message: "Cart Updated" });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
