import express from "express";
import { createOrder, getOrders } from "../services/orderService";

const router = express.Router();

router.post("/", async (req, res, next) => {
  const { productId, quantity } = req.body;
  try {
    const order = await createOrder(productId, quantity);
    res.json(order);
  } catch (error) {
    next(error);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const orders = await getOrders();
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

export default router;
