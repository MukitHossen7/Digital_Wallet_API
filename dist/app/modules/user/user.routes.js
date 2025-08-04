"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zodValidateRequest_1 = require("../../middlewares/zodValidateRequest");
const user_zod_validation_1 = require("./user.zod.validation");
const user_controller_1 = require("./user.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("./user.interface");
const userRoute = express_1.default.Router();
userRoute.post("/register", (0, zodValidateRequest_1.zodValidateRequest)(user_zod_validation_1.createUserZodSchema), user_controller_1.UserControllers.createUser);
userRoute.get("/", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), user_controller_1.UserControllers.getAllUserOrAgent);
userRoute.patch("/approve/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), user_controller_1.UserControllers.approveAgent);
userRoute.patch("/suspend/:id", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), user_controller_1.UserControllers.suspendAgent);
exports.default = userRoute;
