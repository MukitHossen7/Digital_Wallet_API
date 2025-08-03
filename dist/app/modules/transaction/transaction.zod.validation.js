"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTransactionZodSchema = void 0;
const zod_1 = __importDefault(require("zod"));
const transaction_interface_1 = require("./transaction.interface");
exports.createTransactionZodSchema = zod_1.default.object({
    type: zod_1.default
        .enum([transaction_interface_1.PayType.ADD_MONEY, transaction_interface_1.PayType.SEND_MONEY, transaction_interface_1.PayType.WITHDRAW])
        .optional(),
    amount: zod_1.default
        .number({
        required_error: "amount is required",
        invalid_type_error: "amount must be a number",
    })
        .min(50, "Minimum transaction amount is ৳50")
        .nonnegative(),
    senderId: zod_1.default.string().optional(),
    receiverId: zod_1.default.string().optional(),
    wallet: zod_1.default.string().optional(),
    initiatedBy: zod_1.default.enum([transaction_interface_1.InitiatedBy.USER, transaction_interface_1.InitiatedBy.AGENT]).optional(),
    fee: zod_1.default.number().nonnegative().default(0).optional(),
    commission: zod_1.default.number().nonnegative().default(0).optional(),
});
