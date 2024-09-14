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
exports.addProductToCategory = exports.createCategory = void 0;
const db_1 = require("../db/db");
function createCategory(name) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingCategory = yield db_1.db.category.findUnique({ where: { name } });
        if (existingCategory) {
            throw new Error("Category already exists");
        }
        return db_1.db.category.create({ data: { name } });
    });
}
exports.createCategory = createCategory;
function addProductToCategory(productId, categoryId) {
    return __awaiter(this, void 0, void 0, function* () {
        const product = yield db_1.db.product.findUnique({ where: { id: productId } });
        const category = yield db_1.db.category.findUnique({ where: { id: categoryId } });
        if (!product || !category) {
            throw new Error("Product or Category not found");
        }
        return db_1.db.productCategories.create({
            data: {
                productId,
                categoryId,
            },
        });
    });
}
exports.addProductToCategory = addProductToCategory;
