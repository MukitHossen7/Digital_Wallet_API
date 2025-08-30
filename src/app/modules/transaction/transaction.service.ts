import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import { ITransaction, PayStatus } from "./transaction.interface";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { IsActive, Role } from "../user/user.interface";
import { User } from "../user/user.model";
import mongoose from "mongoose";

// add money
const addMoney = async (
  payload: ITransaction,
  role: string,
  userId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const isAgent = await User.findOne({
      email: payload.email,
      role: Role.AGENT,
    });
    if (!isAgent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (isAgent.isDeleted === true) {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
    }
    if (
      isAgent.isActive === IsActive.BLOCKED ||
      isAgent.isActive === IsActive.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Your account is ${isAgent?.isActive}`
      );
    }
    const isAgentWallet = await Wallet.findOne({ user: isAgent._id });
    if (!isAgentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    if (isAgentWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }
    if (isAgentWallet.balance < payload.amount) {
      throw new AppError(400, "Insufficient balance in agent wallet.");
    }
    const isWallet = await Wallet.findOne({
      user: userId,
    });
    if (!isWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (isWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }
    await Wallet.updateOne(
      { _id: isWallet._id },

      { $inc: { balance: payload.amount } },

      { new: true, runValidators: true, session }
    );

    await Wallet.updateOne(
      { _id: isAgentWallet._id },
      { $inc: { balance: -payload.amount } },
      { new: true, runValidators: true, session }
    );

    const addMoneyTransaction = await Transaction.create(
      [
        {
          amount: payload.amount,
          type: payload.type,
          wallet: isWallet._id,
          senderId: isAgent._id,
          receiverId: userId,
          initiatedBy: role,
          status: PayStatus.COMPLETED,
        },
      ],
      {
        session,
      }
    );
    await session.commitTransaction();
    session.endSession();
    return addMoneyTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// with draw money
const withdrawMoney = async (
  payload: ITransaction,
  role: string,
  userId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const isAgent = await User.findOne({
      email: payload.email,
      role: Role.AGENT,
    });
    if (!isAgent) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent not found");
    }

    if (isAgent.isDeleted === true) {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
    }
    if (
      isAgent.isActive === IsActive.BLOCKED ||
      isAgent.isActive === IsActive.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Your account is ${isAgent?.isActive}`
      );
    }
    const isAgentWallet = await Wallet.findOne({ user: isAgent._id });
    if (!isAgentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    if (isAgentWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }
    const isWallet = await Wallet.findOne({ user: userId });
    if (!isWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (isWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }

    if (isWallet.balance < payload?.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance. Your balance is ${isWallet.balance}, but you need ${payload?.amount} including transaction charges.`
      );
    }

    await Wallet.findByIdAndUpdate(
      isWallet._id,
      {
        $set: {
          balance: isWallet.balance - payload?.amount,
        },
      },
      { new: true, runValidators: true, session }
    );
    const agentBalance = payload.amount - (payload?.fee || 0);
    await Wallet.findByIdAndUpdate(
      isAgentWallet._id,
      {
        $set: {
          balance: isAgentWallet.balance + agentBalance,
        },
      },
      { new: true, runValidators: true, session }
    );
    const withdrawMoneyTransaction = await Transaction.create(
      [
        {
          amount: payload.amount,
          type: payload.type,
          initiatedBy: role,
          wallet: isWallet._id,
          senderId: userId,
          receiverId: isAgent._id,
          fee: payload.fee,
          status: PayStatus.COMPLETED,
        },
      ],
      {
        session,
      }
    );
    await session.commitTransaction();
    session.endSession();
    return withdrawMoneyTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// send money
const sendMoney = async (
  payload: ITransaction,
  role: string,
  userId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const isSenderWallet = await Wallet.findOne({ user: userId });
    if (!isSenderWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (isSenderWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }
    // const { totalAmount, fee } = calculateBySendMoneyFee(payload.amount);

    const isReceiverUser = await User.findOne({
      email: payload.email,
      role: Role.USER,
    });
    if (!isReceiverUser) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver email not found");
    }
    if (userId === isReceiverUser?._id.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "You cannot send money to yourself."
      );
    }
    if (isReceiverUser.isDeleted === true) {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
    }
    if (
      isReceiverUser.isActive === IsActive.BLOCKED ||
      isReceiverUser.isActive === IsActive.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Your account is ${isReceiverUser?.isActive}`
      );
    }
    const isReceiverWallet = await Wallet.findOne({ user: isReceiverUser._id });
    if (!isReceiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
    }
    if (isReceiverWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }

    if (isSenderWallet.balance < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance: Your wallet balance is ${isSenderWallet.balance}, but you need ${payload.amount} including fees to send money.`
      );
    }

    await Wallet.findByIdAndUpdate(
      isSenderWallet._id,
      {
        $set: {
          balance: isSenderWallet.balance - payload.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const receiverAmount = payload.amount - (payload.fee ?? 0);
    await Wallet.findByIdAndUpdate(
      isReceiverWallet._id,
      {
        $set: {
          balance: isReceiverWallet.balance + receiverAmount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const withdrawMoneyTransaction = await Transaction.create(
      [
        {
          amount: payload.amount,
          type: payload.type,
          initiatedBy: role,
          wallet: isSenderWallet._id,
          fee: payload.fee,
          senderId: userId,
          receiverId: isReceiverUser._id,
          status: PayStatus.COMPLETED,
        },
      ],
      {
        session,
      }
    );
    await session.commitTransaction();
    session.endSession();
    return withdrawMoneyTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//get Transaction History by me
const getTransactionHistory = async (userId: string, query: any) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const sort = (query.sort as string) || "-createdAt";

  const filter: any = {
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
  const transactions = await Transaction.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const totalDocuments = await Transaction.countDocuments(filter);
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
};

//get Transaction History
const getAllTransactionHistory = async () => {
  const getAllTransaction = await Transaction.find();
  if (getAllTransaction.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No transaction history found");
  }
  return getAllTransaction;
};

//agent cash in
const cashIn = async (payload: ITransaction, role: string, agentId: string) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const AGENT_COMMISSION_PERCENT = 1;
    const isUser = await User.findOne({ email: payload.email, role: "USER" });
    if (!isUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }
    if (isUser.isDeleted === true) {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
    }
    if (
      isUser.isActive === IsActive.BLOCKED ||
      isUser.isActive === IsActive.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Your account is ${isUser?.isActive}`
      );
    }
    const userWallet = await Wallet.findOne({ user: isUser._id });
    if (!userWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
    }

    const agentWallet = await Wallet.findOne({ user: agentId });
    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    if (agentWallet.isBlocked) {
      throw new AppError(httpStatus.FORBIDDEN, "Agent wallet is blocked");
    }

    if (agentWallet.balance < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance. You have ${agentWallet.balance}, need ${payload.amount}`
      );
    }

    await Wallet.findByIdAndUpdate(
      agentWallet._id,
      {
        $inc: { balance: -payload.amount },
      },
      { new: true, session, runValidators: true }
    );

    await Wallet.findByIdAndUpdate(
      userWallet._id,
      {
        $inc: { balance: payload.amount },
      },
      { new: true, session, runValidators: true }
    );

    const commission = (AGENT_COMMISSION_PERCENT / 100) * payload.amount;

    const transaction = await Transaction.create(
      [
        {
          amount: payload.amount,
          type: payload.type,
          senderId: agentId,
          receiverId: isUser._id,
          wallet: userWallet._id,
          initiatedBy: role,
          commission,
          status: PayStatus.COMPLETED,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    return transaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

//agent cash out
const cashOut = async (
  payload: ITransaction,
  role: string,
  agentId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const AGENT_COMMISSION_PERCENT = 1;
    const isUser = await User.findOne({ email: payload.email, role: "USER" });
    if (!isUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    if (isUser.isDeleted === true) {
      throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
    }
    if (
      isUser.isActive === IsActive.BLOCKED ||
      isUser.isActive === IsActive.SUSPENDED
    ) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        `Your account is ${isUser?.isActive}`
      );
    }

    if (isUser._id.toString() === agentId.toString()) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Agent cannot cash-out from self."
      );
    }
    const userWallet = await Wallet.findOne({
      user: isUser._id,
    });
    if (!userWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    if (userWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "User wallet is blocked. No transaction is allowed."
      );
    }
    // const { totalAmount, fee } = calculateTotalWithFee(payload?.amount);

    if (userWallet.balance < payload.amount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance. Your balance is ${userWallet.balance}, but you need ${payload.amount} including transaction charges.`
      );
    }

    await Wallet.findByIdAndUpdate(
      userWallet._id,
      {
        $inc: {
          balance: -payload?.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const agentWallet = await Wallet.findOne({ user: agentId });
    if (!agentWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
    }
    if (agentWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "Agent wallet is blocked. No transaction is allowed."
      );
    }
    const agentAmount = payload.amount - (payload?.fee ?? 0);
    await Wallet.findByIdAndUpdate(
      agentWallet._id,
      {
        $set: {
          balance: agentWallet.balance + agentAmount,
        },
      },
      { new: true, runValidators: true, session }
    );
    const commission = (AGENT_COMMISSION_PERCENT / 100) * agentAmount;
    const cashOutTransaction = await Transaction.create(
      [
        {
          amount: payload.amount,
          type: payload.type,
          senderId: isUser._id,
          receiverId: agentId,
          wallet: userWallet._id,
          initiatedBy: role,
          commission,
          fee: payload.fee,
          status: PayStatus.COMPLETED,
        },
      ],
      {
        session,
      }
    );
    await session.commitTransaction();
    session.endSession();
    return cashOutTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getTransactionSummary = async (agentId: string) => {
  const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const last7DaysSummaryPromise = Transaction.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(agentId) },
          { receiverId: new mongoose.Types.ObjectId(agentId) },
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

  const weeklyGraphPromise = Transaction.aggregate([
    {
      $match: {
        $or: [
          { senderId: new mongoose.Types.ObjectId(agentId) },
          { receiverId: new mongoose.Types.ObjectId(agentId) },
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
  const recentActivityPromise = Transaction.find({
    $or: [{ senderId: agentId }, { receiverId: agentId }],
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const [last7DaysSummary, weeklyGraph, recentActivity] = await Promise.all([
    last7DaysSummaryPromise,
    weeklyGraphPromise,
    recentActivityPromise,
  ]);
  return {
    last7DaysSummary,
    weeklyGraph,
    recentActivity,
  };
};

const getAllTransactionVolume = async () => {
  const result = await Transaction.aggregate([
    {
      $group: {
        _id: null,
        totalVolume: {
          $sum: "$amount",
        },
      },
    },
  ]);
  return result[0]?.totalVolume || 0;
};

export const TransactionService = {
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
