import express, { Request, Response } from "express";
import authenticateToken from "../../middleware/isAuth";
import { body, validationResult } from "express-validator";

import * as UserService from "./user.service";
import { upload } from "../../middleware/cloudinary";

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
      } else {
        return response.status(404).json("user not found");
      }
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

userRouter.put(
  "/:id",
  body("name").isString(),
  body("email").isString(),
  authenticateToken,
  upload.any(),
  async (request: Request, response: Response) => {
    const id: string = request.params.id;
    try {
      const user = request.body;
      const files = request.files as Express.Multer.File[];
      let profileImage = null;

      const isUser = await UserService.getUser(id);
      if (!isUser) {
        return response.status(404).json("user does not exist");
      }

      if (files.length > 0) {
        const image = files[0];
        profileImage = image.path;
      }
      const updatedUser = await UserService.updateProfile(
        id,
        user,
        profileImage
      );
      return response.status(201).json(updatedUser);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

userRouter.get("/search", async (request: Request, response: Response) => {
  try {
    const { name } = request.query;

    const users = await UserService.searchUser(name);

    console.log("users");

    return response.status(201).json(users);
  } catch (error: any) {
    return response.status(500).json(error.message);
  }
});
