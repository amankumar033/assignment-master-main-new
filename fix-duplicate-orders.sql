-- Fix duplicate orders and add proper constraints
-- Run this script in your MySQL database

USE kriptocar;

-- First, let's see what orders exist
SELECT 'Current orders:' as info;
SELECT order_id, user_id, customer_name, order_date 
FROM orders 
ORDER BY order_id;

-- Check for any duplicate order IDs
SELECT 'Checking for duplicate order IDs:' as info;
SELECT order_id, COUNT(*) as count
FROM orders 
GROUP BY order_id 
HAVING COUNT(*) > 1;

-- Create a backup of existing data
CREATE TABLE IF NOT EXISTS orders_backup AS 
SELECT * FROM orders;

-- If duplicates exist, fix them by adding a suffix
SET @counter = 1;
UPDATE orders 
SET order_id = CONCAT(order_id, '_', @counter := @counter + 1)
WHERE order_id IN (
  SELECT order_id FROM (
    SELECT order_id 
    FROM orders 
    GROUP BY order_id 
    HAVING COUNT(*) > 1
  ) AS duplicates
);

-- Add unique constraint to order_id column
ALTER TABLE orders 
ADD UNIQUE KEY unique_order_id (order_id);

-- Add index for better performance
CREATE INDEX idx_orders_user_date ON orders(user_id, order_date);
CREATE INDEX idx_orders_dealer_date ON orders(dealer_id, order_date);

-- Add check constraint to ensure order_id format
ALTER TABLE orders 
ADD CONSTRAINT chk_order_id_format 
CHECK (order_id REGEXP '^ORD[0-9]{5}$');

-- Verify the constraints
SELECT 'Verifying constraints:' as info;
SELECT 
  COUNT(*) as total_orders,
  COUNT(DISTINCT order_id) as unique_order_ids,
  MIN(order_id) as first_order_id,
  MAX(order_id) as last_order_id
FROM orders;

-- Show any remaining issues
SELECT 'Remaining issues:' as info;
SELECT order_id, COUNT(*) as count
FROM orders 
GROUP BY order_id 
HAVING COUNT(*) > 1;

-- Test the order ID generation
SELECT 'Testing next order ID:' as info;
SELECT CONCAT('ORD', LPAD(COALESCE(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) + 1, 5, '0')) as next_order_id
FROM orders 
WHERE order_id REGEXP '^ORD[0-9]{5}$';
