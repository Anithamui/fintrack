import User from "../models/User";
import pool from "../config/database";
import CustomError from "../utils/CustomError";
import EmailService from "./EmailService";
import PasswordUtils from "../utils/PasswordUtils";
import OtpUtils from "../utils/OtpUtils";
import bcrypt from "bcrypt";

interface PostgresError extends Error {
  code?: string;
  message: string;
}

class UserService {
  async createUser(
    name: string,
    email: string,
    password: string,
  ): Promise<User> {
    try {
      const hashedPassword = await PasswordUtils.hashPassword(password);
      const result = await pool.query(
        "INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *",
        [name, email, hashedPassword],
      );
      return result.rows[0];
    } catch (error) {
      // Check if error is duplicate email
      const pgError = error as PostgresError;
      if (pgError.code === "23505") {
        // PostgreSQL unique constraint error code
        throw new CustomError("Email already exists", 409);
      }
      throw new CustomError(`Error fetching user: ${pgError.message}`, 500);
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query("SELECT * from users where email = $1", [
        email,
      ]);
      return result.rows[0] || null;
    } catch (error) {
      const pgError = error as PostgresError;
      throw new CustomError(`Error fetching users: ${pgError.message}`, 500);
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const result = await pool.query("SELECT * FROM users");
      return result.rows;
    } catch (error) {
      const pgError = error as PostgresError;
      throw new CustomError(`Error fetching users: ${pgError.message}`, 500);
    }
  }

  async generateAndSendOtp(userId: number, email: string): Promise<void> {
    try {
      // Step 1: Generate OTP
      const otp = OtpUtils.generateOtp();

      // Step 2: Calculate expiry (5 minutes from now)
      const expiresAt = OtpUtils.getOtpExpiryTime();

      // Step 3: Save to database
      await pool.query(
        `INSERT INTO email_verifications (user_id, otp, otp_expires_at)
         VALUES ($1, $2, $3)`,
        [userId, otp, expiresAt],
      );

      // Step 4: Send email
      await EmailService.sendOtpEmail(email, otp);

      console.log(`✅ OTP sent to ${email}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new CustomError(
        `Failed to generate and send OTP: ${errorMessage}`,
        500,
      );
    }
  }

  // Verify OTP entered by user
  async verifyOtp(userId: number, otp: string): Promise<boolean> {
    try {
      // Step 1: Get latest OTP from database
      const result = await pool.query(
        `SELECT * FROM email_verifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId],
      );

      if (result.rows.length === 0) {
        throw new CustomError("No OTP found for this user", 400);
      }

      const otpRecord = result.rows[0];

      // Step 2: Check if OTP is expired
      if (OtpUtils.isOtpExpired(otpRecord.otp_expires_at)) {
        throw new CustomError("OTP has expired. Request a new one.", 400);
      }

      // Step 3: Check attempts (max 3 wrong attempts)
      if (otpRecord.attempts >= 3) {
        throw new CustomError(
          "Maximum OTP attempts exceeded. Request a new OTP.",
          400,
        );
      }

      // Step 4: Check if OTP matches
      if (otpRecord.otp !== otp) {
        // Increment attempts
        await pool.query(
          `UPDATE email_verifications
           SET attempts = attempts + 1
           WHERE id = $1`,
          [otpRecord.id],
        );
        throw new CustomError("Invalid OTP. Please try again.", 400);
      }

      // Step 5: Mark as verified
      await pool.query(
        `UPDATE email_verifications
         SET verified_at = NOW()
         WHERE id = $1`,
        [otpRecord.id],
      );

      // Step 6: Update user email_verified status
      await pool.query(
        `UPDATE users
         SET email_verified = true
         WHERE id = $1`,
        [userId],
      );

      console.log(`✅ OTP verified for user ${userId}`);
      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      throw new CustomError(`OTP verification failed: ${errorMessage}`, 400);
    }
  }
}
export default UserService;
