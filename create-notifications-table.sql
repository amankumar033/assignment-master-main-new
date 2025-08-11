-- Create notifications table for admin notifications
-- Run this script in your phpMyAdmin database

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `for_admin` tinyint(1) DEFAULT 0,
  `user_id` varchar(20) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_for_admin` (`for_admin`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert a sample notification to test
INSERT INTO `notifications` (`type`, `title`, `message`, `for_admin`, `user_id`, `is_read`) VALUES
('system', 'System Started', 'The notification system is now active.', 1, NULL, 0)
ON DUPLICATE KEY UPDATE `updated_at` = CURRENT_TIMESTAMP;

-- Verify the table was created
SELECT COUNT(*) as total_notifications FROM notifications;
