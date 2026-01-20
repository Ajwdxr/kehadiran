-- Migration: Update attendance table to use TIMESTAMPTZ columns
-- Run this in Supabase SQL Editor

-- First, let's add new TIMESTAMPTZ columns for check_in and check_out
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ;

ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_out_time TIMESTAMPTZ;

-- Alternatively, if you want to keep TIME columns but ensure they work correctly,
-- you can set the timezone for the database session:
-- SET timezone = 'Asia/Kuala_Lumpur';

-- Or modify existing TIME columns to TIMETZ (time with timezone)
-- Note: This requires dropping and recreating or using intermediate columns

-- For now, let's just ensure the TIME columns exist and work with strings
-- The backend will handle timezone conversion

-- Verify the current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'attendance' 
ORDER BY ordinal_position;
