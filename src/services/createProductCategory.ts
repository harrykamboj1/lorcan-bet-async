import { db } from "../db/db";

export async function createCategory(name: string) {
  const existingCategory = await db.category.findUnique({ where: { name } });
  if (existingCategory) {
    throw new Error("Category already exists");
  }

  return db.category.create({ data: { name } });
}

export async function addProductToCategory(
  productId: number,
  categoryId: number
) {
  const product = await db.product.findUnique({ where: { id: productId } });
  const category = await db.category.findUnique({ where: { id: categoryId } });

  if (!product || !category) {
    throw new Error("Product or Category not found");
  }

  return db.productCategories.create({
    data: {
      productId,
      categoryId,
    },
  });
}
