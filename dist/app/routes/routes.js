"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_routes_1 = __importDefault(require("../modules/user/user.routes"));
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const transaction_routes_1 = __importDefault(require("../modules/transaction/transaction.routes"));
const wallet_routes_1 = __importDefault(require("../modules/wallet/wallet.routes"));
const routes = (0, express_1.Router)();
routes.use("/users", user_routes_1.default);
routes.use("/auth", auth_routes_1.default);
routes.use("/transactions", transaction_routes_1.default);
routes.use("/wallets", wallet_routes_1.default);
exports.default = routes;
