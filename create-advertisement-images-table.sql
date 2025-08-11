-- Create advertisement_images table
USE kriptocar;

-- Create advertisement_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS `kriptocar`.`advertisement_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample data for testing
INSERT INTO `kriptocar`.`advertisement_images` (`id`, `image`, `name`) VALUES
(1, '/pst1.png', 'Advertisement 1'),
(2, '/pst2.png', 'Advertisement 2')
ON DUPLICATE KEY UPDATE 
  `image` = VALUES(`image`),
  `name` = VALUES(`name`);

-- Show table structure
DESCRIBE kriptocar.advertisement_images;

-- Show existing advertisement images
SELECT * FROM kriptocar.advertisement_images ORDER BY id;
