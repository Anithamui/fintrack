interface EmailVerification {
  id: number;
  user_id: number;
  otp: string;
  otp_expires_at: Date;
  attempts: number;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export default EmailVerification;
