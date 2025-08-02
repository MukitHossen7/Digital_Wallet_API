import AppError from "../../errorHelpers/AppError";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";

//get all wallets
const getAllWallets = async () => {
  const wallets = await Wallet.find();
  return wallets;
};

const getMeWallet = async (id: string) => {
  const wallet = await Wallet.findOne({ user: id });

  if (wallet?.isBlocked === true) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This wallet is blocked. You can not see Wallet."
    );
  }
  return wallet;
};

export const WalletServices = {
  getAllWallets,
  getMeWallet,
};
