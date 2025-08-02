import { Wallet } from "./wallet.model";

//get all wallets
const getAllWallets = async () => {
  const wallets = await Wallet.find();
  return wallets;
};

const getMeWallet = async (id: string) => {
  const wallet = await Wallet.findOne({ user: id });
  return wallet;
};

export const WalletServices = {
  getAllWallets,
  getMeWallet,
};
