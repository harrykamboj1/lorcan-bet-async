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
exports.deleteProduct = exports.updateProduct = exports.getProductById = exports.getProducts = exports.createProduct = void 0;
const db_1 = require("../db/db");
function createProduct(name, description, price) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingProduct = yield db_1.db.product.findFirst({
            where: { name },
        });
        if (existingProduct) {
            throw new Error("A product with this name already exists");
        }
        const newProduct = yield db_1.db.product.create({
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
    });
}
exports.createProduct = createProduct;
function getProducts() {
    return __awaiter(this, void 0, void 0, function* () {
        return db_1.db.product.findMany();
    });
}
exports.getProducts = getProducts;
function getProductById(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield db_1.db.product.findUnique({ where: { id } });
        if (!product) {
            throw new Error("Product not found");
        }
        return product;
    });
}
exports.getProductById = getProductById;
function updateProduct(id, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingProduct = yield db_1.db.product.findUnique({ where: { id } });
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        const updatedProduct = yield db_1.db.product.update({
            where: { id },
            data,
        });
        return {
            message: "Product updated successfully",
            product: updatedProduct,
        };
    });
}
exports.updateProduct = updateProduct;
function deleteProduct(id) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingProduct = yield db_1.db.product.findUnique({ where: { id } });
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        yield db_1.db.product.delete({ where: { id } });
        return {
            message: "Product deleted successfully",
        };
    });
}
exports.deleteProduct = deleteProduct;
