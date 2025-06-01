import express from "express";
import { isAuth, login, register } from "../controllers/userController";
import authUser from "../middleware/authUser";

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/is-auth", authUser, isAuth);

export default userRouter;
