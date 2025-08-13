-- Notification ID Generation System Setup
-- This script sets up the notifications table and migrates existing data to the new NOT format
-- Run this script in your MySQL database

USE kriptocar;

-- First, let's see what we have
SELECT 'Current notifications table structure:' as info;
DESCRIBE notifications;

SELECT 'Current notifications in database:' as info;
SELECT notification_id, user_id, notification_type, title, message 
FROM notifications 
ORDER BY notification_id 
LIMIT 10;

-- Check for any notifications that don't match the new format
SELECT 'Notifications with old format:' as info;
SELECT notification_id, user_id, notification_type 
FROM notifications 
WHERE notification_id IS NULL OR notification_id NOT REGEXP '^NOT[0-9]{3}$'
LIMIT 10;

-- Create backup table
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;

-- Add notification_id column if it doesn't exist
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_id VARCHAR(10) UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_notification_id ON notifications(notification_id);

-- Update existing notifications to new format (if needed)
-- This is a sample update - only run if you need to convert old IDs
/*
UPDATE notifications 
SET notification_id = CONCAT('NOT', 
    LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')
)
WHERE notification_id IS NULL OR notification_id NOT REGEXP '^NOT[0-9]{3}$';
*/

-- Verify the new format works
SELECT 'Verifying new notification ID format:' as info;
SELECT 
    notification_id,
    user_id,
    notification_type,
    CASE 
        WHEN notification_id REGEXP '^NOT[0-9]{3}$' THEN '✅ Valid Format'
        WHEN notification_id IS NULL THEN '❌ NULL'
        ELSE '❌ Invalid Format'
    END as format_status
FROM notifications 
ORDER BY notification_id 
LIMIT 10;

-- Check for any duplicates
SELECT 'Checking for duplicate notification IDs:' as info;
SELECT notification_id, COUNT(*) as count
FROM notifications 
WHERE notification_id IS NOT NULL
GROUP BY notification_id 
HAVING COUNT(*) > 1;

-- Test ID generation logic
SELECT 'Testing ID generation for new notifications:' as info;

-- Simulate notification ID generation
SELECT 
    CONCAT('NOT', LPAD(ROW_NUMBER() OVER (ORDER BY id), 3, '0')) as generated_notification_id,
    notification_id as current_notification_id,
    user_id,
    notification_type
FROM notifications 
ORDER BY id 
LIMIT 5;

-- Get statistics about notification ID usage
SELECT 'Notification ID Statistics:' as info;

-- Count total notifications
SELECT COUNT(*) as total_notifications FROM notifications;

-- Count notifications with valid format
SELECT COUNT(*) as valid_format_notifications 
FROM notifications 
WHERE notification_id REGEXP '^NOT[0-9]{3}$';

-- Count notifications with invalid format
SELECT COUNT(*) as invalid_format_notifications 
FROM notifications 
WHERE notification_id IS NULL OR notification_id NOT REGEXP '^NOT[0-9]{3}$';

-- Find the maximum notification number
SELECT 
    MAX(CAST(SUBSTRING(notification_id, 4) AS UNSIGNED)) as max_notification_number
FROM notifications 
WHERE notification_id REGEXP '^NOT[0-9]{3}$';

-- Show range information
SELECT 'Range Analysis:' as info;

-- Show notifications by range
SELECT 
    CONCAT('Range ', FLOOR((CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) - 1) / 10) + 1) as range_number,
    CONCAT('NOT', LPAD(FLOOR((CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) - 1) / 10) * 10 + 1, 3, '0'), 
           ' to NOT', LPAD(FLOOR((CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) - 1) / 10) * 10 + 10, 3, '0')) as range_description,
    COUNT(*) as notifications_in_range
FROM notifications 
WHERE notification_id REGEXP '^NOT[0-9]{3}$'
GROUP BY FLOOR((CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) - 1) / 10)
ORDER BY range_number;

-- Find gaps in the sequence
SELECT 'Gap Analysis:' as info;

