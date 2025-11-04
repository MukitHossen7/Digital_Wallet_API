import express from "express";
import { StatsController } from "./stats.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
const statsRoute = express.Router();

statsRoute.get(
  "/all-users",
  checkAuth(Role.ADMIN),
  StatsController.getAllUsersStatistics
);
statsRoute.get(
  "/all-agents",
  checkAuth(Role.ADMIN),
  StatsController.getAllAgentStatistics
);

export default statsRoute;
