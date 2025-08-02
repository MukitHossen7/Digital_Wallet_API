import express from "express";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { WalletController } from "./wallet.controller";

const walletRoute = express.Router();

walletRoute.get("/", checkAuth(Role.ADMIN), WalletController.getAllWallets);
walletRoute.get(
  "/me",
  checkAuth(Role.AGENT, Role.USER),
  WalletController.getMeWallet
);

export default walletRoute;
