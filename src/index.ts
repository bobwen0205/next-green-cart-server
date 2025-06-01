import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import userRouter from "./routes/userRoute";
import sellerRouter from "./routes/sellerRoute";
import addressRouter from "./routes/addressRoute";
import cartRouter from "./routes/cartRoute";
import productRouter from "./routes/productRoute";
import orderRouter from "./routes/orderRoute";
import { stripeWebhooks } from "./controllers/orderController";
import connectCloudinary from "./configs/cloudinary";

dotenv.config();
const app = express();
connectCloudinary();

app.post("/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(cors());

app.get("/", (req, res) => {
  res.send("This is home route");
});
app.use("/api/user", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/address", addressRouter);
app.use("/api/cart", cartRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);

const port = Number(process.env.PORT) || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});
