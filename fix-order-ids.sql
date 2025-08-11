-- Fix inconsistent order IDs in the database
-- This script will update existing order IDs to have consistent formatting

-- First, let's see what we have
SELECT 'Current order IDs:' as info;
SELECT order_id FROM kriptocar.orders WHERE order_id LIKE 'ORD%' ORDER BY order_id;

-- Update ORD2 to ORD000002
UPDATE kriptocar.orders 
SET order_id = 'ORD000002' 
WHERE order_id = 'ORD2';

-- Verify the changes
SELECT 'After fixing ORD2:' as info;
SELECT order_id FROM kriptocar.orders WHERE order_id LIKE 'ORD%' ORDER BY order_id;

-- Show the next order ID that should be generated
SELECT 'Next order ID should be:' as info;
SELECT CONCAT('ORD', LPAD(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)) + 1, 6, '0')) as next_order_id
FROM kriptocar.orders 
WHERE order_id LIKE 'ORD%';
