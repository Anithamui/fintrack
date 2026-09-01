import dotenv from "dotenv";
dotenv.config(); // Load .env file

import express from "express";
import pool from "./config/database";
import authRoutes from "./routes/authRoutes";
import otpRoutes from "./routes/otpRoutes";
// import otp

const dbUrl = process.env.DATABASE_URL;
const emailUser = process.env.EMAIL_USER;

const app = express();
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/otp", otpRoutes);

const PORT = 3000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// db health check
app.get("/api/dbhealth", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      message: "Database is connected",
      time: result.rows[0].now,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: String(err),
    });
  }
});

app.listen(PORT, () => {
  console.log(`BFF Server is running on http://localhost:${PORT}`);
});
