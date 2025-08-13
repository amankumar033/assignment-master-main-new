-- Update ID Formats to New System
-- This script updates existing order and service order IDs to match the new format
-- Run this script in your MySQL database

USE kriptocar;

-- First, let's see what we have
SELECT 'Current orders:' as info;
SELECT order_id, user_id, order_date 
FROM orders 
ORDER BY user_id, order_date 
LIMIT 10;

SELECT 'Current service orders:' as info;
SELECT service_order_id, user_id, booking_date 
FROM service_orders 
ORDER BY user_id, booking_date 
LIMIT 10;

-- Check for any IDs that don't match the new format
SELECT 'Orders with old format:' as info;
SELECT order_id, user_id 
FROM orders 
WHERE order_id NOT REGEXP '^ORD[0-9]+[0-9]+$'
LIMIT 10;

SELECT 'Service orders with old format:' as info;
SELECT service_order_id, user_id 
FROM service_orders 
WHERE service_order_id NOT REGEXP '^SRVD[0-9]+[0-9]+$'
LIMIT 10;

-- Create backup tables
CREATE TABLE IF NOT EXISTS orders_backup_new AS SELECT * FROM orders;
CREATE TABLE IF NOT EXISTS service_orders_backup_new AS SELECT * FROM service_orders;

-- Update order IDs to new format (if needed)
-- This is a sample update - only run if you need to convert old IDs
/*
UPDATE orders 
SET order_id = CONCAT('ORD', 
    LPAD(SUBSTRING(user_id, 4), 3, '0'), 
    LPAD(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY order_date), 2, '0')
)
WHERE order_id NOT REGEXP '^ORD[0-9]+[0-9]+$';
*/

-- Update service order IDs to new format (if needed)
-- This is a sample update - only run if you need to convert old IDs
/*
UPDATE service_orders 
SET service_order_id = CONCAT('SRVD', 
    LPAD(SUBSTRING(user_id, 4), 3, '0'), 
    LPAD(ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY booking_date), 2, '0')
)
WHERE service_order_id NOT REGEXP '^SRVD[0-9]+[0-9]+$';
*/

-- Verify the new format works
SELECT 'Verifying new order ID format:' as info;
SELECT 
    user_id,
    COUNT(*) as total_orders,
    MIN(order_id) as first_order,
    MAX(order_id) as last_order
FROM orders 
GROUP BY user_id 
ORDER BY user_id 
LIMIT 10;

SELECT 'Verifying new service order ID format:' as info;
SELECT 
    user_id,
    COUNT(*) as total_service_orders,
    MIN(service_order_id) as first_service_order,
    MAX(service_order_id) as last_service_order
FROM service_orders 
GROUP BY user_id 
ORDER BY user_id 
LIMIT 10;

-- Test ID generation logic
SELECT 'Testing ID generation for USR001:' as info;

-- Simulate order ID generation for USR001
SELECT 
    CONCAT('ORD001', LPAD(ROW_NUMBER() OVER (ORDER BY order_date), 1, '')) as generated_order_id,
    order_id as current_order_id,
    user_id,
    order_date
FROM orders 
WHERE user_id = 'USR001' 
ORDER BY order_date 
LIMIT 5;

-- Simulate service order ID generation for USR001
SELECT 
    CONCAT('SRVD001', LPAD(ROW_NUMBER() OVER (ORDER BY booking_date), 1, '')) as generated_service_order_id,
    service_order_id as current_service_order_id,
    user_id,
    booking_date
FROM service_orders 
WHERE user_id = 'USR001' 
ORDER BY booking_date 
LIMIT 5;

-- Check for any duplicates
SELECT 'Checking for duplicate order IDs:' as info;
SELECT order_id, COUNT(*) as count
FROM orders 
GROUP BY order_id 
HAVING COUNT(*) > 1;

SELECT 'Checking for duplicate service order IDs:' as info;
SELECT service_order_id, COUNT(*) as count
FROM service_orders 
GROUP BY service_order_id 
HAVING COUNT(*) > 1;

-- Summary
SELECT 'ID Format Summary:' as info;
SELECT 
    'Orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN order_id REGEXP '^ORD[0-9]+[0-9]+$' THEN 1 END) as correct_format,
    COUNT(CASE WHEN order_id NOT REGEXP '^ORD[0-9]+[0-9]+$' THEN 1 END) as incorrect_format
FROM orders
UNION ALL
SELECT 
    'Service Orders' as table_name,
    COUNT(*) as total_records,
    COUNT(CASE WHEN service_order_id REGEXP '^SRVD[0-9]+[0-9]+$' THEN 1 END) as correct_format,
    COUNT(CASE WHEN service_order_id NOT REGEXP '^SRVD[0-9]+[0-9]+$' THEN 1 END) as incorrect_format
FROM service_orders;

-- Clean up backup tables (uncomment if you want to remove them)
-- DROP TABLE IF EXISTS orders_backup_new;
-- DROP TABLE IF EXISTS service_orders_backup_new;

SELECT 'Script completed successfully!' as status;
