"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processOrder = exports.deleteOrder = exports.updateOrder = exports.getOrderById = exports.getOrders = exports.createOrder = void 0;
const db_1 = require("../db/db");
const orderQueue_1 = require("../queue/orderQueue");
const paymentService_1 = require("./paymentService");
function createOrder(productId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield db_1.db.order.create({
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
        yield orderQueue_1.orderQueue.add({ orderId: order.id }, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
        return {
            message: "Order created successfully",
            order,
        };
    });
}
exports.createOrder = createOrder;
function getOrders() {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db.order.findMany({
            include: { orderItems: true },
        });
    });
}
exports.getOrders = getOrders;
function getOrderById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield db_1.db.order.findUnique({
            where: { id },
            include: { orderItems: true },
        });
        if (!order) {
            throw new Error("Order not found");
        }
        return order;
    });
}
exports.getOrderById = getOrderById;
function updateOrder(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingOrder = yield db_1.db.order.findUnique({ where: { id } });
        if (!existingOrder) {
            throw new Error("Order not found");
        }
        const updatedOrder = yield db_1.db.order.update({
            where: { id },
            data: data,
            include: { orderItems: true },
        });
        return {
            message: "Order updated successfully",
            order: updatedOrder,
        };
    });
}
exports.updateOrder = updateOrder;
function deleteOrder(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingOrder = yield db_1.db.order.findUnique({ where: { id } });
        if (!existingOrder) {
            throw new Error("Order not found");
        }
        yield db_1.db.order.delete({ where: { id } });
        return {
            message: "Order deleted successfully",
        };
    });
}
exports.deleteOrder = deleteOrder;
function processOrder(orderId) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const order = yield db_1.db.order.findUnique({
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
        let totalAmount = 0.0;
        for (const item of order.orderItems) {
            const inventory = yield db_1.db.inventory.findUnique({
                where: { productId: item.productId },
            });
            if (!inventory || inventory.quantity < item.quantity) {
                throw new Error("Insufficient inventory");
            }
            // Reserve the inventory (decrement temporarily)
            yield db_1.db.inventory.update({
                where: { productId: item.productId },
                data: { quantity: inventory.quantity - item.quantity },
            });
            reservedItems.push(item);
            // Calculate total amount based on product price
            const product = yield db_1.db.product.findUnique({
                where: { id: item.productId },
            });
            if (!product) {
                throw new Error("Product not found");
            }
            totalAmount += (_a = product === null || product === void 0 ? void 0 : product.price) !== null && _a !== void 0 ? _a : 0.0 * item.quantity;
            console.log(totalAmount);
        }
        // Process payment
        const paymentSuccess = yield (0, paymentService_1.processPayment)(orderId, totalAmount);
        if (!paymentSuccess) {
            // Payment failed, release reserved inventory
            console.log("Payment Failed");
            for (const item of reservedItems) {
                const inventory = yield db_1.db.inventory.findUnique({
                    where: { productId: item.productId },
                });
                yield db_1.db.inventory.update({
                    where: { productId: item.productId },
                    data: { quantity: inventory.quantity + item.quantity }, // Restore inventory
                });
            }
            yield db_1.db.orderLogs.create({
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
        const updatedOrder = yield db_1.db.order.update({
            where: { id: orderId },
            data: { status: "PROCESSED" },
        });
        yield db_1.db.orderLogs.create({
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
    });
}
exports.processOrder = processOrder;
