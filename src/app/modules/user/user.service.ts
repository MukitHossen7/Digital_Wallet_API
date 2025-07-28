import AppError from "../../errorHelpers/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import config from "../../config";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;
  const isExistUser = await User.findOne({ email });

  if (isExistUser) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashPassword = await bcrypt.hash(
    password as string,
    Number(config.BCRYPT_SALT_ROUNDS)
  );
  const user = await User.create({
    email,
    password: hashPassword,
    ...rest,
  });
  return user;
};

export const UserServices = {
  createUser,
};
