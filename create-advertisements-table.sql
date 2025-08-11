-- Create advertisements table with blob image storage
USE kriptocar;

-- Create advertisements table if it doesn't exist
CREATE TABLE IF NOT EXISTS `kriptocar`.`advertisements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image` LONGBLOB NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Show table structure
DESCRIBE kriptocar.advertisements;

-- Show existing advertisements
SELECT id, name, LENGTH(image) as image_size_bytes FROM kriptocar.advertisements ORDER BY id;
