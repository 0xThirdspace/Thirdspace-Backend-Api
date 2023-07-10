import express, { Request, Response } from "express";
import authenticateToken from "../../middleware/isAuth";

import * as UserService from "./user.service";

export const userRouter = express.Router();

userRouter.get(
  "/",
  authenticateToken,
  async (request: Request, response: Response) => {
    try {
      const users = await UserService.getAllUsers();
      return response.status(200).json(users);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

userRouter.get(
  "/:id",
  authenticateToken,
  async (request: Request, response: Response) => {
    const id = request.params.id.toString();

    try {
      const user = await UserService.getUser(id);
      if (user) {
        return response.status(200).json(user);
      }
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);
