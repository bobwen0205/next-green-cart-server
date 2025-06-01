import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Add Product: /api/product/add
export const addProduct = async (req: Request, res: Response) => {
  try {
    let productData = JSON.parse(req.body.productData);

    const images = req.files || [];

    let imagesUrl: string[] = [];

    if (Array.isArray(images)) {
      imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {
            resource_type: "image",
          });
          return result.secure_url;
        })
      );
    }

    productData.price = parseFloat(productData.price);
    productData.offerPrice = parseFloat(productData.offerPrice);

    await prisma.product.create({
      data: { ...productData, images: imagesUrl },
    });

    res.json({ success: true, message: "Product Added" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product: /api/product/list
export const productList = async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({});
    res.json({ success: true, products });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Product by Id: /api/product/:id
export const getProductById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    res.json({ success: true, product });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change Product inStock: /api/product/stock/:id
export const changeStock = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });
    if (!product) {
      res.json({ success: false, message: "Product not found" });
      return;
    }
    await prisma.product.update({
      where: { id },
      data: { inStock: !product.inStock },
    });
    res.json({ success: true, id, message: "Stock Updated" });
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
