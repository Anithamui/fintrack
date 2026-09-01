import express, { Request, Response } from "express";
import UserService from "../services/UserService";
import CustomError from "../utils/CustomError";

const router = express.Router();
const userService = new UserService();

// POST /otp/send-otp
// Send OTP to user's email
router.post("/send-otp", async (req: Request, res: Response) => {
  try {
    const { userId, email } = req.body;

    // Validate input
    if (!userId || !email) {
      return res.status(400).json({
        status: "error",
        message: "userId and email are required",
      });
    }

    // Generate and send OTP
    await userService.generateAndSendOtp(userId, email);

    res.status(200).json({
      status: "success",
      message: "OTP sent to email. Valid for 5 minutes.",
    });
  } catch (error) {
    const errorMessage =
      error instanceof CustomError ? error.message : "Internal server error";
    res.status(error instanceof CustomError ? error.statusCode : 500).json({
      status: "error",
      message: errorMessage,
    });
  }
});

// POST /otp/verify-otp
// Verify OTP entered by user
router.post("/verify-otp", async (req: Request, res: Response) => {
  try {
    const { userId, otp } = req.body;

    // Validate input
    if (!userId || !otp) {
      return res.status(400).json({
        status: "error",
        message: "userId and otp are required",
      });
    }

    // Verify OTP
    const isValid = await userService.verifyOtp(userId, otp);

    if (isValid) {
      res.status(200).json({
        status: "success",
        message: "Email verified successfully!",
      });
    }
  } catch (error) {
    const errorMessage =
      error instanceof CustomError ? error.message : "Internal server error";
    res.status(error instanceof CustomError ? error.statusCode : 500).json({
      status: "error",
      message: errorMessage,
    });
  }
});

export default router;
