import { Router } from "express";
import authUser from "../middleware/authUser";
import { updateCart } from "../controllers/cartController";

const cartRouter = Router();

cartRouter.post("/update", authUser, updateCart);

export default cartRouter;
