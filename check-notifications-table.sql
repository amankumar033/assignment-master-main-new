-- Check and create notifications table if it doesn't exist
USE kriptocar;

-- Check if notifications table exists
SELECT COUNT(*) as table_exists 
FROM information_schema.tables 
WHERE table_schema = 'kriptocar' AND table_name = 'notifications';

-- Create notifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS `kriptocar`.`notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `for_admin` tinyint(1) DEFAULT 0,
  `for_dealer` tinyint(1) DEFAULT 0,
  `dealer_id` varchar(50) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_type` (`type`),
  KEY `idx_notifications_for_admin` (`for_admin`),
  KEY `idx_notifications_for_dealer` (`for_dealer`),
  KEY `idx_notifications_dealer_id` (`dealer_id`),
  KEY `idx_notifications_user_id` (`user_id`),
  KEY `idx_notifications_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show table structure
DESCRIBE kriptocar.notifications;

-- Show existing notifications
SELECT * FROM kriptocar.notifications ORDER BY created_at DESC LIMIT 10;

