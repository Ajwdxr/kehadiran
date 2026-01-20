-- Migration: Convert check_in and check_out from TIME to TIMESTAMPTZ
-- Run this in Supabase SQL Editor

-- Step 1: Add new TIMESTAMPTZ columns
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_in_new TIMESTAMPTZ;

ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS check_out_new TIMESTAMPTZ;

-- Step 2: Copy existing TIME data to new TIMESTAMPTZ columns
-- This combines the date with the time to create a full timestamp
UPDATE attendance 
SET check_in_new = (date::date + check_in::time) AT TIME ZONE 'Asia/Kuala_Lumpur'
WHERE check_in IS NOT NULL;

UPDATE attendance 
SET check_out_new = (date::date + check_out::time) AT TIME ZONE 'Asia/Kuala_Lumpur'
WHERE check_out IS NOT NULL;

-- Step 3: Drop old TIME columns
ALTER TABLE attendance DROP COLUMN IF EXISTS check_in;
ALTER TABLE attendance DROP COLUMN IF EXISTS check_out;

-- Step 4: Rename new columns to original names
ALTER TABLE attendance RENAME COLUMN check_in_new TO check_in;
ALTER TABLE attendance RENAME COLUMN check_out_new TO check_out;

-- Step 5: Set timezone for the session (optional but recommended)
-- This ensures all timestamps are interpreted in Malaysia timezone
SET timezone = 'Asia/Kuala_Lumpur';

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attendance' 
  AND column_name IN ('check_in', 'check_out', 'date');

-- Show sample data
SELECT id, date, check_in, check_out 
FROM attendance 
ORDER BY id DESC 
LIMIT 5;
