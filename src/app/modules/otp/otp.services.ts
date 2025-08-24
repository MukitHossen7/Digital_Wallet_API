import crypto from "crypto";
import { User } from "../user/user.model";
import AppError from "../../errorHelpers/AppError";
import httpStatus from "http-status-codes";
import { redisClient } from "../../config/redis.config";
import { sendMail } from "../../utils/sendEmail";

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
  await sendMail({
    to: email,
    subject: "Your OTP Code",
    templateName: "otp",
    templateData: {
      name: user.name,
      otp: opt,
    },
  });
};
const verifyOTP = async (email: string, otp: string) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "user not found");
  }
  if (user.isVerified) {
    throw new AppError(401, "You are already verified");
  }
  const redisKey = `opt:${email}`;
  const saveOtp = await redisClient.get(redisKey);
  if (!saveOtp) {
    throw new AppError(401, "Invalid OTP");
  }
  if (saveOtp !== otp) {
    throw new AppError(401, "Invalid OTP");
  }

  await Promise.all([
    User.updateOne({ email: email }, { isVerified: true }),
    redisClient.del(redisKey),
  ]);
};

export const OTPService = {
  sendOTP,
  verifyOTP,
};
