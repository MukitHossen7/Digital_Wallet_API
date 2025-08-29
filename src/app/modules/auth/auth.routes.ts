import express, { NextFunction, Request, Response } from "express";
import { AuthController } from "./auth.controller";
import passport from "passport";
import config from "../../config";
import { checkAuth } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const authRoute = express.Router();

authRoute.post("/login", AuthController.createLogin);
authRoute.post("/logout", AuthController.logOutUser);
authRoute.post(
  "/change-password",
  checkAuth(...Object.values(Role)),
  AuthController.changePassword
);

authRoute.get(
  "/google",
  async (req: Request, res: Response, next: NextFunction) => {
    const redirect = req.query.redirect || "/";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: redirect as string,
    })(req, res, next);
  }
);

authRoute.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${config.FRONTEND_URL}/login?error=There is some issues with your account.Please contact our support team`,
  }),
  AuthController.googleLogin
);

export default authRoute;
