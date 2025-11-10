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
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsServices = void 0;
const user_model_1 = require("../user/user.model");
const getAllUsersStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    const allUser = yield user_model_1.User.find({ role: "USER" });
    const totalUsers = yield user_model_1.User.countDocuments({ role: "USER" });
    const activeUsers = yield user_model_1.User.countDocuments({
        isActive: "ACTIVE",
        role: "USER",
    });
    const blockUsers = yield user_model_1.User.countDocuments({
        isActive: "BLOCKED",
        role: "USER",
    });
    return {
        totalUsers,
        activeUsers,
        blockUsers,
        userData: allUser,
    };
});
const getAllAgentStatistics = () => __awaiter(void 0, void 0, void 0, function* () {
    const allAgent = yield user_model_1.User.find({ role: "AGENT" });
    const totalAgents = yield user_model_1.User.countDocuments({ role: "AGENT" });
    const activeAgents = yield user_model_1.User.countDocuments({
        isActive: "ACTIVE",
        role: "AGENT",
    });
    const blockAgents = yield user_model_1.User.countDocuments({
        isActive: "SUSPENDED",
        role: "AGENT",
    });
    return {
        totalAgents,
        activeAgents,
        blockAgents,
        data: allAgent,
    };
});
exports.StatsServices = {
    getAllUsersStatistics,
    getAllAgentStatistics,
};
