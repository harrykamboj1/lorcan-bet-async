import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { requestLogger } from "./middleware/requestLogger";
import { ExpressAdapter } from "@bull-board/express";
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { orderQueue } from "./queue/orderQueue";
import { errorHandler } from "./middleware/errorHandler";
import orderRoutes from "./routes/orderRoutes";
import productRoutes from "./routes/productRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import { env } from "./config/env";

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestLogger);

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullAdapter(orderQueue)],
  serverAdapter,
});

serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/orders", orderRoutes);
app.use("/products", productRoutes);
app.use("/inventory", inventoryRoutes);

app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Server running on port ${env.PORT}`);
});
