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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderQueue = void 0;
const bull_1 = __importDefault(require("bull"));
const env_1 = require("../config/env");
const orderService_1 = require("../services/orderService");
exports.orderQueue = new bull_1.default("order-processing", env_1.env.REDIS_URL || "");
exports.orderQueue.process((job) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, orderService_1.processOrder)(job.data.orderId);
}));
exports.orderQueue.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with error ${err.message}`);
});
