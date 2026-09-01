import dotenv from "dotenv";

// Load .env FIRST!
dotenv.config();

import EmailService from "./services/EmailService";

// Debug: Check if env vars are loaded
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log(
  "EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD ? "✅ Loaded" : "❌ Missing",
);

async function testEmail() {
  try {
    console.log("📧 Sending test OTP email...");
    await EmailService.sendOtpEmail("ani.mettu@gmail.com", "123456");
    console.log("✅ Email sent successfully!");
    process.exit(0);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Error:", errorMessage);
    process.exit(1);
  }
}

testEmail();
