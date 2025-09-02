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
exports.OTPService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const redis_config_1 = require("../../config/redis.config");
const sendEmail_1 = require("../../utils/sendEmail");
const OTP_EXPIRATION = 2 * 60;
const generateOtp = (length = 6) => {
    const opt = crypto_1.default.randomInt(10 ** (length - 1), 10 ** length).toString();
    return opt;
};
const sendOTP = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "user not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const opt = generateOtp();
    const redisKey = `opt:${email}`;
    yield redis_config_1.redisClient.set(redisKey, opt, {
        expiration: {
            type: "EX",
            value: OTP_EXPIRATION,
        },
    });
    yield (0, sendEmail_1.sendMail)({
        to: email,
        subject: "Your OTP Code",
        templateName: "otp",
        templateData: {
            name: user.name,
            otp: opt,
        },
    });
});
const verifyOTP = (email, otp) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findOne({ email: email });
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "user not found");
    }
    if (user.isVerified) {
        throw new AppError_1.default(401, "You are already verified");
    }
    const redisKey = `opt:${email}`;
    const saveOtp = yield redis_config_1.redisClient.get(redisKey);
    if (!saveOtp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    if (saveOtp !== otp) {
        throw new AppError_1.default(401, "Invalid OTP");
    }
    yield Promise.all([
        user_model_1.User.updateOne({ email: email }, { isVerified: true }),
        redis_config_1.redisClient.del(redisKey),
    ]);
});
exports.OTPService = {
    sendOTP,
    verifyOTP,
};
