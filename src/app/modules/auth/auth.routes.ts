import express from "express";
import { AuthController } from "./auth.controller";

const authRoute = express.Router();

authRoute.post("/login", AuthController.createLogin);

export default authRoute;
