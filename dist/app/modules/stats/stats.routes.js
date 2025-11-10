"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const stats_controller_1 = require("./stats.controller");
const checkAuth_1 = require("../../middlewares/checkAuth");
const user_interface_1 = require("../user/user.interface");
const statsRoute = express_1.default.Router();
statsRoute.get("/all-users", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), stats_controller_1.StatsController.getAllUsersStatistics);
statsRoute.get("/all-agents", (0, checkAuth_1.checkAuth)(user_interface_1.Role.ADMIN), stats_controller_1.StatsController.getAllAgentStatistics);
exports.default = statsRoute;
