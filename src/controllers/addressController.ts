import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { parse } from "path";

const prisma = new PrismaClient();

// Add Address: /api/address/add
export const addAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const { address } = req.body;

    const copyAddress = { ...address, zipcode: parseInt(address.zipcode, 10) };

    await prisma.address.create({
      data: {
        ...copyAddress,
        userId: id,
      },
    });
    res.json({ success: true, message: "Address added successfully" });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get Address: /api/address/get
export const getAddress = async (req: Request, res: Response) => {
  try {
    const { id } = req.user!;
    const addresses = await prisma.address.findMany({
      where: { userId: id },
    });
    res.json({ success: true, addresses });
  } catch (error: any) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
