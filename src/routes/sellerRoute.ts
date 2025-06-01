import express from "express";
import authSeller from "../middleware/authSeller";
import { isSellerAuth, sellerLogin } from "../controllers/sellerController";

const sellerRouter = express.Router();

sellerRouter.post("/login", sellerLogin);
sellerRouter.get("/is-auth", authSeller, isSellerAuth);

export default sellerRouter;
