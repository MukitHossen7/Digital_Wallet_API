"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const user_interface_1 = require("./user.interface");
const authsSchema = new mongoose_1.Schema({
    provider: {
        type: String,
        required: true,
    },
    providerID: {
        type: String,
        required: true,
    },
}, {
    versionKey: false,
    _id: false,
});
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
        trim: true,
    },
    phone: {
        type: String,
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
    isVerified: {
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
    auths: [authsSchema],
}, { versionKey: false, timestamps: true });
exports.User = (0, mongoose_1.model)("User", userSchema);
