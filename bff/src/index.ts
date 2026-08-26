import express from "express";

const app = express();
const PORT = 3000;

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`BFF Server is running on http://localhost:${PORT}`);
});
