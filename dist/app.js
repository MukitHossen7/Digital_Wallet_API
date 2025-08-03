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
exports.app = (0, express_1.default)();
//middleware
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, cors_1.default)());
//routes
exports.app.use("/api/v1", routes_1.default);
exports.app.get("/", (req, res) => {
    res.send({
        success: true,
        message: "This is L2B5 Assignment-5 API",
    });
});
exports.app.use(globalErrorHandler_1.globalErrorHandler);
exports.app.use(notFound_1.default);
