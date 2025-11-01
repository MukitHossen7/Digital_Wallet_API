"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_model_1 = require("../user/user.model");
const AppError_1 = __importDefault(require("../../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const config_1 = __importDefault(require("../../config"));
const userToken_1 = require("../../utils/userToken");
const user_interface_1 = require("../user/user.interface");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../../utils/sendEmail");
const changePassword = (decodedToken, newPassword, oldPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findById(decodedToken.id);
    if (!isExistUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "ID does not exist");
    }
    if (oldPassword === newPassword) {
        throw new AppError_1.default(401, "Your password is same");
    }
    const isOldPasswordMatch = yield bcryptjs_1.default.compare(oldPassword, isExistUser.password);
    if (!isOldPasswordMatch) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Old password is incorrect");
    }
    isExistUser.password = yield bcryptjs_1.default.hash(newPassword, Number(config_1.default.BCRYPT_SALT_ROUNDS));
    isExistUser.save();
});
const createNewAccessToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const newAccessToken = yield (0, userToken_1.createNewAccessTokenUseRefreshToken)(refreshToken);
    return {
        accessToken: newAccessToken.accessToken,
    };
});
const setPassword = (decodedToken, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_model_1.User.findById(decodedToken.id);
    if (!user) {
        throw new AppError_1.default(http_status_codes_1.default.NOT_FOUND, "User Not Found");
    }
    if (user.password &&
        user.auths.some((providerObj) => providerObj.provider === "google")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You have already set your password. Now you can change the password from your profile");
    }
    if (user.password &&
        user.auths.some((providerObj) => providerObj.provider === "credential")) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "You are not google login user");
    }
    const hashPassword = yield bcryptjs_1.default.hash(password, Number(config_1.default.BCRYPT_SALT_ROUNDS));
    const authProvider = {
        provider: "credential",
        providerID: user.email,
    };
    user.auths = [...user.auths, authProvider];
    user.password = hashPassword;
    yield user.save();
});
const resetPassword = (decodedToken, newPassword, id) => __awaiter(void 0, void 0, void 0, function* () {
    if (id !== decodedToken.id) {
        throw new AppError_1.default(401, "You can not reset your password");
    }
    const isExistUser = yield user_model_1.User.findById(decodedToken.id);
    if (!isExistUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "ID does not exist");
    }
    isExistUser.password = yield bcryptjs_1.default.hash(newPassword, Number(config_1.default.BCRYPT_SALT_ROUNDS));
    yield isExistUser.save();
});
const forgotPassword = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findOne({ email: email });
    if (!isExistUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
    }
    if (isExistUser.isVerified === !true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is not verified");
    }
    if (isExistUser.isActive === user_interface_1.IsActive.BLOCKED ||
        isExistUser.isActive === user_interface_1.IsActive.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isExistUser.isActive}`);
    }
    if (isExistUser.isDeleted === true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
    }
    const payload = {
        email: isExistUser.email,
        role: isExistUser.role,
        id: isExistUser._id,
    };
    const resetToken = jsonwebtoken_1.default.sign(payload, config_1.default.JWT.JWT_ACCESS_SECRET, {
        expiresIn: "10m",
    });
    const resetUILink = `${config_1.default.FRONTEND_URL}/reset-password?id=${isExistUser._id}&token=${resetToken}`;
    (0, sendEmail_1.sendMail)({
        to: isExistUser.email,
        subject: "Password Reset",
        templateName: "forgetPassword",
        templateData: {
            name: isExistUser.name,
            resetUILink,
        },
    });
});
exports.AuthService = {
    changePassword,
    createNewAccessToken,
    setPassword,
    resetPassword,
    forgotPassword,
};
