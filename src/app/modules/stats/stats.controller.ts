import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { StatsServices } from "./stats.service";

const getAllUsersStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StatsServices.getAllUsersStatistics();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Retrieved all users successfully",
      data: result,
    });
  }
);
const getAllAgentStatistics = catchAsync(
  async (req: Request, res: Response) => {
    const result = await StatsServices.getAllAgentStatistics();
    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Retrieved all agent successfully",
      data: result,
    });
  }
);

export const StatsController = {
  getAllUsersStatistics,
  getAllAgentStatistics,
};
