import express, { Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import notFound from "./app/middlewares/notFound";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";

export const app = express();

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(cors());

//routes

app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "This is L2B5 Assignment-5 API",
  });
});

app.use(globalErrorHandler);
app.use(notFound);
