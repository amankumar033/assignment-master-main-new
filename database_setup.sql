-- Database setup for location-based service discovery
-- Run this script in your phpMyAdmin database

-- Create services table
CREATE TABLE IF NOT EXISTS `services` (
  `service_id` int(11) NOT NULL AUTO_INCREMENT,
  `vendor_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `type` varchar(100) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `service_pincodes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `category` (`category`),
  KEY `is_available` (`is_available`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create service_pincodes table
CREATE TABLE IF NOT EXISTS `service_pincodes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `service_id` int(11) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `service_id` (`service_id`),
  KEY `pincode` (`pincode`),
  CONSTRAINT `fk_service_pincode` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert sample data for services table
INSERT INTO `services` (`vendor_id`, `name`, `description`, `category`, `type`, `base_price`, `duration_minutes`, `is_available`, `service_pincodes`) VALUES
(1, 'Engine Oil Change', 'Complete engine oil change with premium quality oil', 'Maintenance', 'Oil Service', 29.99, 45, 1, '400001,400002,400003'),
(1, 'Brake Pad Replacement', 'Replace brake pads with high-quality materials', 'Repair', 'Brake Service', 89.99, 90, 1, '400001,400002,400004'),
(2, 'Tire Rotation', 'Rotate tires for even wear and better performance', 'Maintenance', 'Tire Service', 19.99, 30, 1, '400002,400003,400005'),
(2, 'Air Filter Replacement', 'Replace air filter for better engine performance', 'Maintenance', 'Filter Service', 24.99, 20, 1, '400003,400004,400006'),
(3, 'Battery Replacement', 'Replace car battery with warranty', 'Repair', 'Electrical Service', 129.99, 60, 1, '400001,400005,400007'),
(3, 'Wheel Alignment', 'Professional wheel alignment service', 'Maintenance', 'Alignment Service', 49.99, 60, 1, '400002,400006,400008'),
(4, 'AC Service', 'Complete AC system service and maintenance', 'Maintenance', 'AC Service', 79.99, 75, 1, '400004,400007,400009'),
(4, 'Transmission Service', 'Transmission fluid change and inspection', 'Maintenance', 'Transmission Service', 149.99, 120, 1, '400005,400008,400010'),
(5, 'Spark Plug Replacement', 'Replace spark plugs for better ignition', 'Repair', 'Engine Service', 39.99, 40, 1, '400006,400009,400011'),
(5, 'Fuel Filter Replacement', 'Replace fuel filter for clean fuel supply', 'Maintenance', 'Filter Service', 34.99, 35, 1, '400007,400010,400012'),
-- Delhi NCR Services
(6, 'Noida Car Wash', 'Premium car wash service in Noida', 'Maintenance', 'Cleaning Service', 15.99, 30, 1, '201301,201302,201303'),
(6, 'Delhi Brake Service', 'Professional brake service in Delhi', 'Repair', 'Brake Service', 95.99, 90, 1, '110001,110002,110003'),
(7, 'Gurgaon Oil Change', 'Quick oil change service in Gurgaon', 'Maintenance', 'Oil Service', 32.99, 45, 1, '122001,122002,122003'),
(7, 'Noida AC Repair', 'AC repair and maintenance in Noida', 'Repair', 'AC Service', 85.99, 75, 1, '201301,201304,201305'),
(8, 'Delhi Tire Service', 'Tire replacement and repair in Delhi', 'Repair', 'Tire Service', 25.99, 40, 1, '110001,110004,110005');

-- Insert sample data for service_pincodes table
INSERT INTO `service_pincodes` (`service_id`, `pincode`) VALUES
(1, '400001'),
(1, '400002'),
(1, '400003'),
(2, '400001'),
(2, '400002'),
(2, '400004'),
(3, '400002'),
(3, '400003'),
(3, '400005'),
(4, '400003'),
(4, '400004'),
(4, '400006'),
(5, '400001'),
(5, '400005'),
(5, '400007'),
(6, '400002'),
(6, '400006'),
(6, '400008'),
(7, '400004'),
(7, '400007'),
(7, '400009'),
(8, '400005'),
(8, '400008'),
(8, '400010'),
(9, '400006'),
(9, '400009'),
(9, '400011'),
(10, '400007'),
(10, '400010'),
(10, '400012'),
-- Delhi NCR Service Pincodes
(11, '201301'),
(11, '201302'),
(11, '201303'),
(12, '110001'),
(12, '110002'),
(12, '110003'),
(13, '122001'),
(13, '122002'),
(13, '122003'),
(14, '201301'),
(14, '201304'),
(14, '201305'),
(15, '110001'),
(15, '110004'),
(15, '110005');

-- Create index for better performance
CREATE INDEX idx_service_pincode_lookup ON service_pincodes(service_id, pincode);
CREATE INDEX idx_services_available ON services(is_available, category);

-- Add cart_items field to users table
ALTER TABLE `kriptocar`.`users` 
ADD COLUMN `cart_items` JSON DEFAULT NULL COMMENT 'JSON array of cart items'; 