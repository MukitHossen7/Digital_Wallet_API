import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { AuthService } from "./auth.service";
import { catchAsync } from "../../utils/catchAsync";
import { setAuthCookie } from "../../utils/setCookie";

const createLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userInfo = await AuthService.createLogin(req.body);

    setAuthCookie(res, userInfo);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User Login Successfully",
      data: userInfo,
    });
  }
);

export const AuthController = {
  createLogin,
};
