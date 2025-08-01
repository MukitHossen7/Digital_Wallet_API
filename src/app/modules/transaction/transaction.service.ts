import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import { ITransaction } from "./transaction.interface";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";
import { calculateTotalWithFee } from "../../utils/calculateTotalWithFee";

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

export const TransactionService = {
  addMoney,
  withdrawMoney,
};
