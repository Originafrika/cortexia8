CREATE TABLE IF NOT EXISTS waitlist (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  profession TEXT NOT NULL CHECK (profession IN ('Pub', 'UGC', 'Émission', 'Film', 'Autre')),
  referral_code TEXT NOT NULL UNIQUE,
  referred_by TEXT REFERENCES waitlist(email),
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_idx ON waitlist (email);
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_referral_code_idx ON waitlist (referral_code);
