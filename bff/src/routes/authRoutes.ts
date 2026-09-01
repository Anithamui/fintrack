import express from "express";
import UserService from "../services/UserService";
import CustomError from "../utils/CustomError";
import PasswordUtils from "../utils/PasswordUtils";
import UserDto from "../dto/UserDto";

const router = express.Router();
const userService = new UserService();

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password)
      throw new CustomError("Name, email, and password are required", 400);

    const createdUser = await userService.createUser(name, email, password);
    const userDto = new UserDto(createdUser);
    return res.status(201).json(userDto);
  } catch (error) {
    const customError = error as CustomError;
    const statusCode = customError.statusCode || 500;
    res.status(statusCode).json({ error: customError.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      throw new CustomError("Email and password are required", 400);
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }
    const isPasswordsMatch = await PasswordUtils.comparePassword(
      password,
      user.password,
    );
    if (!isPasswordsMatch) {
      throw new CustomError("Invalid credentials", 401);
    }
    const userDto = new UserDto(user);
    return res.status(200).json(userDto);
  } catch (error) {
    const customError = error as CustomError;
    const statusCode = customError.statusCode || 500;
    res.status(statusCode).json({ error: customError.message });
  }
});

export default router;
