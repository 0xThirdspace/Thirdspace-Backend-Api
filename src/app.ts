require("dotenv").config();
import express, { Request, Response } from "express";
import config from "config";
import validateEnv from "../utils/validateEnv";
import errorHandler from "./middleware/errorHandler";
import { PrismaClient } from "@prisma/client";
import cors from "cors";
import router from "./routes/index";

validateEnv();

const prisma = new PrismaClient();
const app = express();



async function bootstrap() {
  app.use(express.json());
  app.use(cors());

  app.get("/api/healthcheck", (req: Request, res: Response) => {
    console.log("Received a request at /api/healthcheck");
    const message = "Hello, welcome to thirdspace API.";
    res.status(200).json({
      status: "success",
      message,
    });
  });

  app.use(router);
  app.use(errorHandler);

  const port = config.get<number>("port");
  app.listen(port, () => {
    console.log(`Server on port: ${port}`);
  });
}

bootstrap()
  .catch((err) => {
    throw err;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });