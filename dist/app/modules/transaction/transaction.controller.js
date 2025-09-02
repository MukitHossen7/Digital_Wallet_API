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
exports.TransactionController = void 0;
const catchAsync_1 = require("../../utils/catchAsync");
const transaction_service_1 = require("./transaction.service");
const sendResponse_1 = require("../../utils/sendResponse");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const transaction_interface_1 = require("./transaction.interface");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
// add money
const addMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = transaction_interface_1.PayType.ADD_MONEY;
    const payload = req.body;
    if (type !== payload.type) {
        throw new AppError_1.default(400, "Transaction type mismatch. Please try again.");
    }
    const { role, id: userId } = req.user;
    const addMoney = yield transaction_service_1.TransactionService.addMoney(payload, role, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Add Money successfully",
        data: addMoney,
    });
}));
//withdraw Money
const withdrawMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = transaction_interface_1.PayType.WITHDRAW;
    const payload = req.body;
    if (type !== payload.type) {
        throw new AppError_1.default(400, "Transaction type mismatch. Please try again.");
    }
    const { role, id: userId } = req.user;
    const withdrawMoney = yield transaction_service_1.TransactionService.withdrawMoney(payload, role, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Money withdraw successfully",
        data: withdrawMoney,
    });
}));
//send Money
const sendMoney = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = transaction_interface_1.PayType.SEND_MONEY;
    const payload = req.body;
    if (type !== payload.type) {
        throw new AppError_1.default(400, "Transaction type mismatch. Please try again.");
    }
    const { role, id: userId } = req.user;
    const sendMoney = yield transaction_service_1.TransactionService.sendMoney(payload, role, userId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Money sent successfully",
        data: sendMoney,
    });
}));
//get Transaction History by me
const getTransactionHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const query = req.query;
    const { id: userId } = req.user;
    const getTransaction = yield transaction_service_1.TransactionService.getTransactionHistory(userId, query);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Transaction history retrieved successfully",
        meta: getTransaction.meta,
        data: getTransaction.transactions,
    });
}));
//get Transaction History by admin
const getAllTransactionHistory = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const getAllTransaction =
    //   await TransactionService.getAllTransactionHistory();
    const transactionHistory = res.locals.data;
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "All transaction history retrieved successfully",
        meta: transactionHistory.meta,
        data: transactionHistory.data,
    });
}));
//cash in Agent
const cashIn = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = transaction_interface_1.PayType.ADD_MONEY;
    const payload = req.body;
    if (type !== payload.type) {
        throw new AppError_1.default(400, "Transaction type mismatch. Please try again.");
    }
    const { role, id: agentId } = req.user;
    const result = yield transaction_service_1.TransactionService.cashIn(payload, role, agentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Cash in completed successfully",
        data: result,
    });
}));
//cash out Agent
const cashOut = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const type = transaction_interface_1.PayType.WITHDRAW;
    const payload = req.body;
    if (type !== payload.type) {
        throw new AppError_1.default(400, "Transaction type mismatch. Please try again.");
    }
    const { role, id: agentId } = req.user;
    const result = yield transaction_service_1.TransactionService.cashOut(payload, role, agentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.CREATED,
        success: true,
        message: "Cash-out complete Successful",
        data: result,
    });
}));
//cash out Agent
const getTransactionSummary = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id: agentId } = req.user;
    const result = yield transaction_service_1.TransactionService.getTransactionSummary(agentId);
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Get Agent Summary Successfully",
        data: result,
    });
}));
//cash out Agent
const getAllTransactionVolume = (0, catchAsync_1.catchAsync)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield transaction_service_1.TransactionService.getAllTransactionVolume();
    (0, sendResponse_1.sendResponse)(res, {
        statusCode: http_status_codes_1.default.OK,
        success: true,
        message: "Get All Volume Successfully",
        data: result,
    });
}));
exports.TransactionController = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getTransactionHistory,
    getAllTransactionHistory,
    cashIn,
    cashOut,
    getTransactionSummary,
    getAllTransactionVolume,
};
