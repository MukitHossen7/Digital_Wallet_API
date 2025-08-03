"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWalletZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.createWalletZodSchema = zod_1.default.object({
    balance: zod_1.default.number().min(0).optional(),
    user: zod_1.default.string(),
});
