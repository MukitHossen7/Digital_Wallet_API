"use strict";
// import { NextFunction, Request, Response } from "express";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalErrorHandler = void 0;
const AppError_1 = __importDefault(require("../errorHelpers/AppError"));
const config_1 = __importDefault(require("../config"));
const globalErrorHandler = (error, req, res, next) => {
    const errorSources = [];
    let statusCode = 500;
    let message = "Something Went Wrong!!";
    //duplicate error
    if (error.code === 11000) {
        const matchArray = error.message.match(/"([^"]*)"/);
        statusCode = 400;
        message = `${matchArray[1]} already exists!!`;
    }
    // cast error
    else if (error.name === "CastError") {
        statusCode = 400;
        message = "Invalid MongoDB ObjectId. Please provide a valid id";
    }
    //mongoose validation error
    else if (error.name === "ValidationError") {
        statusCode = 400;
        const errors = Object.values(error.errors);
        errors.forEach((errorObject) => errorSources.push({
            path: errorObject.path,
            message: errorObject.message,
        }));
        message = "Validation Error";
    }
    // zod validation error
    else if (error.name === "ZodError") {
        statusCode = 400;
        error.issues.forEach((issue) => errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
        }));
        message = "Zod Error";
    }
    else if (error instanceof AppError_1.default) {
        statusCode = error.statusCode;
        message = error.message;
    }
    else if (error instanceof Error) {
        statusCode = 500;
        message = error.message;
    }
    res.status(statusCode).json({
        success: false,
        message,
        errorSources,
        error: config_1.default.NODE_ENV === "development" ? error : null,
        stack: config_1.default.NODE_ENV === "development" ? error.stack : null,
    });
};
exports.globalErrorHandler = globalErrorHandler;
