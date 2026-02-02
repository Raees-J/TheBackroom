-- Add test user to Supabase for development/design work
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/wkxxpzhwypuntrgqjiou/sql

-- Insert your phone number as a verified user
INSERT INTO users (
  phone_number,
  is_verified,
  created_at,
  updated_at
) VALUES (
  '+27839300255',  -- Your phone: 083 930 0255
  true,            -- Already verified (skip OTP)
  NOW(),
  NOW()
) ON CONFLICT (phone_number) DO UPDATE SET
  is_verified = true,
  updated_at = NOW();

-- Verify it was added
SELECT * FROM users WHERE phone_number = '+27839300255';
