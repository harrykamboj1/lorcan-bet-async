import { db } from "../db/db";

export async function createProduct(
  name: string,
  description: string | null,
  price: number
) {
  const existingProduct = await db.product.findFirst({
    where: { name },
  });

  if (existingProduct) {
    throw new Error("A product with this name already exists");
  }

  const newProduct = await db.product.create({
    data: {
      name,
      description,
      price,
    },
  });

  return {
    message: "Product created successfully",
    product: newProduct,
  };
}

export async function getProducts() {
  return db.product.findMany();
}

export async function getProductById(id: number) {
  const product = await db.product.findUnique({ where: { id } });
  if (!product) {
    throw new Error("Product not found");
  }
  return product;
}

export async function updateProduct(
  id: number,
  data: { name?: string; description?: string | null; price?: number }
) {
  const existingProduct = await db.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const updatedProduct = await db.product.update({
    where: { id },
    data,
  });

  return {
    message: "Product updated successfully",
    product: updatedProduct,
  };
}

export async function deleteProduct(id: number) {
  const existingProduct = await db.product.findUnique({ where: { id } });
  if (!existingProduct) {
    throw new Error("Product not found");
  }

  await db.product.delete({ where: { id } });

  return {
    message: "Product deleted successfully",
  };
}
