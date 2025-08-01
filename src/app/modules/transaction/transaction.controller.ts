import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { TransactionService } from "./transaction.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";

const addMoney = catchAsync(async (req: Request, res: Response) => {
  const addMoney = await TransactionService.addMoney(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Add Money successfully",
    data: addMoney,
  });
});

export const TransactionController = {
  addMoney,
};
