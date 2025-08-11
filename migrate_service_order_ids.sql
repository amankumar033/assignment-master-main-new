-- Migration script to add service_order_id column to service_orders table
-- Run this script in your MySQL database

USE kriptocar;

-- Add service_order_id column to service_orders table
ALTER TABLE `kriptocar`.`service_orders`
ADD COLUMN `service_order_id` VARCHAR(20) UNIQUE NULL AFTER `service_order_id`;

-- Create index for better performance
CREATE INDEX idx_service_orders_service_order_id ON kriptocar.service_orders(service_order_id);

-- Update existing service orders to assign them sequential SRVD format IDs
SET @counter = 1;
UPDATE `kriptocar`.`service_orders`
SET `service_order_id` = CONCAT('SRVD', LPAD(@counter := @counter + 1, 6, '0'))
WHERE `service_order_id` IS NULL;

-- Make service_order_id NOT NULL after population
ALTER TABLE `kriptocar`.`service_orders`
MODIFY COLUMN `service_order_id` VARCHAR(20) NOT NULL;

-- Add unique constraint
ALTER TABLE `kriptocar`.`service_orders`
ADD UNIQUE KEY `unique_service_order_id` (`service_order_id`);

-- Verify the changes
SELECT COUNT(*) as total_service_orders,
       MIN(service_order_id) as first_service_order_id,
       MAX(service_order_id) as last_service_order_id
FROM kriptocar.service_orders;
