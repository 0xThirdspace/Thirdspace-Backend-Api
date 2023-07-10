import express, { Request, Response } from "express";
import { validationResult, body } from "express-validator";

import * as AuthService from "./auth.service";

export const authRouter = express.Router();

// POST: Create a User
// Params: name, email, password
authRouter.post(
  "/signUp",
  body("name").isString(),
  body("email").isEmail(),
  body("password").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    try {
      const user = request.body;
      const newUser = await AuthService.signUp(user);
      return response.status(201).json(newUser);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);

authRouter.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  async (request: Request, response: Response) => {
    const errors = validationResult(request);
    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    try {
      const userLogin = request.body;
      const user = await AuthService.Login(userLogin);
      return response.status(201).json(user);
    } catch (error: any) {
      return response.status(500).json(error.message);
    }
  }
);