-- This query finds gaps in the notification number sequence
WITH RECURSIVE numbers AS (
    SELECT 1 as num
    UNION ALL
    SELECT num + 1 FROM numbers WHERE num < (
        SELECT MAX(CAST(SUBSTRING(notification_id, 4) AS UNSIGNED)) 
        FROM notifications 
        WHERE notification_id REGEXP '^NOT[0-9]{3}$'
    )
),
existing_numbers AS (
    SELECT CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) as notification_num
    FROM notifications 
    WHERE notification_id REGEXP '^NOT[0-9]{3}$'
)
SELECT 
    n.num as missing_number,
    CONCAT('NOT', LPAD(n.num, 3, '0')) as missing_notification_id
FROM numbers n
LEFT JOIN existing_numbers e ON n.num = e.notification_num
WHERE e.notification_num IS NULL
ORDER BY n.num
LIMIT 10;

-- Create a function to generate the next available notification ID
DELIMITER //
CREATE FUNCTION IF NOT EXISTS get_next_notification_id() 
RETURNS VARCHAR(10)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE next_num INT;
    DECLARE next_notification_id VARCHAR(10);
    
    -- Find the next available number
    SELECT COALESCE(
        (SELECT MIN(num) 
         FROM (
             SELECT 1 as num
             UNION ALL
             SELECT num + 1 
             FROM (
                 SELECT CAST(SUBSTRING(notification_id, 4) AS UNSIGNED) as num
                 FROM notifications 
                 WHERE notification_id REGEXP '^NOT[0-9]{3}$'
                 ORDER BY num
             ) existing
             WHERE num + 1 NOT IN (
                 SELECT CAST(SUBSTRING(notification_id, 4) AS UNSIGNED)
                 FROM notifications 
                 WHERE notification_id REGEXP '^NOT[0-9]{3}$'
             )
         ) gaps
         WHERE num <= (
             SELECT MAX(CAST(SUBSTRING(notification_id, 4) AS UNSIGNED)) + 1
             FROM notifications 
             WHERE notification_id REGEXP '^NOT[0-9]{3}$'
         )
        ),
        (SELECT MAX(CAST(SUBSTRING(notification_id, 4) AS UNSIGNED)) + 1
         FROM notifications 
         WHERE notification_id REGEXP '^NOT[0-9]{3}$'
        ),
        1
    ) INTO next_num;
    
    SET next_notification_id = CONCAT('NOT', LPAD(next_num, 3, '0'));
    RETURN next_notification_id;
END //
DELIMITER ;

-- Test the function
SELECT 'Testing next notification ID generation:' as info;
SELECT get_next_notification_id() as next_available_notification_id;

-- Create a procedure to insert a new notification with auto-generated ID
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS insert_notification_with_id(
    IN p_user_id VARCHAR(20),
    IN p_notification_type VARCHAR(50),
    IN p_title VARCHAR(200),
    IN p_message TEXT
)
BEGIN
    DECLARE new_notification_id VARCHAR(10);
    
    -- Generate the next available notification ID
    SET new_notification_id = get_next_notification_id();
    
    -- Insert the notification
    INSERT INTO notifications (notification_id, user_id, notification_type, title, message, is_read, created_at)
    VALUES (new_notification_id, p_user_id, p_notification_type, p_title, p_message, FALSE, NOW());
    
    -- Return the generated notification ID
    SELECT new_notification_id as generated_notification_id;
END //
DELIMITER ;

-- Test the procedure
SELECT 'Testing notification insertion procedure:' as info;
-- Uncomment the line below to test (be careful in production)
-- CALL insert_notification_with_id('USR001', 'test_notification', 'Test Title', 'Test Message');

-- Summary
SELECT 'Setup Summary:' as info;
SELECT 
    'Notifications Table' as component,
    COUNT(*) as total_records,
    COUNT(CASE WHEN notification_id REGEXP '^NOT[0-9]{3}$' THEN 1 END) as valid_format,
    COUNT(CASE WHEN notification_id IS NULL OR notification_id NOT REGEXP '^NOT[0-9]{3}$' THEN 1 END) as needs_migration
FROM notifications
UNION ALL
SELECT 
    'Backup Table' as component,
    COUNT(*) as total_records,
    0 as valid_format,
    0 as needs_migration
FROM notifications_backup;

-- Clean up backup table (uncomment if you want to remove it)
-- DROP TABLE IF EXISTS notifications_backup;

SELECT 'Notification ID Generation System setup completed successfully!' as status;
