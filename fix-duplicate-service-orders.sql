-- Fix duplicate service order IDs and ensure proper ID generation
-- This script cleans up any existing duplicates and resets the ID sequence to use SRV format

USE kriptocar;

-- First, let's see what service orders exist
SELECT 'Current service orders:' as info;
SELECT service_order_id, user_id, service_name, booking_date 
FROM service_orders 
ORDER BY service_order_id;

-- Check for any duplicate service order IDs
SELECT 'Checking for duplicate service order IDs:' as info;
SELECT service_order_id, COUNT(*) as count
FROM service_orders 
GROUP BY service_order_id 
HAVING COUNT(*) > 1;

-- Create a backup of existing data
CREATE TABLE IF NOT EXISTS service_orders_backup AS 
SELECT * FROM service_orders;

-- Convert existing SRVD format to SRV format and fix duplicates
-- First, let's see what formats we have
SELECT 'Current ID formats:' as info;
SELECT DISTINCT 
  CASE 
    WHEN service_order_id LIKE 'SRVD%' THEN 'SRVD format'
    WHEN service_order_id LIKE 'SRV%' THEN 'SRV format'
    ELSE 'Other format'
  END as format_type,
  COUNT(*) as count
FROM service_orders 
GROUP BY format_type;

-- Convert SRVD format to SRV format and fix duplicates
-- This will convert SRVD000001 to SRV1, SRVD000002 to SRV2, etc.
SET @counter = 1;

UPDATE service_orders 
SET service_order_id = CONCAT('SRV', @counter := @counter + 1)
WHERE service_order_id LIKE 'SRVD%'
ORDER BY service_order_id;

-- If there are any remaining duplicates, fix them
-- This handles cases where we might have both SRVD and SRV formats
SET @counter = (SELECT COALESCE(MAX(CAST(SUBSTRING(service_order_id, 4) AS UNSIGNED)), 0) + 1 FROM service_orders WHERE service_order_id LIKE 'SRV%');

UPDATE service_orders 
SET service_order_id = CONCAT('SRV', @counter := @counter + 1)
WHERE service_order_id IN (
  SELECT service_order_id FROM (
    SELECT service_order_id 
    FROM service_orders 
    GROUP BY service_order_id 
    HAVING COUNT(*) > 1
  ) AS duplicates
);

-- Verify the fix
SELECT 'Service orders after fix:' as info;
SELECT service_order_id, user_id, service_name, booking_date 
FROM service_orders 
ORDER BY service_order_id;

-- Check for any remaining duplicates
SELECT 'Checking for remaining duplicates:' as info;
SELECT service_order_id, COUNT(*) as count
FROM service_orders 
GROUP BY service_order_id 
HAVING COUNT(*) > 1;

-- Show the current maximum service order number
SELECT 'Current maximum service order number:' as info;
SELECT MAX(CAST(SUBSTRING(service_order_id, 4) AS UNSIGNED)) as max_number 
FROM service_orders 
WHERE service_order_id LIKE 'SRV%';

-- Test ID generation logic for new format
SELECT 'Testing ID generation for SRV format:' as info;
SELECT 
  CONCAT('SRV', COALESCE(MAX(CAST(SUBSTRING(service_order_id, 4) AS UNSIGNED)), 0) + 1) as next_id
FROM service_orders 
WHERE service_order_id LIKE 'SRV%';

-- Show final status
SELECT 'Final service order count:' as info;
SELECT COUNT(*) as total_service_orders FROM service_orders;
