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
const config_1 = __importDefault(require("./app/config"));
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = require("./app");
const seedAdmin_1 = require("./app/utils/seedAdmin");
let server;
const A5Server = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!config_1.default.DATABASE_URL) {
            throw new Error("Database URL is missing in environment variables.");
        }
        yield mongoose_1.default.connect(config_1.default.DATABASE_URL);
        console.log("Database connected successfully");
        server = app_1.app.listen(config_1.default.PORT, () => {
            console.log(`Server is running on http://localhost:${config_1.default.PORT}`);
        });
    }
    catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
});
(() => __awaiter(void 0, void 0, void 0, function* () {
    yield A5Server();
    yield (0, seedAdmin_1.seedAdmin)();
}))();
//Server error handle
process.on("unhandledRejection", (err) => {
    console.log("unHandle rejection detected... Server shutting down... ", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("uncaughtException", (err) => {
    console.log("un caught exception detected... Server shutting down... ", err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on("SIGTERM", () => {
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
