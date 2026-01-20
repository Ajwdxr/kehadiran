-- Add ALL missing columns to attendance table
-- Run this in Supabase SQL Editor

-- Add note column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS note TEXT;

-- Add is_late column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE;

-- Add is_early_leave column  
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS is_early_leave BOOLEAN DEFAULT FALSE;

-- Add work_hours column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS work_hours DECIMAL(5, 2);

-- Add overtime_hours column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS overtime_hours DECIMAL(5, 2);

-- Add location_id column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES locations(id);

-- Add device_info column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS device_info VARCHAR(255);

-- Add source column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS source VARCHAR(20) DEFAULT 'web';

-- Add latitude column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column
ALTER TABLE attendance 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Verify the columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'attendance' 
ORDER BY ordinal_position;
