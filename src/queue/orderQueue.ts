import Queue from "bull";
import { env } from "../config/env";
import { processOrder } from "../services/orderService";

export const orderQueue = new Queue("order-processing", env.REDIS_URL || "");

orderQueue.process(async (job) => {
  await processOrder(job.data.orderId);
});

orderQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with error ${err.message}`);
});
