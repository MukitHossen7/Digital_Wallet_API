"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const notFound_1 = __importDefault(require("./app/middlewares/notFound"));
const globalErrorHandler_1 = require("./app/middlewares/globalErrorHandler");
const routes_1 = __importDefault(require("./app/routes/routes"));
const config_1 = __importDefault(require("./app/config"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
require("./app/config/passport");
exports.app = (0, express_1.default)();
//middleware
exports.app.use((0, express_session_1.default)({
    secret: config_1.default.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));
exports.app.use(passport_1.default.initialize());
exports.app.use(passport_1.default.session());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json());
exports.app.use(express_1.default.urlencoded({ extended: true }));
exports.app.set("trust proxy", 1);
exports.app.use((0, cors_1.default)({
    origin: [config_1.default.FRONTEND_URL],
    credentials: true,
}));
//routes
exports.app.use("/api/v1", routes_1.default);
exports.app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "Welcome to the Digital Wallet Server",
    });
});
exports.app.use(globalErrorHandler_1.globalErrorHandler);
exports.app.use(notFound_1.default);
