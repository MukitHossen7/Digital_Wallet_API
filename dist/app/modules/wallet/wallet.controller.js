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
exports.WalletController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const wallet_service_1 = require("./wallet.service");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
//get all wallets
const getAllWalletsByRole = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const role = req.query.role;
    if (!role) {
        throw new AppError_1.default(400, "Role query parameter is required");
    }
    const wallets = yield wallet_service_1.WalletServices.getAllWalletsByRole(role.toUpperCase());
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: `All Wallets for role ${role} Retrieved Successfully`,
        data: wallets,
    });
}));
const getMeWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const decoded = req.user;
    const wallets = yield wallet_service_1.WalletServices.getMeWallet(decoded.id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Your Wallet Retrieved Successfully",
        data: wallets,
    });
}));
const blockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const wallet = yield wallet_service_1.WalletServices.blockWallet(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet Blocked Successfully",
        data: wallet,
    });
}));
const unblockWallet = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const wallet = yield wallet_service_1.WalletServices.unblockWallet(id);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Wallet UnBlocked Successfully",
        data: wallet,
    });
}));
exports.WalletController = {
    getAllWalletsByRole,
    getMeWallet,
    blockWallet,
    unblockWallet,
};
