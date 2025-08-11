-- Migration script to add order_id column to orders table
-- Run this script in your MySQL database

USE kriptocar;

-- Add order_id column to orders table
ALTER TABLE `kriptocar`.`orders`
ADD COLUMN `order_id` VARCHAR(20) UNIQUE NULL AFTER `id`;

-- Create index for better performance
CREATE INDEX idx_orders_order_id ON kriptocar.orders(order_id);

-- Update existing orders to assign them sequential ORD format IDs
SET @counter = 1;
UPDATE `kriptocar`.`orders`
SET `order_id` = CONCAT('ORD', LPAD(@counter := @counter + 1, 6, '0'))
WHERE `order_id` IS NULL;

-- Make order_id NOT NULL after population
ALTER TABLE `kriptocar`.`orders`
MODIFY COLUMN `order_id` VARCHAR(20) NOT NULL;

-- Add unique constraint
ALTER TABLE `kriptocar`.`orders`
ADD UNIQUE KEY `unique_order_id` (`order_id`);

-- Verify the changes
SELECT COUNT(*) as total_orders, 
       MIN(order_id) as first_order_id, 
       MAX(order_id) as last_order_id 
FROM kriptocar.orders;

