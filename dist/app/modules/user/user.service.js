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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("./user.interface");
const user_model_1 = require("./user.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config"));
const wallet_model_1 = require("../wallet/wallet.model");
const createUser = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield user_model_1.User.startSession();
    session.startTransaction();
    try {
        const { email, password } = payload, rest = __rest(payload, ["email", "password"]);
        const isExistUser = yield user_model_1.User.findOne({ email });
        if (isExistUser) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User Already Exist");
        }
        const hashPassword = yield bcryptjs_1.default.hash(password, Number(config_1.default.BCRYPT_SALT_ROUNDS));
        const user = yield user_model_1.User.create([
            Object.assign({ email, password: hashPassword }, rest),
        ], { session });
        const existingWallet = yield wallet_model_1.Wallet.findOne({
            user: user[0]._id,
        });
        if (existingWallet) {
            throw new AppError_1.default(http_status_codes_1.default.CONFLICT, "Wallet already exists for this user");
        }
        yield wallet_model_1.Wallet.create([
            {
                user: user[0]._id,
                balance: 50,
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        return user;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
const getAllUserOrAgent = (role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role !== user_interface_1.Role.USER && role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid role: ${role}`);
    }
    const users = yield user_model_1.User.find({ role: role });
    return users;
});
const approveAgent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted === true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This account is deleted");
    }
    if (user.role === user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already an AGENT");
    }
    user.role = user_interface_1.Role.AGENT;
    yield user.save();
    return user;
});
const suspendAgent = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
    }
    if (user.isDeleted === true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This account is deleted");
    }
    if (user.role === user_interface_1.Role.USER) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "User is already suspended");
    }
    user.role = user_interface_1.Role.USER;
    yield user.save();
    return user;
});
exports.UserServices = {
    createUser,
    approveAgent,
    suspendAgent,
    getAllUserOrAgent,
};
