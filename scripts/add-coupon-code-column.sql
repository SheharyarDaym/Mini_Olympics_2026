-- Add coupon_code to registrations (which coupon was used, if any)
ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
