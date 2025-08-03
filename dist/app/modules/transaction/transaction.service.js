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
exports.TransactionService = void 0;
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const wallet_model_1 = require("../wallet/wallet.model");
const transaction_interface_1 = require("./transaction.interface");
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const transaction_model_1 = require("./transaction.model");
const calculateTotalWithFee_1 = require("../../utils/calculateTotalWithFee");
const calculateBySendMoneyFee_1 = require("../../utils/calculateBySendMoneyFee");
// add money
const addMoney = (payload, type, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const isWallet = yield wallet_model_1.Wallet.findOne({
            user: userId,
        });
        if (!isWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (isWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isWallet._id, {
            $set: {
                balance: isWallet.balance + payload.amount,
            },
        }, { new: true, runValidators: true, session });
        const addMoneyTransaction = yield transaction_model_1.Transaction.create([
            Object.assign(Object.assign({}, payload), { type, wallet: isWallet._id, senderId: userId, initiatedBy: role, status: transaction_interface_1.PayStatus.COMPLETED }),
        ], {
            session,
        });
        yield session.commitTransaction();
        session.endSession();
        return addMoneyTransaction;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// with draw money
const withdrawMoney = (payload, type, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const isWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
        if (!isWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (isWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        const { totalAmount, fee } = (0, calculateTotalWithFee_1.calculateTotalWithFee)(payload.amount);
        if (isWallet.balance < totalAmount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance. Your balance is ${isWallet.balance}, but you need ${totalAmount} including transaction charges.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isWallet._id, {
            $set: {
                balance: isWallet.balance - totalAmount,
            },
        }, { new: true, runValidators: true, session });
        const withdrawMoneyTransaction = yield transaction_model_1.Transaction.create([
            Object.assign(Object.assign({}, payload), { type, initiatedBy: role, wallet: isWallet._id, senderId: userId, fee, status: transaction_interface_1.PayStatus.COMPLETED }),
        ], {
            session,
        });
        yield session.commitTransaction();
        session.endSession();
        return withdrawMoneyTransaction;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
// send money
const sendMoney = (payload, type, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const isSenderWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
        if (!isSenderWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (isSenderWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        const { totalAmount, fee } = (0, calculateBySendMoneyFee_1.calculateBySendMoneyFee)(payload.amount);
        if (isSenderWallet.balance < totalAmount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance: Your wallet balance is ${isSenderWallet.balance}, but you need ${totalAmount} including fees to send money.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isSenderWallet._id, {
            $set: {
                balance: isSenderWallet.balance - totalAmount,
            },
        }, { new: true, runValidators: true, session });
        const isReceiverWallet = yield wallet_model_1.Wallet.findOne({ user: payload.receiverId });
        if (!isReceiverWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver wallet not found");
        }
        if (isReceiverWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isReceiverWallet._id, {
            $set: {
                balance: isReceiverWallet.balance + payload.amount,
            },
        }, { new: true, runValidators: true, session });
        const withdrawMoneyTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type,
                initiatedBy: role,
                wallet: isSenderWallet._id,
                fee,
                senderId: userId,
                receiverId: payload.receiverId,
                status: transaction_interface_1.PayStatus.COMPLETED,
            },
        ], {
            session,
        });
        yield session.commitTransaction();
        session.endSession();
        return withdrawMoneyTransaction;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
//get Transaction History by me
const getTransactionHistory = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // const isWallet = await Wallet.findOne({ user: userId });
    // if (!isWallet) {
    //   throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    // }
    // const transactionHistory = await Transaction.find({ wallet: isWallet._id });
    const transactions = yield transaction_model_1.Transaction.find({
        $or: [{ senderId: userId }, { receiverId: userId }],
    })
        .populate("senderId", "name email")
        .populate("receiverId", "name email")
        .sort({ createdAt: -1 });
    if (transactions.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No transaction history found");
    }
    return transactions;
});
//get Transaction History
const getAllTransactionHistory = () => __awaiter(void 0, void 0, void 0, function* () {
    const getAllTransaction = yield transaction_model_1.Transaction.find();
    if (getAllTransaction.length === 0) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "No transaction history found");
    }
    return getAllTransaction;
});
//agent cash in
const cashIn = (payload, type, role, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const AGENT_COMMISSION_PERCENT = 1;
        const userWallet = yield wallet_model_1.Wallet.findOne({ user: payload.receiverId });
        if (!userWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (userWallet.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet is blocked");
        }
        const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentId });
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
        }
        if (agentWallet.isBlocked) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent wallet is blocked");
        }
        if (agentWallet.balance < payload.amount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance. You have ${agentWallet.balance}, need ${payload.amount}`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(agentWallet._id, {
            $inc: { balance: -payload.amount },
        }, { new: true, session, runValidators: true });
        yield wallet_model_1.Wallet.findByIdAndUpdate(userWallet._id, {
            $inc: { balance: payload.amount },
        }, { new: true, session, runValidators: true });
        const commission = (AGENT_COMMISSION_PERCENT / 100) * payload.amount;
        const transaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type,
                senderId: agentId,
                receiverId: payload.receiverId,
                wallet: userWallet._id,
                initiatedBy: role,
                commission,
                status: transaction_interface_1.PayStatus.COMPLETED,
            },
        ], { session });
        yield session.commitTransaction();
        session.endSession();
        return transaction;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
//agent cash out
const cashOut = (payload, type, role, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const AGENT_COMMISSION_PERCENT = 1;
        const userWallet = yield wallet_model_1.Wallet.findOne({
            user: payload.senderId,
        });
        if (!userWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (userWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet is blocked. No transaction is allowed.");
        }
        const { totalAmount, fee } = (0, calculateTotalWithFee_1.calculateTotalWithFee)(payload === null || payload === void 0 ? void 0 : payload.amount);
        if (userWallet.balance < totalAmount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance. Your balance is ${userWallet.balance}, but you need ${totalAmount} including transaction charges.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(userWallet._id, {
            $inc: {
                balance: -totalAmount,
            },
        }, { new: true, runValidators: true, session });
        const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentId });
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
        }
        if (agentWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent wallet is blocked. No transaction is allowed.");
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(agentWallet._id, {
            $set: {
                balance: agentWallet.balance + payload.amount,
            },
        }, { new: true, runValidators: true, session });
        const commission = (AGENT_COMMISSION_PERCENT / 100) * payload.amount;
        const cashOutTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type,
                senderId: payload.senderId,
                receiverId: agentId,
                wallet: userWallet._id,
                initiatedBy: role,
                commission,
                fee,
                status: transaction_interface_1.PayStatus.COMPLETED,
            },
        ], {
            session,
        });
        yield session.commitTransaction();
        session.endSession();
        return cashOutTransaction;
    }
    catch (error) {
        yield session.abortTransaction();
        session.endSession();
        throw error;
    }
});
exports.TransactionService = {
    addMoney,
    withdrawMoney,
    sendMoney,
    getTransactionHistory,
    getAllTransactionHistory,
    cashIn,
    cashOut,
};
