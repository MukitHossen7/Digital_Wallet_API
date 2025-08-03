"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "name is required"],
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "name is required"],
        unique: true,
        trim: true,
    },
    picture: {
        type: String,
        trim: true,
    },
    address: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: String,
        enum: Object.values(user_interface_1.IsActive),
        default: user_interface_1.IsActive.ACTIVE,
    },
    role: {
        type: String,
        enum: Object.values(user_interface_1.Role),
        default: user_interface_1.Role.USER,
    },
    commissionRate: {
        type: Number,
    },
}, { versionKey: false, timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
