import { OrderStatus } from "@prisma/client";
import { db } from "../db/db";
import { orderQueue } from "../queue/orderQueue";
import { processPayment } from "./paymentService";

export async function createOrder(productId: number, quantity: number) {
  const order = await db.order.create({
    data: {
      status: "PENDING",
      orderItems: {
        create: {
          productId,
          quantity,
        },
      },
    },
  });

  await orderQueue.add(
    { orderId: order.id },
    { attempts: 3, backoff: { type: "exponential", delay: 5000 } }
  );

  return {
    message: "Order created successfully",
    order,
  };
}

export async function getOrders() {
  return db.order.findMany({
    include: { orderItems: true },
  });
}

export async function getOrderById(id: number) {
  const order = await db.order.findUnique({
    where: { id },
    include: { orderItems: true },
  });
  if (!order) {
    throw new Error("Order not found");
  }
  return order;
}

export async function updateOrder(id: number, data: { status?: OrderStatus }) {
  const existingOrder = await db.order.findUnique({ where: { id } });
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  const updatedOrder = await db.order.update({
    where: { id },
    data: data,
    include: { orderItems: true },
  });

  return {
    message: "Order updated successfully",
    order: updatedOrder,
  };
}

export async function deleteOrder(id: number) {
  const existingOrder = await db.order.findUnique({ where: { id } });
  if (!existingOrder) {
    throw new Error("Order not found");
  }

  await db.order.delete({ where: { id } });

  return {
    message: "Order deleted successfully",
  };
}

export async function processOrder(orderId: number) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { orderItems: { include: { product: true } } },
  });

  if (!order) {
    throw new Error("Order Not Found");
  }

  if (order.status !== "PENDING") {
    console.log("processOrder :: " + order.id + " already processed");
    return;
  }

  // Reserve inventory and calculate total amount
  const reservedItems = [];
  let totalAmount: any = 0.0;

  for (const item of order.orderItems) {
    const inventory = await db.inventory.findUnique({
      where: { productId: item.productId },
    });

    if (!inventory || inventory.quantity < item.quantity) {
      throw new Error("Insufficient inventory");
    }

    // Reserve the inventory (decrement temporarily)
    await db.inventory.update({
      where: { productId: item.productId },
      data: { quantity: inventory.quantity - item.quantity },
    });

    reservedItems.push(item);

    // Calculate total amount based on product price
    const product = await db.product.findUnique({
      where: { id: item.productId },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    totalAmount += product?.price ?? 0.0 * item.quantity;
    console.log(totalAmount);
  }

  // Process payment
  const paymentSuccess = await processPayment(orderId, totalAmount);

  if (!paymentSuccess) {
    // Payment failed, release reserved inventory
    console.log("Payment Failed");
    for (const item of reservedItems) {
      const inventory = await db.inventory.findUnique({
        where: { productId: item.productId },
      });

      await db.inventory.update({
        where: { productId: item.productId },
        data: { quantity: inventory!.quantity + item.quantity }, // Restore inventory
      });
    }

    await db.orderLogs.create({
      data: {
        orderId,
        status: "FAILED",
        processedAt: new Date(),
        errorMessage: "Payment failed",
      },
    });

    throw new Error("Payment failed, inventory released");
  }

  // Payment succeeded, update order status
  const updatedOrder = await db.order.update({
    where: { id: orderId },
    data: { status: "PROCESSED" },
  });

  await db.orderLogs.create({
    data: {
      orderId,
      status: "PROCESSED",
      processedAt: new Date(),
      errorMessage: null,
    },
  });

  return {
    message: "Order processed successfully",
    order: updatedOrder,
  };
}
