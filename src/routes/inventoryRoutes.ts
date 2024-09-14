import express from "express";
import {
  updateInventory,
  getInventory,
  createInventory,
  deleteInventory,
} from "../services/inventoryService";

const router = express.Router();

router.post("/create", async (req, res, next) => {
  const { productId, quantity } = req.body;
  try {
    const inventory = await createInventory(productId, quantity);
    res.status(200).json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

router.post("/update", async (req, res, next) => {
  const { productId, quantity } = req.body;
  try {
    const inventory = await updateInventory(productId, quantity);
    res.json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

router.get("/:productId", async (req, res, next) => {
  const productId = parseInt(req.params.productId);
  try {
    const inventory = await getInventory(productId);
    res.json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

router.delete("/:productId", async (req, res, next) => {
  const productId = parseInt(req.params.productId);
  try {
    const inventory = await deleteInventory(productId);
    res.json(inventory);
  } catch (error) {
    console.log(error);
    res.status(500).json("Something went wrong");
  }
});

export default router;
