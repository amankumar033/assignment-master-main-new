-- Add description column to notifications table
-- This script adds a description field for detailed notification information

USE kriptocar;

-- Check if description column exists
SELECT 'Checking notifications table structure:' as info;
DESCRIBE notifications;

-- Add description column if it doesn't exist
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS description TEXT 
AFTER message;

-- Update the table structure to ensure proper column order
ALTER TABLE notifications 
MODIFY COLUMN description TEXT 
COMMENT 'Detailed description of the notification';

-- Show updated table structure
SELECT 'Updated notifications table structure:' as info;
DESCRIBE notifications;

-- Show sample notifications
SELECT 'Sample notifications:' as info;
SELECT 
  notification_id,
  type,
  title,
  LEFT(message, 50) as message_preview,
  LEFT(description, 50) as description_preview,
  for_admin,
  for_dealer,
  for_vendor,
  created_at
FROM notifications 
ORDER BY created_at DESC 
LIMIT 5;

