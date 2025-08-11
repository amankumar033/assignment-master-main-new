-- Fix vendor IDs to ensure they match between services and vendors tables
-- This script ensures the correct vendor IDs exist for notifications

USE kriptocar;

-- First, let's see what vendor IDs are used in services table
SELECT 'Vendor IDs used in services table:' as info;
SELECT DISTINCT vendor_id FROM services ORDER BY vendor_id;

-- Let's see what vendor IDs exist in vendors table
SELECT 'Vendor IDs in vendors table:' as info;
SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id;

-- Check if we need to add the missing vendor IDs
-- Based on the services table, we need VND1, VND2, etc.
-- Let's add them if they don't exist

INSERT INTO `vendors` (`vendor_id`, `name`, `email`, `phone`, `address`, `city`, `state`, `pincode`, `service_areas`) VALUES
('VND1', 'Quick Fix Auto Services', 'vendor1@kriptocar.com', '+91-9876543220', '123 Service Lane, Auto Hub', 'Mumbai', 'Maharashtra', '400001', '400001,400002,400003'),
('VND2', 'Professional Car Care', 'vendor2@kriptocar.com', '+91-9876543221', '456 Service Center, Industrial Area', 'Delhi', 'Delhi', '110001', '110001,110002,110003'),
('VND3', 'Elite Auto Maintenance', 'vendor3@kriptocar.com', '+91-9876543222', '789 Service Plaza, Tech Park', 'Bangalore', 'Karnataka', '560001', '560001,560002,560003'),
('VND4', 'Express Auto Repair', 'vendor4@kriptocar.com', '+91-9876543223', '321 Service Complex, Business District', 'Hyderabad', 'Telangana', '500001', '500001,500002,500003'),
('VND5', 'Reliable Car Services', 'vendor5@kriptocar.com', '+91-9876543224', '654 Service Hub, Commercial Zone', 'Chennai', 'Tamil Nadu', '600001', '600001,600002,600003'),
('VND6', 'Noida Auto Services', 'vendor6@kriptocar.com', '+91-9876543225', '789 Noida Service Center, Sector 62', 'Noida', 'Uttar Pradesh', '201301', '201301,201302,201303'),
('VND7', 'Gurgaon Car Care', 'vendor7@kriptocar.com', '+91-9876543226', '456 Gurgaon Service Hub, Cyber City', 'Gurgaon', 'Haryana', '122001', '122001,122002,122003'),
('VND8', 'Delhi Auto Solutions', 'vendor8@kriptocar.com', '+91-9876543227', '123 Delhi Service Complex, Connaught Place', 'Delhi', 'Delhi', '110001', '110001,110004,110005')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `email` = VALUES(`email`),
  `phone` = VALUES(`phone`),
  `address` = VALUES(`address`),
  `city` = VALUES(`city`),
  `state` = VALUES(`state`),
  `pincode` = VALUES(`pincode`),
  `service_areas` = VALUES(`service_areas`);

-- Verify the vendors now exist
SELECT 'Final vendor IDs in vendors table:' as info;
SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id;

-- Test vendor lookup for VND1
SELECT 'Testing vendor lookup for VND1:' as info;
SELECT vendor_id, name, email FROM vendors WHERE vendor_id = 'VND1';

-- Show services and their vendors
SELECT 'Services and their vendors:' as info;
SELECT 
  s.service_id,
  s.name as service_name,
  s.vendor_id,
  v.name as vendor_name,
  v.email as vendor_email
FROM services s
LEFT JOIN vendors v ON s.vendor_id = v.vendor_id
ORDER BY s.service_id;

