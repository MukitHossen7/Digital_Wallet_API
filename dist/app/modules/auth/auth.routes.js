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
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("./auth.controller");
const passport_1 = __importDefault(require("passport"));
const config_1 = __importDefault(require("../../config"));
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const authRoute = express_1.default.Router();
authRoute.post("/login", auth_controller_1.AuthController.createLogin);
authRoute.post("/logout", auth_controller_1.AuthController.logOutUser);
authRoute.post("/refresh-token", auth_controller_1.AuthController.createNewAccessToken);
authRoute.post("/change-password", (0, checkAuth_1.checkAuth)(...Object.values(user_interface_1.Role)), auth_controller_1.AuthController.changePassword);
authRoute.get("/google", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const redirect = req.query.redirect || "/";
    passport_1.default.authenticate("google", {
        scope: ["profile", "email"],
        state: redirect,
    })(req, res, next);
}));
authRoute.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${config_1.default.FRONTEND_URL}/login?error=There is some issues with your account.Please contact our support team`,
}), auth_controller_1.AuthController.googleLogin);
exports.default = authRoute;
