CREATE TABLE email_verifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp VARCHAR(6) NOT NULL,
  otp_expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster lookups
CREATE INDEX idx_email_verifications_user_id ON email_verifications(user_id);