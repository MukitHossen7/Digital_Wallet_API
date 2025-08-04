"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = void 0;
const config_1 = __importDefault(require("../config"));
const setAuthCookie = (res, tokenInfo) => {
    if (tokenInfo.accessToken) {
        res.cookie("accessToken", tokenInfo.accessToken, {
            httpOnly: true,
            secure: config_1.default.NODE_ENV !== "development",
            sameSite: "none",
        });
    }
    if (tokenInfo.refreshToken) {
        res.cookie("refreshToken", tokenInfo.refreshToken, {
            httpOnly: true,
            secure: config_1.default.NODE_ENV !== "development",
            sameSite: "none",
        });
    }
};
exports.setAuthCookie = setAuthCookie;
