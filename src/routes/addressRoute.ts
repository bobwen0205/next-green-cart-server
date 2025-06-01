import { Router } from "express";
import authUser from "../middleware/authUser";
import { addAddress, getAddress } from "../controllers/addressController";

const addressRouter = Router();

addressRouter.post("/add", authUser, addAddress);
addressRouter.get("/get", authUser, getAddress);

export default addressRouter;
