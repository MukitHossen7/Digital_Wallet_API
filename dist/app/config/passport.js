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
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const user_model_1 = require("../modules/user/user.model");
const user_interface_1 = require("../modules/user/user.interface");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const _1 = __importDefault(require("."));
const wallet_model_1 = require("../modules/wallet/wallet.model");
// credential Login use passPort.js
passport_1.default.use(new passport_local_1.Strategy({
    usernameField: "email",
    passwordField: "password",
}, (email, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExistUser = yield user_model_1.User.findOne({ email });
        if (!isExistUser) {
            return done(null, false, { message: "Email does not exist" });
        }
        if (isExistUser.isVerified === !true) {
            return done(null, false, { message: "Your account is not Verified" });
        }
        if (isExistUser.isActive === user_interface_1.IsActive.BLOCKED ||
            isExistUser.isActive === user_interface_1.IsActive.SUSPENDED) {
            return done(null, false, {
                message: "Your account is blocked or inactive",
            });
        }
        if (isExistUser.isDeleted === true) {
            return done(null, false, {
                message: "Your account is deleted",
            });
        }
        const isGoogleAuthenticated = isExistUser.auths.some((providerObjects) => providerObjects.provider == "google");
        if (isGoogleAuthenticated && !isExistUser.password) {
            return done(null, false, {
                message: "You have authenticated through Google",
            });
        }
        const isPasswordMatch = yield bcryptjs_1.default.compare(password, isExistUser === null || isExistUser === void 0 ? void 0 : isExistUser.password);
        if (!isPasswordMatch) {
            return done(null, false, { message: "Password is incorrect" });
        }
        return done(null, isExistUser, {
            message: "User authenticated successfully",
        });
    }
    catch (error) {
        done(error);
    }
})));
//google Login use passport.js
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: _1.default.PASSPORT_GOOGLE.GOOGLE_CLIENT_ID,
    clientSecret: _1.default.PASSPORT_GOOGLE.GOOGLE_CLIENT_SECRET,
    callbackURL: _1.default.PASSPORT_GOOGLE.GOOGLE_CALLBACK_URL,
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const email = (_a = profile.emails) === null || _a === void 0 ? void 0 : _a[0].value;
        if (!email) {
            return done(null, false, {
                message: "No email associated with this account",
            });
        }
        let user = yield user_model_1.User.findOne({ email });
        if (user && user.isVerified === !true) {
            return done(null, false, {
                message: "Your account is not Verified",
            });
        }
        if (user &&
            (user.isActive === user_interface_1.IsActive.BLOCKED ||
                user.isActive === user_interface_1.IsActive.SUSPENDED)) {
            return done(null, false, {
                message: "Your account is blocked or inactive",
            });
        }
        if (user && user.isDeleted === true) {
            return done(null, false, {
                message: "Your account is deleted",
            });
        }
        if (!user) {
            user = yield user_model_1.User.create({
                email,
                name: profile.displayName,
                picture: (_b = profile.photos) === null || _b === void 0 ? void 0 : _b[0].value,
                role: user_interface_1.Role.USER,
                isVerified: true,
                auths: [
                    {
                        provider: "google",
                        providerID: profile.id,
                    },
                ],
            });
            yield wallet_model_1.Wallet.create({
                user: user._id,
                balance: 50,
            });
            return done(null, user, {
                message: "User created successfully with Wallet",
            });
        }
        return done(null, user, { message: "User authenticated successfully" });
    }
    catch (error) {
        return done(error, false, { message: "Google Strategy Error" });
    }
})));
passport_1.default.serializeUser((user, done) => {
    done(null, user._id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.User.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error);
    }
}));
