import AppError from "../../errorHelpers/AppError";
import { Wallet } from "../wallet/wallet.model";
import { ITransaction } from "./transaction.interface";
import httpStatus from "http-status-codes";
import { Transaction } from "./transaction.model";

const addMoney = async (payload: ITransaction) => {
  const session = await Wallet.startSession();
  session.startTransaction();
  try {
    const isWallet = await Wallet.findById(payload.wallet);
    if (!isWallet) {
      throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
    }
    await Wallet.findByIdAndUpdate(
      payload.wallet,
      {
        $set: {
          balance: isWallet.balance + payload.amount,
        },
      },
      { new: true, runValidators: true, session }
    );

    const addMoneyTransaction = await Transaction.create([{ ...payload }], {
      session,
    });
    await session.commitTransaction();
    session.endSession();
    return addMoneyTransaction;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const TransactionService = {
  addMoney,
};
