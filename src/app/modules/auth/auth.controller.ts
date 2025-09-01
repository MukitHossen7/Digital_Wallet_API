import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status-codes";
import { catchAsync } from "../../utils/catchAsync";
import { setAuthCookie } from "../../utils/setCookie";
import config from "../../config";
import passport from "passport";
import AppError from "../../errorHelpers/AppError";
import { createUserTokens } from "../../utils/userToken";
import { JwtPayload } from "jsonwebtoken";
import { AuthService } from "./auth.service";

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

const googleLogin = catchAsync(async (req: Request, res: Response) => {
  let redirectUrl = req.query.state ? (req.query.state as string) : "";
  if (redirectUrl.startsWith("/")) {
    redirectUrl = redirectUrl.slice(1);
  }
  const user = req.user;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const tokenInfo = createUserTokens(user);
  setAuthCookie(res, tokenInfo);
  res.redirect(`${config.FRONTEND_URL}/${redirectUrl}`);
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const decodedToken = req.user as JwtPayload;
  if (!decodedToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid token");
  }
  const newPassword = req.body.newPassword;
  const oldPassword = req.body.oldPassword;

  await AuthService.changePassword(decodedToken, newPassword, oldPassword);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password change Successfully",
    data: null,
  });
});

const createNewAccessToken = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
    }
    const tokenInfo = await AuthService.createNewAccessToken(
      refreshToken as string
    );

    setAuthCookie(res, tokenInfo);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "New Access Token Retrieved Successfully",
      data: tokenInfo,
    });
  }
);

export const AuthController = {
  createLogin,
  logOutUser,
  googleLogin,
  changePassword,
  createNewAccessToken,
};
