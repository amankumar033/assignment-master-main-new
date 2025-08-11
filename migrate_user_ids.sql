-- Migration script to update users table for new USR format user IDs
-- Run this script in your phpMyAdmin database

-- First, let's check the current structure of the users table
-- and add the user_id column if it doesn't exist

-- Add user_id column if it doesn't exist (make it VARCHAR to support USR format)
ALTER TABLE `kriptocar`.`users` 
ADD COLUMN `user_id` VARCHAR(20) UNIQUE NULL AFTER `id`;

-- Create an index on user_id for better performance
CREATE INDEX idx_users_user_id ON kriptocar.users(user_id);

-- Update existing users to have USR format IDs
-- This will assign USR000001, USR000002, etc. to existing users
SET @counter = 1;
UPDATE `kriptocar`.`users` 
SET `user_id` = CONCAT('USR', LPAD(@counter := @counter + 1, 6, '0'))
WHERE `user_id` IS NULL;

-- Make user_id NOT NULL after populating existing records
ALTER TABLE `kriptocar`.`users` 
MODIFY COLUMN `user_id` VARCHAR(20) NOT NULL;

-- Add a unique constraint to ensure no duplicate user_ids
ALTER TABLE `kriptocar`.`users` 
ADD UNIQUE KEY `unique_user_id` (`user_id`);

-- Verify the migration
SELECT COUNT(*) as total_users, 
       COUNT(CASE WHEN user_id LIKE 'USR%' THEN 1 END) as users_with_usr_id
FROM kriptocar.users;

-- Show sample of updated users
SELECT id, user_id, email, full_name 
FROM kriptocar.users 
LIMIT 10;
