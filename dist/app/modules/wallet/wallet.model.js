"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wallet = void 0;
const mongoose_1 = require("mongoose");
const walletSchema = new mongoose_1.Schema({
    balance: {
        type: Number,
        required: [true, "balance is required"],
        // default: 50,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "UserId is required"],
    },
}, { timestamps: true, versionKey: false });
exports.Wallet = (0, mongoose_1.model)("Wallet", walletSchema);
