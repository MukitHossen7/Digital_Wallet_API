import AppError from "../../errorHelpers/AppError";
import { IAuthsProviders, IsActive, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import httpStatus from "http-status-codes";
import bcrypt from "bcryptjs";
import config from "../../config";
import { Wallet } from "../wallet/wallet.model";
import { JwtPayload } from "jsonwebtoken";
import { deleteImageFromCLoudinary } from "../../config/cloudinary.config";

const createUser = async (payload: Partial<IUser>) => {
  const session = await User.startSession();
  session.startTransaction();
  try {
    const { email, password, ...rest } = payload;
    const isExistUser = await User.findOne({ email });

    if (isExistUser) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
    }

    const authProvider: IAuthsProviders = {
      provider: "credential",
      providerID: email as string,
    };
    const hashPassword = await bcrypt.hash(
      password as string,
      Number(config.BCRYPT_SALT_ROUNDS)
    );
    const user = await User.create(
      [
        {
          email,
          password: hashPassword,
          auths: [authProvider],
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

const getAllUserOrAgent = async (role: string) => {
  if (role !== Role.USER && role !== Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid role: ${role}`);
  }
  const users = await User.find({ role: role }).sort("-createdAt");
  return users;
};

const approveAgent = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isDeleted === true) {
    throw new AppError(httpStatus.FORBIDDEN, "This account is deleted");
  }

  if (user.role === Role.AGENT) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already an AGENT");
  }
  user.role = Role.AGENT;
  await user.save();
  return user;
};

const suspendAgent = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isDeleted === true) {
    throw new AppError(httpStatus.FORBIDDEN, "This account is deleted");
  }

  if (user.role === Role.USER) {
    throw new AppError(httpStatus.BAD_REQUEST, "User is already suspended");
  }
  user.role = Role.USER;
  await user.save();
  return user;
};

const getMe = async (id: string) => {
  const user = await User.findById(id).select("-password");
  return user;
};

const blockUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.isActive === "BLOCKED") {
    throw new AppError(403, "User account already blocked");
  }
  await User.findByIdAndUpdate(id, {
    $set: {
      isActive: IsActive.BLOCKED,
    },
  });
  return null;
};

const unBlockUser = async (id: string) => {
  const user = await User.findById(id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }
  if (user.isActive === "ACTIVE") {
    throw new AppError(403, "User account already Unblock");
  }
  await User.findByIdAndUpdate(id, {
    $set: {
      isActive: IsActive.ACTIVE,
    },
  });
  return null;
};

const updateUserProfile = async (
  payload: Partial<IUser>,
  decoded: JwtPayload
) => {
  const user = await User.findById(decoded.id);
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (payload.role) {
    if (decoded.role === Role.USER || decoded.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to change user roles"
      );
    }
  }

  if (payload.isActive || payload.isDeleted || payload.isVerified) {
    if (decoded.role === Role.USER || decoded.role === Role.AGENT) {
      throw new AppError(
        httpStatus.FORBIDDEN,
        "You do not have permission to change user roles"
      );
    }
  }
  const updateUser = await User.findByIdAndUpdate(decoded.id, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.picture && user.picture) {
    await deleteImageFromCLoudinary(user.picture);
  }
  return updateUser;
};

export const UserServices = {
  createUser,
  approveAgent,
  suspendAgent,
  getAllUserOrAgent,
  getMe,
  blockUser,
  unBlockUser,
  updateUserProfile,
};
