import express from "express";
import { TransactionController } from "./transaction.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import { createTransactionZodSchema } from "./transaction.zod.validation";

const transactionRoute = express.Router();

transactionRoute.post(
  "/add-money",
  checkAuth(Role.USER),
  zodValidateRequest(createTransactionZodSchema),
  TransactionController.addMoney
);

transactionRoute.post(
  "/withdraw",
  checkAuth(Role.USER),
  zodValidateRequest(createTransactionZodSchema),
  TransactionController.withdrawMoney
);

export default transactionRoute;
