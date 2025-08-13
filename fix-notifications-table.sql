-- Fix notifications table structure to match the notification system requirements
-- Run this script in your phpMyAdmin database

USE kriptocar;

-- Drop the old notifications table if it exists
DROP TABLE IF EXISTS `notifications`;

-- Create the correct notifications table
CREATE TABLE `notifications` (
  `notification_id` varchar(20) NOT NULL,
  `user_id` varchar(20) NOT NULL,
  `notification_type` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`notification_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_notification_type` (`notification_type`),
  KEY `idx_is_read` (`is_read`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample notifications for testing
INSERT INTO `notifications` (`notification_id`, `user_id`, `notification_type`, `title`, `message`, `is_read`) VALUES
('NOT001', 'USR001', 'system', 'Welcome to KriptoCar', 'Welcome to KriptoCar! Your account has been created successfully.', 0),
('NOT002', 'USR001', 'order_placed', 'Order Placed Successfully', 'Your order has been placed successfully and is being processed.', 0),
('NOT003', 'DLR000001', 'order_received', 'New Order Received', 'You have received a new order from a customer.', 0);

-- Verify the table was created correctly
SELECT COUNT(*) as total_notifications FROM notifications;
DESCRIBE notifications;
