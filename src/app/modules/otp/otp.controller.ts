import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { OTPService } from "./otp.services";

const sendOTP = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  await OTPService.sendOTP(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Send OTP successfully",
    data: null,
  });
});

const verifyOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  await OTPService.verifyOTP(email, otp);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "OTP Verify successfully",
    data: null,
  });
});

export const OTPController = {
  sendOTP,
  verifyOTP,
};
