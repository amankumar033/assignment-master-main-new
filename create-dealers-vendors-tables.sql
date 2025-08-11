-- Create dealers and vendors tables with email support
-- Run this script in your phpMyAdmin database

USE kriptocar;

-- Create dealers table if it doesn't exist
CREATE TABLE IF NOT EXISTS `dealers` (
  `dealer_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`dealer_id`),
  UNIQUE KEY `unique_dealer_email` (`email`),
  KEY `idx_dealers_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS `vendors` (
  `vendor_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `service_areas` text COMMENT 'Comma-separated pincodes where vendor provides services',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `unique_vendor_email` (`email`),
  KEY `idx_vendors_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample dealers data
INSERT INTO `dealers` (`dealer_id`, `name`, `email`, `phone`, `address`, `city`, `state`, `pincode`) VALUES
('DLR000001', 'Auto Parts Plus', 'dealer1@kriptocar.com', '+91-9876543210', '123 Main Street, Auto Market', 'Mumbai', 'Maharashtra', '400001'),
('DLR000002', 'Car Care Center', 'dealer2@kriptocar.com', '+91-9876543211', '456 Industrial Area, Sector 5', 'Delhi', 'Delhi', '110001'),
('DLR000003', 'Premium Auto Solutions', 'dealer3@kriptocar.com', '+91-9876543212', '789 Commercial Complex, MG Road', 'Bangalore', 'Karnataka', '560001'),
('DLR000004', 'Express Auto Parts', 'dealer4@kriptocar.com', '+91-9876543213', '321 Business Park, Tech Hub', 'Hyderabad', 'Telangana', '500001'),
('DLR000005', 'Reliable Auto Supply', 'dealer5@kriptocar.com', '+91-9876543214', '654 Trade Center, Industrial Zone', 'Chennai', 'Tamil Nadu', '600001')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `email` = VALUES(`email`),
  `phone` = VALUES(`phone`),
  `address` = VALUES(`address`),
  `city` = VALUES(`city`),
  `state` = VALUES(`state`),
  `pincode` = VALUES(`pincode`);

-- Insert sample vendors data
INSERT INTO `vendors` (`vendor_id`, `name`, `email`, `phone`, `address`, `city`, `state`, `pincode`, `service_areas`) VALUES
('VND000001', 'Quick Fix Auto Services', 'vendor1@kriptocar.com', '+91-9876543220', '123 Service Lane, Auto Hub', 'Mumbai', 'Maharashtra', '400001', '400001,400002,400003'),
('VND000002', 'Professional Car Care', 'vendor2@kriptocar.com', '+91-9876543221', '456 Service Center, Industrial Area', 'Delhi', 'Delhi', '110001', '110001,110002,110003'),
('VND000003', 'Elite Auto Maintenance', 'vendor3@kriptocar.com', '+91-9876543222', '789 Service Plaza, Tech Park', 'Bangalore', 'Karnataka', '560001', '560001,560002,560003'),
('VND000004', 'Express Auto Repair', 'vendor4@kriptocar.com', '+91-9876543223', '321 Service Complex, Business District', 'Hyderabad', 'Telangana', '500001', '500001,500002,500003'),
('VND000005', 'Reliable Car Services', 'vendor5@kriptocar.com', '+91-9876543224', '654 Service Hub, Commercial Zone', 'Chennai', 'Tamil Nadu', '600001', '600001,600002,600003')
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `email` = VALUES(`email`),
  `phone` = VALUES(`phone`),
  `address` = VALUES(`address`),
  `city` = VALUES(`city`),
  `state` = VALUES(`state`),
  `pincode` = VALUES(`pincode`),
  `service_areas` = VALUES(`service_areas`);

-- Show table structures
DESCRIBE dealers;
DESCRIBE vendors;

-- Show sample data
SELECT 'Dealers' as table_name, dealer_id, name, email, city FROM dealers LIMIT 5;
SELECT 'Vendors' as table_name, vendor_id, name, email, city FROM vendors LIMIT 5;

-- Count records
SELECT 'Dealers Count' as info, COUNT(*) as count FROM dealers
UNION ALL
SELECT 'Vendors Count' as info, COUNT(*) as count FROM vendors;
