-- Check notification types and structure
USE kriptocar;

-- Show the ENUM values for the type column
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'kriptocar' 
AND TABLE_NAME = 'notifications' 
AND COLUMN_NAME = 'type';

-- Show existing notifications to see what types are used
SELECT DISTINCT type, COUNT(*) as count 
FROM kriptocar.notifications 
GROUP BY type 
ORDER BY count DESC;

-- Show table structure
DESCRIBE kriptocar.notifications;

