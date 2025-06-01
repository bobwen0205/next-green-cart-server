import { Router } from "express";
import { upload } from "../configs/multer";
import authSeller from "../middleware/authSeller";
import {
  addProduct,
  changeStock,
  getProductById,
  productList,
} from "../controllers/productController";

const productRouter = Router();

productRouter.post("/add", upload.array("images"), authSeller, addProduct);
productRouter.get("/list", productList);
productRouter.get("/:id", getProductById);
productRouter.get("/stock/:id", authSeller, changeStock);

export default productRouter;
