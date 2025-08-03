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
exports.seedAdmin = void 0;
const config_1 = __importDefault(require("../config"));
const user_interface_1 = require("../modules/user/user.interface");
const user_model_1 = require("../modules/user/user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isAdminExists = yield user_model_1.User.findOne({
            email: config_1.default.ADMIN.SUPER_ADMIN_EMAIL,
            role: "ADMIN",
        });
        if (isAdminExists) {
            console.log("Super Admin already exists");
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(config_1.default.ADMIN.SUPER_ADMIN_PASSWORD, Number(config_1.default.BCRYPT_SALT_ROUNDS));
        const payload = {
            name: "Admin",
            email: config_1.default.ADMIN.SUPER_ADMIN_EMAIL,
            password: hashedPassword,
            phone: "+8801234567891",
            role: user_interface_1.Role.ADMIN,
            address: "123 Gulshan Avenue, Dhaka, Bangladesh",
        };
        yield user_model_1.User.create(payload);
    }
    catch (error) {
        console.log(error);
    }
});
exports.seedAdmin = seedAdmin;
