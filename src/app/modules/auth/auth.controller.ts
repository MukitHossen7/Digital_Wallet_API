import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { setAuthCookie } from "../../utils/setCookie";
import config from "../../config";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userToken";

// user login
const createLogin = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return next(new AppError(401, info.message));
      }

      const userTokens = createUserTokens(user);
      const { password, ...rest } = user.toObject();
      setAuthCookie(res, userTokens);

      sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: {
          accessToken: userTokens.accessToken,
          refreshToken: userTokens.refreshToken,
          user: rest,
        },
      });
    })(req, res, next);
  }
);

// user logout
const logOutUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: config.NODE_ENV !== "development",
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: config.NODE_ENV !== "development",
      sameSite: "lax",
    });
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged out successfully",
      data: null,
    });
  }
);

export const AuthController = {
  createLogin,
  logOutUser,
};
