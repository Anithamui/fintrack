import nodemailer from "nodemailer";
import CustomError from "../utils/CustomError";

class EmailService {
  private transporter;

  constructor() {
    console.log("🔧 Initializing EmailService...");
    console.log("📧 Email User:", process.env.EMAIL_USER);
    console.log(
      "🔑 Email Password length:",
      process.env.EMAIL_PASSWORD?.length,
    );

    this.transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<void> {
    try {
      console.log("📧 Attempting to send OTP...");

      // Verify connection
      await this.transporter.verify();
      console.log("✅ SMTP connection verified");

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Email Verification - Your OTP",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Email Verification</h2>
            <p style="font-size: 16px; color: #666;">
              Your One-Time Password (OTP) is:
            </p>
            <div style="background-color: #f0f0f0; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h1 style="color: #007bff; letter-spacing: 5px; margin: 0;">${otp}</h1>
            </div>
            <p style="font-size: 14px; color: #999;">
              This OTP will expire in 5 minutes.
            </p>
            <p style="font-size: 12px; color: #999;">
              Do not share this OTP with anyone.
            </p>
          </div>
        `,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ OTP sent to ${email}. Message ID: ${info.messageId}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("❌ Email sending failed:", errorMessage);
      throw new CustomError(`Failed to send email: ${errorMessage}`, 500);
    }
  }
}

export default new EmailService();
