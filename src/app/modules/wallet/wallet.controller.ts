import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { WalletServices } from "./wallet.service";
import { JwtPayload } from "jsonwebtoken";

//get all wallets
const getAllWallets = catchAsync(async (req: Request, res: Response) => {
  const wallets = await WalletServices.getAllWallets();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All Wallet Retrieved Successfully",
    data: wallets,
  });
});

const getMeWallet = catchAsync(async (req: Request, res: Response) => {
  const decoded = req.user as JwtPayload;
  const wallets = await WalletServices.getMeWallet(decoded.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Your Wallet Retrieved Successfully",
    data: wallets,
  });
});

export const WalletController = {
  getAllWallets,
  getMeWallet,
};
