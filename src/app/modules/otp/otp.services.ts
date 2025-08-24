import crypto from "crypto";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { redisClient } from "../../config/redis.config";

const OTP_EXPIRATION = 2 * 60;

const generateOtp = (length = 6) => {
  const opt = crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  return opt;
};

const sendOTP = async (email: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user.isVerified) {
    throw new AppError(401, "You are already verified");
  }
  const opt = generateOtp();
  const redisKey = `opt:${email}`;
  await redisClient.set(redisKey, opt, {
    expiration: {
      type: "EX",
      value: OTP_EXPIRATION,
    },
  });
};
const verifyOTP = async () => {};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
