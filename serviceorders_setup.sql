-- Service Orders table setup
-- Run this script in your phpMyAdmin database

-- Create service_orders table
CREATE TABLE IF NOT EXISTS `service_orders` (
  `service_order_id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `service_id` int(11) NOT NULL,
  `vendor_id` int(11) NOT NULL,
  `service_name` varchar(100) NOT NULL,
  `service_description` text,
  `service_category` varchar(50) NOT NULL,
  `service_type` varchar(50) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `final_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `booking_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `service_date` date NOT NULL,
  `service_time` time NOT NULL,
  `service_status` varchar(20) DEFAULT 'Pending',
  `service_pincode` varchar(10) NOT NULL,
  `service_address` text NOT NULL,
  `additional_notes` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` varchar(20) DEFAULT 'Pending',
  `transaction_id` varchar(100) DEFAULT NULL,
  `was_available` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`service_order_id`),
  KEY `user_id` (`user_id`),
  KEY `service_id` (`service_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `service_date` (`service_date`),
  KEY `service_status` (`service_status`),
  KEY `service_pincode` (`service_pincode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add foreign key constraints (optional - uncomment if you want referential integrity)
-- ALTER TABLE `service_orders` ADD CONSTRAINT `fk_service_orders_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;
-- ALTER TABLE `service_orders` ADD CONSTRAINT `fk_service_orders_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`service_id`) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_service_orders_user_date ON service_orders(user_id, service_date);
CREATE INDEX idx_service_orders_status ON service_orders(service_status, service_date);
CREATE INDEX idx_service_orders_vendor ON service_orders(vendor_id, service_status); 