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
exports.createNewAccessTokenUseRefreshToken = exports.createUserTokens = void 0;
const config_1 = __importDefault(require("../config"));
const user_interface_1 = require("../modules/user/user.interface");
const jwt_1 = require("./jwt");
const user_model_1 = require("../modules/user/user.model");
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const createUserTokens = (user) => {
    const tokenPayload = {
        email: user.email,
        role: user.role,
        id: user._id,
    };
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.JWT_ACCESS_SECRET, config_1.default.JWT.JWT_ACCESS_EXPIRATION);
    const refreshToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.JWT_REFRESH_SECRET, config_1.default.JWT.JWT_REFRESH_EXPIRATION);
    return {
        accessToken,
        refreshToken,
    };
};
exports.createUserTokens = createUserTokens;
const createNewAccessTokenUseRefreshToken = (refreshToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedRefreshToken = (0, jwt_1.verifyToken)(refreshToken, config_1.default.JWT.JWT_REFRESH_SECRET);
    const isExistUser = yield user_model_1.User.findOne({ email: verifiedRefreshToken.email });
    if (!isExistUser) {
        throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
    }
    if (isExistUser.isActive === user_interface_1.IsActive.BLOCKED ||
        isExistUser.isActive === user_interface_1.IsActive.SUSPENDED) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is blocked or inactive");
    }
    if (isExistUser.isDeleted === true) {
        throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
    }
    const tokenPayload = {
        email: isExistUser.email,
        role: isExistUser.role,
        id: isExistUser._id,
    };
    const accessToken = (0, jwt_1.generateToken)(tokenPayload, config_1.default.JWT.JWT_ACCESS_SECRET, config_1.default.JWT.JWT_ACCESS_EXPIRATION);
    return {
        accessToken,
    };
});
exports.createNewAccessTokenUseRefreshToken = createNewAccessTokenUseRefreshToken;
