-- User ID Generation System Setup
-- This script sets up the users table and migrates existing data to the new USR format
-- Run this script in your MySQL database

USE kriptocar;

-- First, let's see what we have
SELECT 'Current users table structure:' as info;
DESCRIBE users;

SELECT 'Current users in database:' as info;
SELECT user_id, name, email, phone 
FROM users 
ORDER BY user_id 
LIMIT 10;

-- Check for any users that don't match the new format
SELECT 'Users with old format:' as info;
SELECT user_id, name, email 
FROM users 
WHERE user_id IS NULL OR user_id NOT REGEXP '^USR[0-9]{3}$'
LIMIT 10;

-- Create backup table
CREATE TABLE IF NOT EXISTS users_backup AS SELECT * FROM users;

-- Add user_id column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_id VARCHAR(10) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- Update existing users to new format (if needed)
-- This is a sample update - only run if you need to convert old IDs
/*
UPDATE users 
SET user_id = CONCAT('USR', 
    LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')
)
WHERE user_id IS NULL OR user_id NOT REGEXP '^USR[0-9]{3}$';
*/

-- Verify the new format works
SELECT 'Verifying new user ID format:' as info;
SELECT 
    user_id,
    name,
    email,
    CASE 
        WHEN user_id REGEXP '^USR[0-9]{3}$' THEN '✅ Valid Format'
        WHEN user_id IS NULL THEN '❌ NULL'
        ELSE '❌ Invalid Format'
    END as format_status
FROM users 
ORDER BY user_id 
LIMIT 10;

-- Check for any duplicates
SELECT 'Checking for duplicate user IDs:' as info;
SELECT user_id, COUNT(*) as count
FROM users 
WHERE user_id IS NOT NULL
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Test ID generation logic
SELECT 'Testing ID generation for new users:' as info;

-- Simulate user ID generation
SELECT 
    CONCAT('USR', LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')) as generated_user_id,
    user_id as current_user_id,
    name,
    email
FROM users 
ORDER BY id 
LIMIT 5;

-- Get statistics about user ID usage
SELECT 'User ID Statistics:' as info;

-- Count total users
SELECT COUNT(*) as total_users FROM users;

-- Count users with valid format
SELECT COUNT(*) as valid_format_users 
FROM users 
WHERE user_id REGEXP '^USR[0-9]{3}$';

-- Count users with invalid format
SELECT COUNT(*) as invalid_format_users 
FROM users 
WHERE user_id IS NULL OR user_id NOT REGEXP '^USR[0-9]{3}$';

-- Find the maximum user number
SELECT 
    MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) as max_user_number
FROM users 
WHERE user_id REGEXP '^USR[0-9]{3}$';

-- Show range information
SELECT 'Range Analysis:' as info;

-- Show users by range
SELECT 
    CONCAT('Range ', FLOOR((CAST(SUBSTRING(user_id, 4) AS UNSIGNED) - 1) / 10) + 1) as range_number,
    CONCAT('USR', LPAD(FLOOR((CAST(SUBSTRING(user_id, 4) AS UNSIGNED) - 1) / 10) * 10 + 1, 3, '0'), 
           ' to USR', LPAD(FLOOR((CAST(SUBSTRING(user_id, 4) AS UNSIGNED) - 1) / 10) * 10 + 10, 3, '0')) as range_description,
    COUNT(*) as users_in_range
FROM users 
WHERE user_id REGEXP '^USR[0-9]{3}$'
GROUP BY FLOOR((CAST(SUBSTRING(user_id, 4) AS UNSIGNED) - 1) / 10)
ORDER BY range_number;

-- Find gaps in the sequence
SELECT 'Gap Analysis:' as info;

-- This query finds gaps in the user number sequence
WITH RECURSIVE numbers AS (
    SELECT 1 as num
    UNION ALL
    SELECT num + 1 FROM numbers WHERE num < (
        SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) 
        FROM users 
        WHERE user_id REGEXP '^USR[0-9]{3}$'
    )
),
existing_numbers AS (
    SELECT CAST(SUBSTRING(user_id, 4) AS UNSIGNED) as user_num
    FROM users 
    WHERE user_id REGEXP '^USR[0-9]{3}$'
)
SELECT 
    n.num as missing_number,
    CONCAT('USR', LPAD(n.num, 3, '0')) as missing_user_id
FROM numbers n
LEFT JOIN existing_numbers e ON n.num = e.user_num
WHERE e.user_num IS NULL
ORDER BY n.num
LIMIT 10;

-- Create a function to generate the next available user ID
DELIMITER //
CREATE FUNCTION IF NOT EXISTS get_next_user_id() 
RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_num INT;
    DECLARE next_user_id VARCHAR(10);
    
    -- Find the next available number
    SELECT COALESCE(
        (SELECT MIN(num) 
         FROM (
             SELECT 1 as num
             UNION ALL
             SELECT num + 1 
             FROM (
                 SELECT CAST(SUBSTRING(user_id, 4) AS UNSIGNED) as num
                 FROM users 
                 WHERE user_id REGEXP '^USR[0-9]{3}$'
                 ORDER BY num
             ) existing
             WHERE num + 1 NOT IN (
                 SELECT CAST(SUBSTRING(user_id, 4) AS UNSIGNED)
                 FROM users 
                 WHERE user_id REGEXP '^USR[0-9]{3}$'
             )
         ) gaps
         WHERE num <= (
             SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) + 1
             FROM users 
             WHERE user_id REGEXP '^USR[0-9]{3}$'
         )
        ),
        (SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) + 1
         FROM users 
         WHERE user_id REGEXP '^USR[0-9]{3}$'
        ),
        1
    ) INTO next_num;
    
    SET next_user_id = CONCAT('USR', LPAD(next_num, 3, '0'));
    RETURN next_user_id;
END //
DELIMITER ;

-- Test the function
SELECT 'Testing next user ID generation:' as info;
SELECT get_next_user_id() as next_available_user_id;

-- Create a procedure to insert a new user with auto-generated ID
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS insert_user_with_id(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_password VARCHAR(255)
)
BEGIN
    DECLARE new_user_id VARCHAR(10);
    
    -- Generate the next available user ID
    SET new_user_id = get_next_user_id();
    
    -- Insert the user
    INSERT INTO users (user_id, name, email, phone, password, created_at)
    VALUES (new_user_id, p_name, p_email, p_phone, p_password, NOW());
    
    -- Return the generated user ID
    SELECT new_user_id as generated_user_id;
END //
DELIMITER ;

-- Test the procedure
SELECT 'Testing user insertion procedure:' as info;
-- Uncomment the line below to test (be careful in production)
-- CALL insert_user_with_id('Test User', 'test@example.com', '1234567890', 'hashed_password');

-- Summary
SELECT 'Setup Summary:' as info;
SELECT 
    'Users Table' as component,
    COUNT(*) as total_records,
    COUNT(CASE WHEN user_id REGEXP '^USR[0-9]{3}$' THEN 1 END) as valid_format,
    COUNT(CASE WHEN user_id IS NULL OR user_id NOT REGEXP '^USR[0-9]{3}$' THEN 1 END) as needs_migration
FROM users
UNION ALL
SELECT 
    'Backup Table' as component,
    COUNT(*) as total_records,
    0 as valid_format,
    0 as needs_migration
FROM users_backup;

-- Clean up backup table (uncomment if you want to remove it)
-- DROP TABLE IF EXISTS users_backup;

SELECT 'User ID Generation System setup completed successfully!' as status;
