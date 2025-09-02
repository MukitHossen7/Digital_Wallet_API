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
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const _1 = __importDefault(require("."));
exports.redisClient = (0, redis_1.createClient)({
    username: _1.default.REDIS.REDIS_USERNAME,
    password: _1.default.REDIS.REDIS_PASSWORD,
    socket: {
        host: _1.default.REDIS.REDIS_HOST,
        port: Number(_1.default.REDIS.REDIS_PORT),
    },
});
exports.redisClient.on("error", (err) => console.log("Redis Client Error", err));
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!exports.redisClient.isOpen) {
        yield exports.redisClient.connect();
        console.log("Redis Connected");
    }
});
exports.connectRedis = connectRedis;
