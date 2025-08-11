-- Create order counter table for generating unique order IDs
-- Run this script in your MySQL database

USE kriptocar;

-- Create the order counter table
CREATE TABLE IF NOT EXISTS `order_counter` (
  `id` INT PRIMARY KEY DEFAULT 1,
  `next_number` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert initial counter value
INSERT INTO `order_counter` (`id`, `next_number`) 
VALUES (1, 1) 
ON DUPLICATE KEY UPDATE `next_number` = `next_number`;

-- Verify the counter table
SELECT * FROM order_counter;

-- Get current maximum order number to sync the counter
SELECT 
  'Current max order number:' as info,
  MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)) as max_number 
FROM orders 
WHERE order_id LIKE 'ORD%';

-- Update counter to be one more than the current maximum (if orders exist)
UPDATE order_counter 
SET next_number = (
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) + 1 
  FROM orders 
  WHERE order_id LIKE 'ORD%'
)
WHERE id = 1;

-- Verify final counter value
SELECT * FROM order_counter;
