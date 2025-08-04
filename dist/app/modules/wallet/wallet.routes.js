"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const wallet_controller_1 = require("./wallet.controller");
const walletRoute = express_1.default.Router();
walletRoute.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), wallet_controller_1.WalletController.getAllWalletsByRole);
walletRoute.get("/me", (0, checkAuth_1.checkAuth)(user_interface_1.Role.AGENT, user_interface_1.Role.USER), wallet_controller_1.WalletController.getMeWallet);
walletRoute.patch("/block/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), wallet_controller_1.WalletController.blockWallet);
walletRoute.patch("/unblock/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), wallet_controller_1.WalletController.unblockWallet);
exports.default = walletRoute;
