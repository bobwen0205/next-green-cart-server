import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
      };
    }
  }
}

const authSeller = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    res.json({ success: false, message: "Not Authorized" });
    return;
  }
  try {
    const tokenDecode = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedToken;
    if (!tokenDecode || !tokenDecode.email) {
      res.json({ success: false, message: "Not Authorized" });
      return;
    }
    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      next();
    } else {
      res.json({ success: false, message: "Not Authorized" });
    }
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

export default authSeller;
