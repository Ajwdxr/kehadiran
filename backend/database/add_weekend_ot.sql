-- Migration: Allow weekend OT check-in
-- Run this in Supabase SQL Editor

-- 1. Update the status CHECK constraint to include 'ot'
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check 
    CHECK (status IN ('present', 'late', 'absent', 'leave', 'ot'));

-- 2. Add is_weekend_ot column
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS is_weekend_ot BOOLEAN DEFAULT FALSE;

-- Done!
SELECT 'Weekend OT migration completed successfully!' as message;
