"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserTokens = void 0;
const config_1 = __importDefault(require("../config"));
const jwt_1 = require("./jwt");
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
