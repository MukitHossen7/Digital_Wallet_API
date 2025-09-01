import { JwtPayload } from "jsonwebtoken";
import config from "../config";
import { IsActive, IUser } from "../modules/user/user.interface";
import { generateToken, verifyToken } from "./jwt";
import { User } from "../modules/user/user.model";
import AppError from "../errorHelpers/AppError";
import httpStatus from "http-status-codes";

export const createUserTokens = (user: Partial<IUser>) => {
  const tokenPayload = {
    email: user.email,
    role: user.role,
    id: user._id,
  };

  const accessToken = generateToken(
    tokenPayload,
    config.JWT.JWT_ACCESS_SECRET,
    config.JWT.JWT_ACCESS_EXPIRATION
  );

  const refreshToken = generateToken(
    tokenPayload,
    config.JWT.JWT_REFRESH_SECRET,
    config.JWT.JWT_REFRESH_EXPIRATION
  );
  return {
    accessToken,
    refreshToken,
  };
};

export const createNewAccessTokenUseRefreshToken = async (
  refreshToken: string
) => {
  const verifiedRefreshToken = verifyToken(
    refreshToken,
    config.JWT.JWT_REFRESH_SECRET as string
  ) as JwtPayload;

  const isExistUser = await User.findOne({ email: verifiedRefreshToken.email });
  if (!isExistUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist");
  }

  if (
    isExistUser.isActive === IsActive.BLOCKED ||
    isExistUser.isActive === IsActive.SUSPENDED
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is blocked or inactive"
    );
  }

  if (isExistUser.isDeleted === true) {
    throw new AppError(httpStatus.FORBIDDEN, "Your account is deleted");
  }

  const tokenPayload = {
    email: isExistUser.email,
    role: isExistUser.role,
    id: isExistUser._id,
  };

  const accessToken = generateToken(
    tokenPayload,
    config.JWT.JWT_ACCESS_SECRET as string,
    config.JWT.JWT_ACCESS_EXPIRATION as string
  );

  return {
    accessToken,
  };
};
