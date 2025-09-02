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
exports.AuthService = {
    changePassword,
    createNewAccessToken,
};
