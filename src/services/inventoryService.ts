import { db } from "../db/db";

export async function createInventory(productId: number, quantity: number) {
  const existingInventory = await db.inventory.findUnique({
    where: { productId },
  });

  if (existingInventory) {
    throw new Error("Inventory for this product already exists");
  }

  return db.inventory.create({
    data: { productId, quantity },
  });
}

export async function updateInventory(productId: number, quantity: number) {
  return db.inventory.upsert({
    where: { productId },
    update: { quantity },
    create: { productId, quantity },
  });
}

export async function getInventory(productId: number) {
  return db.inventory.findUnique({
    where: { productId },
  });
}

export async function deleteInventory(productId: number) {
  const existingInventory = await db.inventory.findUnique({
    where: { productId },
  });

  if (!existingInventory) {
    throw new Error("Inventory for this product does not exist");
  }

  return db.inventory.delete({
    where: { productId },
  });
}
