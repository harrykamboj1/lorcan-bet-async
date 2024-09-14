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
const express_1 = __importDefault(require("express"));
const inventoryService_1 = require("../services/inventoryService");
const router = express_1.default.Router();
router.post("/create", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity } = req.body;
    try {
        const inventory = yield (0, inventoryService_1.createInventory)(productId, quantity);
        res.status(200).json(inventory);
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong");
    }
}));
router.post("/update", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId, quantity } = req.body;
    try {
        const inventory = yield (0, inventoryService_1.updateInventory)(productId, quantity);
        res.json(inventory);
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong");
    }
}));
router.get("/:productId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    try {
        const inventory = yield (0, inventoryService_1.getInventory)(productId);
        res.json(inventory);
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong");
    }
}));
router.delete("/:productId", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const productId = parseInt(req.params.productId);
    try {
        const inventory = yield (0, inventoryService_1.deleteInventory)(productId);
        res.json(inventory);
    }
    catch (error) {
        console.log(error);
        res.status(500).json("Something went wrong");
    }
}));
exports.default = router;
