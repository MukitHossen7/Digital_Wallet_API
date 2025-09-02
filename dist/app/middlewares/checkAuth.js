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
exports.checkAuth = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const http_status_codes_1 = __importDefault(require("http-status-codes"));
const jwt_1 = require("../utils/jwt");
const config_1 = __importDefault(require("../config"));
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const checkAuth = (...authRoles) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accessToken = req.headers.authorization || req.cookies.accessToken;
        if (!accessToken) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Access token is missing");
        }
        const verify_token = (0, jwt_1.verifyToken)(accessToken, config_1.default.JWT.JWT_ACCESS_SECRET);
        if (!verify_token) {
            throw new AppError_1.default(http_status_codes_1.default.UNAUTHORIZED, "Invalid access token");
        }
        const isExistUser = yield user_model_1.User.findOne({ email: verify_token.email });
        if (!isExistUser) {
            throw new AppError_1.default(http_status_codes_1.default.BAD_REQUEST, "Email does not exist");
        }
        if (isExistUser.isVerified === !true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is not verified");
        }
        if (isExistUser.isDeleted === true) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "Your account is deleted");
        }
        if (isExistUser.isActive === user_interface_1.IsActive.BLOCKED ||
            isExistUser.isActive === user_interface_1.IsActive.SUSPENDED) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, `Your account is ${isExistUser.isActive}`);
        }
        if (!authRoles.includes(verify_token.role)) {
            throw new AppError_1.default(http_status_codes_1.default.FORBIDDEN, "You do not have permission to access this resource");
        }
        req.user = verify_token;
        next();
    }
    catch (error) {
        next(error);
    }
});
exports.checkAuth = checkAuth;
