import express from "express";
import pool from "./config/database";
const app = express();
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
