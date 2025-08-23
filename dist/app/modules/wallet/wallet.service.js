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
exports.WalletServices = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const user_interface_1 = require("../user/user.interface");
const wallet_model_1 = require("./wallet.model");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
//get all wallets
const getAllWalletsByRole = (role) => __awaiter(void 0, void 0, void 0, function* () {
    if (role !== user_interface_1.Role.USER && role !== user_interface_1.Role.AGENT) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Invalid role: ${role}`);
    }
    const wallets = yield wallet_model_1.Wallet.find()
        .sort("-createdAt")
        .populate({
        path: "user",
        match: { role: role },
        select: "name email role",
    });
    const filterWallets = wallets.filter((wallet) => wallet.user);
    return filterWallets;
});
const getMeWallet = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findOne({ user: id }).populate({
        path: "user",
        select: "name email role",
    });
    if ((wallet === null || wallet === void 0 ? void 0 : wallet.isBlocked) === true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. You can not see Wallet.");
    }
    return wallet;
});
const blockWallet = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(id);
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Wallet is already blocked");
    }
    wallet.isBlocked = true;
    yield wallet.save();
    return wallet;
});
const unblockWallet = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const wallet = yield wallet_model_1.Wallet.findById(id);
    if (!wallet) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Wallet not found");
    }
    if (!wallet.isBlocked) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Wallet is already unblocked");
    }
    wallet.isBlocked = false;
    yield wallet.save();
    return wallet;
});
exports.WalletServices = {
    getAllWalletsByRole,
    getMeWallet,
    blockWallet,
    unblockWallet,
};
