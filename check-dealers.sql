-- Check dealers table and existing dealer IDs
USE kriptocar;

-- Show dealers table structure
DESCRIBE dealers;

-- Show existing dealers
SELECT dealer_id, name, email FROM dealers LIMIT 10;

-- Count total dealers
SELECT COUNT(*) as total_dealers FROM dealers;

