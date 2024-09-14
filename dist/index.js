"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const requestLogger_1 = require("./middleware/requestLogger");
const express_2 = require("@bull-board/express");
const api_1 = require("@bull-board/api");
const bullAdapter_1 = require("@bull-board/api/bullAdapter");
const orderQueue_1 = require("./queue/orderQueue");
const errorHandler_1 = require("./middleware/errorHandler");
const orderRoutes_1 = __importDefault(require("./routes/orderRoutes"));
const productRoutes_1 = __importDefault(require("./routes/productRoutes"));
const inventoryRoutes_1 = __importDefault(require("./routes/inventoryRoutes"));
const env_1 = require("./config/env");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(requestLogger_1.requestLogger);
const serverAdapter = new express_2.ExpressAdapter();
(0, api_1.createBullBoard)({
    queues: [new bullAdapter_1.BullAdapter(orderQueue_1.orderQueue)],
    serverAdapter,
});
serverAdapter.setBasePath("/admin/queues");
app.use("/admin/queues", serverAdapter.getRouter());
app.use("/orders", orderRoutes_1.default);
app.use("/products", productRoutes_1.default);
app.use("/inventory", inventoryRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(env_1.env.PORT, () => {
    console.log(`Server running on port ${env_1.env.PORT}`);
});
