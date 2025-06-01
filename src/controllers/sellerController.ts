import jwt from "jsonwebtoken";
import { Request, Response } from "express";

// Login Seller: /api/seller/login
export const sellerLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (
      password === process.env.SELLER_PASSWORD &&
      email === process.env.SELLER_EMAIL
    ) {
      const token = jwt.sign({ email }, process.env.JWT_SECRET!, {
        expiresIn: "7d",
      });

      res.json({ success: true, token, message: "Logged In" });
    } else {
      res.json({ success: false, message: "Invalid credential" });
    }
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Check Seller Auth: /api/seller/is-auth
export const isSellerAuth = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    res.json({ success: true, message: "Seller is authenticated" });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
