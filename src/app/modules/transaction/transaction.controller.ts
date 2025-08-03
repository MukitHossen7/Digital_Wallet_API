import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { PayType } from "./transaction.interface";
import AppError from "../../errorHelpers/AppError";

// add money
const addMoney = catchAsync(async (req: Request, res: Response) => {
  const type = PayType.ADD_MONEY;
  const { role, id: userId } = req.user;
  const addMoney = await TransactionService.addMoney(
    req.body,
    type,
    role,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Add Money successfully",
    data: addMoney,
  });
});

//withdraw Money
const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
  const type = PayType.WITHDRAW;
  const { role, id: userId } = req.user;
  const withdrawMoney = await TransactionService.withdrawMoney(
    req.body,
    type,
    role,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Money withdraw successfully",
    data: withdrawMoney,
  });
});

//send Money
const sendMoney = catchAsync(async (req: Request, res: Response) => {
  const type = PayType.SEND_MONEY;
  const { role, id: userId } = req.user;
  const sendMoney = await TransactionService.sendMoney(
    req.body,
    type,
    role,
    userId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Send Money successfully",
    data: sendMoney,
  });
});

//get Transaction History by me
const getTransactionHistory = catchAsync(
  async (req: Request, res: Response) => {
    const { id: userId } = req.user;
    const getTransaction = await TransactionService.getTransactionHistory(
      userId
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Retrieve Transaction History successfully",
      data: getTransaction,
    });
  }
);

//get Transaction History by admin
const getAllTransactionHistoryByRole = catchAsync(
  async (req: Request, res: Response) => {
    const role = req.query.role as string;
    if (!role) {
      throw new AppError(400, "Role query parameter is required");
    }
    const getAllTransaction =
      await TransactionService.getAllTransactionHistoryByRole(
        role.toUpperCase()
      );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: `All Transaction History for role ${role} Retrieved Successfully`,
      data: getAllTransaction,
    });
  }
);

//cash in Agent
const cashIn = catchAsync(async (req: Request, res: Response) => {
  const type = PayType.ADD_MONEY;
  const { role, id: agentId } = req.user;
  const result = await TransactionService.cashIn(req.body, type, role, agentId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Cash in successfully",
    data: result,
  });
});

//cash out Agent
const cashOut = catchAsync(async (req: Request, res: Response) => {
  const type = PayType.WITHDRAW;
  const { role, id: agentId } = req.user;
  const result = await TransactionService.cashOut(
    req.body,
    type,
    role,
    agentId
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Cash-out Successful",
    data: result,
  });
});

export const TransactionController = {
  addMoney,
  withdrawMoney,
  sendMoney,
  getTransactionHistory,
  getAllTransactionHistoryByRole,
  cashIn,
  cashOut,
};
