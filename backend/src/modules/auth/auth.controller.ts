import { Request, Response } from "express";
import { registerDTO } from "../dto/register.dto";
import { loginDTO } from "../dto/login.dto";
import {
  registerUserService,
  loginUserService,
} from "./auth.service";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const validatedData = registerDTO.parse(req.body);

    const user = await registerUserService(
      validatedData.email,
      validatedData.password
    );

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const validatedData = loginDTO.parse(req.body);

    const { token, user } = await loginUserService(
      validatedData.email,
      validatedData.password
    );

    // 🍪 COOKIE
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user,
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
