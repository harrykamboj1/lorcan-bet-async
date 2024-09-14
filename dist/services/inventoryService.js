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
exports.deleteInventory = exports.getInventory = exports.updateInventory = exports.createInventory = void 0;
const db_1 = require("../db/db");
function createInventory(productId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingInventory = yield db_1.db.inventory.findUnique({
            where: { productId },
        });
        if (existingInventory) {
            throw new Error("Inventory for this product already exists");
        }
        return db_1.db.inventory.create({
            data: { productId, quantity },
        });
    });
}
exports.createInventory = createInventory;
function updateInventory(productId, quantity) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db.inventory.upsert({
            where: { productId },
            update: { quantity },
            create: { productId, quantity },
        });
    });
}
exports.updateInventory = updateInventory;
function getInventory(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db.inventory.findUnique({
            where: { productId },
        });
    });
}
exports.getInventory = getInventory;
function deleteInventory(productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingInventory = yield db_1.db.inventory.findUnique({
            where: { productId },
        });
        if (!existingInventory) {
            throw new Error("Inventory for this product does not exist");
        }
        return db_1.db.inventory.delete({
            where: { productId },
        });
    });
}
exports.deleteInventory = deleteInventory;
