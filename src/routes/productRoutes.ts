import express from "express";
import { createProduct, getProducts } from "../services/productService";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { name, description, price } = req.body;
  try {
    const result = await createProduct(name, description, price);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
});

router.get("/", async (req, res, next) => {
  try {
    const products = await getProducts();
    res.status(200).json(products);
  } catch (error) {
    res.status(400).json({ error: "Something went wrong" });
  }
});

export default router;
