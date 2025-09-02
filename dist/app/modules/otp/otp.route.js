"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const otp_controller_1 = require("./otp.controller");
const otpRoute = express_1.default.Router();
otpRoute.post("/send", otp_controller_1.OTPController.sendOTP);
otpRoute.post("/verify", otp_controller_1.OTPController.verifyOTP);
exports.default = otpRoute;
