import AppError from "../../errorHelpers/AppError";
import { IUser } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import config from "../../config";
import { Wallet } from "../wallet/wallet.model";

const createUser = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const { email, password, ...rest } = payload;
    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }

    const hashPassword = await bcrypt.hash(
      password as string,
      Number(config.BCRYPT_SALT_ROUNDS)
    );
    const user = await User.create(
      [
        {
          email,
          password: hashPassword,
          ...rest,
        },
      ],
      { session }
    );

    const existingWallet = await Wallet.findOne({
      user: user[0]._id,
    });
    if (existingWallet) {
      throw new AppError(
        httpStatus.CONFLICT,
        "Wallet already exists for this user"
      );
    }

    await Wallet.create(
      [
        {
          user: user[0]._id,
          balance: 50,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return user;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

export const UserServices = {
  createUser,
};
