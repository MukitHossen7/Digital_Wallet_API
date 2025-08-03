"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = require("mongoose");
const transaction_interface_1 = require("./transaction.interface");
const transactionSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: Object.values(transaction_interface_1.PayType),
        required: [true, "type is required"],
    },
    amount: {
        type: Number,
        required: [true, "amount is required"],
        min: 50,
    },
    senderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    receiverId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    wallet: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Wallet",
        required: true,
    },
    initiatedBy: {
        type: String,
        enum: Object.values(transaction_interface_1.InitiatedBy),
        required: [true, "InitiatedBy is required"],
    },
    fee: {
        type: Number,
        default: 0,
    },
    commission: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: Object.values(transaction_interface_1.PayStatus),
        default: transaction_interface_1.PayStatus.PENDING,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.Transaction = (0, mongoose_1.model)("Transaction", transactionSchema);
