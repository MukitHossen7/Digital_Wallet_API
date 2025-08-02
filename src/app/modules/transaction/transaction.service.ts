import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import { ITransaction } from "./transaction.interface";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { calculateTotalWithFee } from "../../utils/calculateTotalWithFee";
import { calculateBySendMoneyFee } from "../../utils/calculateBySendMoneyFee";

// add money
const addMoney = async (
  payload: ITransaction,
  type: string,
  role: string,
  userId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
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
    await Wallet.findByIdAndUpdate(
      isWallet._id,
      {
        $set: {
          balance: isWallet.balance + payload.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const addMoneyTransaction = await Transaction.create(
      [{ ...payload, type, initiatedBy: role, wallet: isWallet._id }],
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
  type: string,
  role: string,
  userId: string
) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
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
    const { totalAmount, fee } = calculateTotalWithFee(payload.amount);

    if (isWallet.balance < totalAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance. Your balance is ${isWallet.balance}, but you need ${totalAmount} including transaction charges.`
      );
    }

    await Wallet.findByIdAndUpdate(
      isWallet._id,
      {
        $set: {
          balance: isWallet.balance - totalAmount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const withdrawMoneyTransaction = await Transaction.create(
      [{ ...payload, type, initiatedBy: role, wallet: isWallet._id, fee }],
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
  type: string,
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
    const { totalAmount, fee } = calculateBySendMoneyFee(payload.amount);

    if (isSenderWallet.balance < totalAmount) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        `Insufficient balance: Your wallet balance is ${isSenderWallet.balance}, but you need ${totalAmount} including fees to send money.`
      );
    }

    await Wallet.findByIdAndUpdate(
      isSenderWallet._id,
      {
        $set: {
          balance: isSenderWallet.balance - totalAmount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const isReceiverWallet = await Wallet.findOne({ user: payload.receiverId });
    if (!isReceiverWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Receiver wallet not found");
    }
    if (isReceiverWallet.isBlocked === true) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "This wallet is blocked. No transaction is allowed."
      );
    }

    await Wallet.findByIdAndUpdate(
      isReceiverWallet._id,
      {
        $set: {
          balance: isReceiverWallet.balance + payload.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const withdrawMoneyTransaction = await Transaction.create(
      [
        {
          ...payload,
          type,
          initiatedBy: role,
          wallet: isSenderWallet._id,
          fee,
          senderId: userId,
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
const getTransactionHistory = async (userId: string) => {
  const isWallet = await Wallet.findOne({ user: userId });
  if (!isWallet) {
    throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
  }
  const transactionHistory = await Transaction.find({ wallet: isWallet._id });
  if (transactionHistory.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No transaction history found");
  }
  return transactionHistory;
};

//get Transaction History by me
const getAllTransactionHistory = async () => {
  const getAllTransaction = await Transaction.find();
  if (getAllTransaction.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, "No transaction history found");
  }
  return getAllTransaction;
};

export const TransactionService = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionHistory,
  getAllTransactionHistory,
};
