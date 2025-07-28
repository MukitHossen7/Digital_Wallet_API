import express from "express";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import { createUserZodSchema } from "./user.zod.validation";
import { UserControllers } from "./user.controller";

const userRoute = express.Router();

userRoute.post(
  "/register",
  zodValidateRequest(createUserZodSchema),
  UserControllers.createUser
);

export default userRoute;
