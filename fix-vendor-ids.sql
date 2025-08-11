-- Fix vendor ID mismatch between services and vendors tables
-- This script aligns the vendor IDs so notifications work properly

USE kriptocar;

-- First, let's see what vendor IDs exist in both tables
SELECT 'Services table vendor IDs:' as info;
SELECT DISTINCT vendor_id FROM services ORDER BY vendor_id;

SELECT 'Vendors table vendor IDs:' as info;
SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id;

-- Create a mapping table to convert numeric vendor IDs to string IDs
-- Based on the services data, we need vendors with IDs 1-8
-- Let's insert the missing vendors with proper IDs

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

-- Now update the services table to use string vendor IDs
UPDATE services SET vendor_id = 'VND1' WHERE vendor_id = 1;
UPDATE services SET vendor_id = 'VND2' WHERE vendor_id = 2;
UPDATE services SET vendor_id = 'VND3' WHERE vendor_id = 3;
UPDATE services SET vendor_id = 'VND4' WHERE vendor_id = 4;
UPDATE services SET vendor_id = 'VND5' WHERE vendor_id = 5;
UPDATE services SET vendor_id = 'VND6' WHERE vendor_id = 6;
UPDATE services SET vendor_id = 'VND7' WHERE vendor_id = 7;
UPDATE services SET vendor_id = 'VND8' WHERE vendor_id = 8;

-- Verify the changes
SELECT 'Updated Services table vendor IDs:' as info;
SELECT DISTINCT vendor_id FROM services ORDER BY vendor_id;

SELECT 'Final Vendors table:' as info;
SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id;

-- Test vendor lookup
SELECT 'Testing vendor lookup for VND1:' as info;
SELECT vendor_id, name, email FROM vendors WHERE vendor_id = 'VND1';

-- Show services for each vendor
SELECT 'Services by vendor:' as info;
SELECT s.vendor_id, v.name as vendor_name, s.name as service_name, s.base_price
FROM services s
LEFT JOIN vendors v ON s.vendor_id = v.vendor_id
ORDER BY s.vendor_id, s.name;

