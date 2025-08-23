import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { User } from "../modules/user/user.model";
import { IsActive } from "../modules/user/user.interface";
import bcrypt from "bcryptjs";

// credential Login use passPort.js
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done: any) => {
      try {
        const isExistUser = await User.findOne({ email });
        if (!isExistUser) {
          return done(null, false, { message: "Email does not exist" });
        }

        if (isExistUser.isVerified === !true) {
          return done(null, false, { message: "Your account is not Verified" });
        }
        if (
          isExistUser.isActive === IsActive.BLOCKED ||
          isExistUser.isActive === IsActive.SUSPENDED
        ) {
          return done(null, false, {
            message: "Your account is blocked or inactive",
          });
        }

        if (isExistUser.isDeleted === true) {
          return done(null, false, {
            message: "Your account is deleted",
          });
        }

        const isGoogleAuthenticated = isExistUser.auths.some(
          (providerObjects) => providerObjects.provider == "google"
        );

        if (isGoogleAuthenticated && !isExistUser.password) {
          return done(null, false, {
            message: "You have authenticated through Google",
          });
        }
        const isPasswordMatch = await bcrypt.compare(
          password,
          isExistUser?.password as string
        );
        if (!isPasswordMatch) {
          return done(null, false, { message: "Password is incorrect" });
        }
        return done(null, isExistUser, {
          message: "User authenticated successfully",
        });
      } catch (error) {
        done(error);
      }
    }
  )
);
