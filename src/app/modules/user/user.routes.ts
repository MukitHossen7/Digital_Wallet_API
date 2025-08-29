import express from "express";
import { zodValidateRequest } from "../../middlewares/zodValidateRequest";
import {
  createUserZodSchema,
  updateUserZodSchema,
} from "./user.zod.validation";
import { UserControllers } from "./user.controller";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { multerUpload } from "../../config/multer.config";

const userRoute = express.Router();

userRoute.post(
  "/register",
  zodValidateRequest(createUserZodSchema),
  UserControllers.createUser
);

userRoute.get(
  "/",
  checkAuth(Role.ADMIN, Role.AGENT),
  UserControllers.getAllUserOrAgent
);

userRoute.get("/me", checkAuth(...Object.values(Role)), UserControllers.getMe);

userRoute.patch(
  "/updateProfile",
  checkAuth(...Object.values(Role)),
  multerUpload.single("file"),
  zodValidateRequest(updateUserZodSchema),
  UserControllers.updateUserProfile
);

userRoute.patch(
  "/approve/:id",
  checkAuth(Role.ADMIN),
  UserControllers.approveAgent
);

userRoute.patch(
  "/suspend/:id",
  checkAuth(Role.ADMIN),
  UserControllers.suspendAgent
);

userRoute.patch("/block/:id", checkAuth(Role.ADMIN), UserControllers.blockUser);
userRoute.patch(
  "/unblock/:id",
  checkAuth(Role.ADMIN),
  UserControllers.unBlockUser
);

export default userRoute;
