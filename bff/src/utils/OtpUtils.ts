class OtpUtils {
  // Generate random 6-digit OTP
  static generateOtp(): string {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  }

  // Calculate OTP expiry time (5 minutes from now)
  static getOtpExpiryTime(): Date {
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 5);
    return expiryTime;
  }

  // Check if OTP is expired
  static isOtpExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }
}

export default OtpUtils;
