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
const user_interface_1 = require("../user/user.interface");
const user_model_1 = require("../user/user.model");
const mongoose_1 = __importDefault(require("mongoose"));
// add money
const addMoney = (payload, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const isAgent = yield user_model_1.User.findOne({
            email: payload.email,
            role: user_interface_1.Role.AGENT,
        });
        if (!isAgent) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
        }
        if (isAgent.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isAgent.isActive === user_interface_1.IsActive.BLOCKED ||
            isAgent.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isAgent === null || isAgent === void 0 ? void 0 : isAgent.isActive}`);
        }
        const isAgentWallet = yield wallet_model_1.Wallet.findOne({ user: isAgent._id });
        if (!isAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
        }
        if (isAgentWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        if (isAgentWallet.balance < payload.amount) {
            throw new AppError_1.default(400, "Insufficient balance in agent wallet.");
        }
        const isWallet = yield wallet_model_1.Wallet.findOne({
            user: userId,
        });
        if (!isWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (isWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        yield wallet_model_1.Wallet.updateOne({ _id: isWallet._id }, { $inc: { balance: payload.amount } }, { new: true, runValidators: true, session });
        yield wallet_model_1.Wallet.updateOne({ _id: isAgentWallet._id }, { $set: { balance: isAgentWallet.balance - payload.amount } }, { new: true, runValidators: true, session });
        const addMoneyTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type: payload.type,
                wallet: isWallet._id,
                senderId: isAgent._id,
                receiverId: userId,
                initiatedBy: role,
                status: transaction_interface_1.PayStatus.COMPLETED,
            },
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
const withdrawMoney = (payload, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const isAgent = yield user_model_1.User.findOne({
            email: payload.email,
            role: user_interface_1.Role.AGENT,
        });
        if (!isAgent) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent not found");
        }
        if (isAgent.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isAgent.isActive === user_interface_1.IsActive.BLOCKED ||
            isAgent.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isAgent === null || isAgent === void 0 ? void 0 : isAgent.isActive}`);
        }
        const isAgentWallet = yield wallet_model_1.Wallet.findOne({ user: isAgent._id });
        if (!isAgentWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
        }
        if (isAgentWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        const isWallet = yield wallet_model_1.Wallet.findOne({ user: userId });
        if (!isWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (isWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        if (isWallet.balance < (payload === null || payload === void 0 ? void 0 : payload.amount)) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance. Your balance is ${isWallet.balance}, but you need ${payload === null || payload === void 0 ? void 0 : payload.amount} including transaction charges.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isWallet._id, {
            $set: {
                balance: isWallet.balance - (payload === null || payload === void 0 ? void 0 : payload.amount),
            },
        }, { new: true, runValidators: true, session });
        const agentBalance = payload.amount - ((payload === null || payload === void 0 ? void 0 : payload.fee) || 0);
        yield wallet_model_1.Wallet.findByIdAndUpdate(isAgentWallet._id, {
            $set: {
                balance: isAgentWallet.balance + agentBalance,
            },
        }, { new: true, runValidators: true, session });
        const withdrawMoneyTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type: payload.type,
                initiatedBy: role,
                wallet: isWallet._id,
                senderId: userId,
                receiverId: isAgent._id,
                fee: payload.fee,
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
// send money
const sendMoney = (payload, role, userId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
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
        // const { totalAmount, fee } = calculateBySendMoneyFee(payload.amount);
        const isReceiverUser = yield user_model_1.User.findOne({
            email: payload.email,
            role: user_interface_1.Role.USER,
        });
        if (!isReceiverUser) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver email not found");
        }
        if (userId === (isReceiverUser === null || isReceiverUser === void 0 ? void 0 : isReceiverUser._id.toString())) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You cannot send money to yourself.");
        }
        if (isReceiverUser.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isReceiverUser.isActive === user_interface_1.IsActive.BLOCKED ||
            isReceiverUser.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isReceiverUser === null || isReceiverUser === void 0 ? void 0 : isReceiverUser.isActive}`);
        }
        const isReceiverWallet = yield wallet_model_1.Wallet.findOne({ user: isReceiverUser._id });
        if (!isReceiverWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Receiver wallet not found");
        }
        if (isReceiverWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "This wallet is blocked. No transaction is allowed.");
        }
        if (isSenderWallet.balance < payload.amount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance: Your wallet balance is ${isSenderWallet.balance}, but you need ${payload.amount} including fees to send money.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(isSenderWallet._id, {
            $set: {
                balance: isSenderWallet.balance - payload.amount,
            },
        }, { new: true, runValidators: true, session });
        const receiverAmount = payload.amount - ((_a = payload.fee) !== null && _a !== void 0 ? _a : 0);
        yield wallet_model_1.Wallet.findByIdAndUpdate(isReceiverWallet._id, {
            $set: {
                balance: isReceiverWallet.balance + receiverAmount,
            },
        }, { new: true, runValidators: true, session });
        const withdrawMoneyTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type: payload.type,
                initiatedBy: role,
                wallet: isSenderWallet._id,
                fee: payload.fee,
                senderId: userId,
                receiverId: isReceiverUser._id,
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
const getTransactionHistory = (userId, query) => __awaiter(void 0, void 0, void 0, function* () {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;
    const sort = query.sort || "-createdAt";
    const filter = {
        $or: [{ senderId: userId }, { receiverId: userId }],
    };
    if (query.type && query.type !== "all") {
        filter.type = query.type;
    }
    if (query.fromDate || query.toDate) {
        filter.createdAt = {};
        if (query.fromDate) {
            const from = new Date(query.fromDate);
            from.setHours(0, 0, 0, 0);
            filter.createdAt.$gte = from;
        }
        if (query.toDate) {
            // toDate পর্যন্ত day end
            const to = new Date(query.toDate);
            to.setHours(23, 59, 59, 999);
            filter.createdAt.$lte = to;
        }
    }
    const transactions = yield transaction_model_1.Transaction.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit);
    const totalDocuments = yield transaction_model_1.Transaction.countDocuments(filter);
    const totalPage = Math.ceil(totalDocuments / limit);
    if (transactions.length === 0) {
        return {
            meta: {
                page,
                limit,
                totalPage: 0,
                total: 0,
            },
            transactions: [],
        };
    }
    return {
        meta: {
            page,
            limit,
            totalPage,
            total: totalDocuments,
        },
        transactions,
    };
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
const cashIn = (payload, role, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const AGENT_COMMISSION_PERCENT = 1;
        const isUser = yield user_model_1.User.findOne({ email: payload.email, role: "USER" });
        if (!isUser) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        }
        if (isUser.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isUser.isActive === user_interface_1.IsActive.BLOCKED ||
            isUser.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isUser === null || isUser === void 0 ? void 0 : isUser.isActive}`);
        }
        const userWallet = yield wallet_model_1.Wallet.findOne({ user: isUser._id });
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
                type: payload.type,
                senderId: agentId,
                receiverId: isUser._id,
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
const cashOut = (payload, role, agentId) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const session = yield wallet_model_1.Wallet.startSession();
    session.startTransaction();
    try {
        const AGENT_COMMISSION_PERCENT = 1;
        const isUser = yield user_model_1.User.findOne({ email: payload.email, role: "USER" });
        if (!isUser) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User not found");
        }
        if (isUser.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isUser.isActive === user_interface_1.IsActive.BLOCKED ||
            isUser.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isUser === null || isUser === void 0 ? void 0 : isUser.isActive}`);
        }
        if (isUser._id.toString() === agentId.toString()) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Agent cannot cash-out from self.");
        }
        const userWallet = yield wallet_model_1.Wallet.findOne({
            user: isUser._id,
        });
        if (!userWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User wallet not found");
        }
        if (userWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "User wallet is blocked. No transaction is allowed.");
        }
        // const { totalAmount, fee } = calculateTotalWithFee(payload?.amount);
        if (userWallet.balance < payload.amount) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, `Insufficient balance. Your balance is ${userWallet.balance}, but you need ${payload.amount} including transaction charges.`);
        }
        yield wallet_model_1.Wallet.findByIdAndUpdate(userWallet._id, {
            $inc: {
                balance: -(payload === null || payload === void 0 ? void 0 : payload.amount),
            },
        }, { new: true, runValidators: true, session });
        const agentWallet = yield wallet_model_1.Wallet.findOne({ user: agentId });
        if (!agentWallet) {
            throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "Agent wallet not found");
        }
        if (agentWallet.isBlocked === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Agent wallet is blocked. No transaction is allowed.");
        }
        const agentAmount = payload.amount - ((_a = payload === null || payload === void 0 ? void 0 : payload.fee) !== null && _a !== void 0 ? _a : 0);
        yield wallet_model_1.Wallet.findByIdAndUpdate(agentWallet._id, {
            $set: {
                balance: agentWallet.balance + agentAmount,
            },
        }, { new: true, runValidators: true, session });
        const commission = (AGENT_COMMISSION_PERCENT / 100) * agentAmount;
        const cashOutTransaction = yield transaction_model_1.Transaction.create([
            {
                amount: payload.amount,
                type: payload.type,
                senderId: isUser._id,
                receiverId: agentId,
                wallet: userWallet._id,
                initiatedBy: role,
                commission,
                fee: payload.fee,
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
const getTransactionSummary = (agentId) => __awaiter(void 0, void 0, void 0, function* () {
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last7DaysSummaryPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [
                    { senderId: new mongoose_1.default.Types.ObjectId(agentId) },
                    { receiverId: new mongoose_1.default.Types.ObjectId(agentId) },
                ],
                createdAt: { $gte: last7Days },
                status: "COMPLETED",
            },
        },
        {
            $group: {
                _id: "$type",
                totalAmount: { $sum: "$amount" },
                count: { $sum: 1 },
            },
        },
    ]);
    const weeklyGraphPromise = transaction_model_1.Transaction.aggregate([
        {
            $match: {
                $or: [
                    { senderId: new mongoose_1.default.Types.ObjectId(agentId) },
                    { receiverId: new mongoose_1.default.Types.ObjectId(agentId) },
                ],
                status: "COMPLETED",
                createdAt: { $gte: last7Days },
            },
        },
        {
            $project: {
                type: 1,
                amount: 1,
                day: { $dayOfWeek: "$createdAt" },
            },
        },
        {
            $group: {
                _id: { day: "$day", type: "$type" },
                total: { $sum: "$amount" },
            },
        },
    ]);
    const recentActivityPromise = transaction_model_1.Transaction.find({
        $or: [{ senderId: agentId }, { receiverId: agentId }],
    })
        .sort({ createdAt: -1 })
        .limit(5);
    const [last7DaysSummary, weeklyGraph, recentActivity] = yield Promise.all([
        last7DaysSummaryPromise,
        weeklyGraphPromise,
        recentActivityPromise,
    ]);
    return {
        last7DaysSummary,
        weeklyGraph,
        recentActivity,
    };
});
const getAllTransactionVolume = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const result = yield transaction_model_1.Transaction.aggregate([
        {
            $group: {
                _id: null,
                totalVolume: {
                    $sum: "$amount",
                },
            },
        },
    ]);
    return ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalVolume) || 0;
});
exports.TransactionService = {
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
