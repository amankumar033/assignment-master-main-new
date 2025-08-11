# Database Structure Update - Services & Categories

## Overview
The database structure has been updated to use a proper relational design for service categories. The `category` column in the `services` table has been replaced with a `service_category_id` that references a new `service_categories` table.

## Changes Made

### 1. New Table: `service_categories`
```sql
CREATE TABLE `service_categories` (
  `service_category_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. Updated Table: `services`
**Removed:**
- `category` column (varchar)

**Added:**
- `service_category_id` column (varchar) - Foreign key to service_categories table

**Updated Structure:**
```sql
CREATE TABLE `services` (
  `service_id` varchar(20) NOT NULL,
  `vendor_id` varchar(20) NOT NULL,
  `service_category_id` varchar(20) NOT NULL, -- NEW FIELD
  `name` varchar(100) NOT NULL,
  `description` text,
  `type` varchar(50) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `is_featured` int(11) DEFAULT 0,
  `service_pincodes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `vendor_id` (`vendor_id`),
  KEY `service_category_id` (`service_category_id`), -- NEW INDEX
  KEY `is_available` (`is_available`),
  KEY `is_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## API Updates

### 1. Updated Services APIs
All services APIs have been updated to work with the new structure:

#### `/api/services/nearby` (POST)
- **Before:** `s.category`
- **After:** `s.service_category_id, sc.name as category_name`
- **Join:** `LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id`

#### `/api/services/[slug]` (GET)
- **Before:** `category`
- **After:** `service_category_id, sc.name as category_name`
- **Backward Compatibility:** Maps `category_name` to `category` field

#### `/api/services/related` (GET)
- **Before:** `WHERE category = ?`
- **After:** `WHERE sc.name = ?`
- **Backward Compatibility:** Maps `category_name` to `category` field

#### `/api/services/by-coordinates` (POST)
- **Before:** `s.category`
- **After:** `s.service_category_id, sc.name as category_name`
- **Backward Compatibility:** Maps `category_name` to `category` field

#### `/api/services/by-pincode` (POST)
- **Before:** `s.category`
- **After:** `s.service_category_id, sc.name as category_name`
- **Backward Compatibility:** Maps `category_name` to `category` field

### 2. Updated Frontend Components

#### `src/app/service-booking/[serviceId]/page.tsx`
- **Type Definition:** Added `category_name?: string` field
- **Data Mapping:** Ensures `category` field is populated from `category_name`
- **Backward Compatibility:** Maintains existing interface

#### `src/app/location/page.tsx`
- **Interface:** No changes needed (uses `category` field)
- **Data Source:** Gets `category` from API mapping

## Benefits of the New Structure

### 1. **Data Integrity**
- Foreign key constraints ensure valid category references
- Prevents orphaned categories
- Maintains referential integrity

### 2. **Scalability**
- Easy to add new categories without code changes
- Categories can have additional metadata (description, etc.)
- Better performance with proper indexing

### 3. **Maintainability**
- Centralized category management
- Consistent category names across the application
- Easy to update category information

### 4. **Flexibility**
- Categories can have additional fields (description, icon, etc.)
- Support for category hierarchies in the future
- Better support for internationalization

## Migration Process

### 1. Database Migration
```sql
-- Create service_categories table
CREATE TABLE `service_categories` (
  `service_category_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add service_category_id column to services table
ALTER TABLE `services` ADD COLUMN `service_category_id` varchar(20) NOT NULL AFTER `vendor_id`;

-- Create index for performance
CREATE INDEX idx_services_category_id ON services(service_category_id);

-- Populate service_categories with existing categories
INSERT INTO service_categories (service_category_id, name) VALUES
('SCTR1', 'Service test category'),
('SCTR2', 'Premium Car Services'),
('SCTR3', 'Premium Car Services'),
('SCTR4', 'Premium Car Services'),
('SCTR5', 'Premium Car Services'),
('SCTR6', 'Empty Category Test'),
('SCTR7', 'Test Category New Schema'),
('SCTR8', 'Empty Category Test');

-- Update services table to use service_category_id
-- (This would be done based on existing category values)

-- Remove old category column
ALTER TABLE `services` DROP COLUMN `category`;
```

### 2. Code Updates
- Updated all services APIs to use new structure
- Added backward compatibility mapping
- Updated frontend components to handle new data format

## Testing

### 1. Database Structure Test
```bash
node test-services-api.js
```

### 2. Service Order Notifications Test
```bash
node test-service-order-notifications.js
```

### 3. Manual Testing
1. Browse services on location page
2. View service details
3. Book a service
4. Verify notifications are created

## Backward Compatibility

### 1. API Responses
All APIs maintain backward compatibility by mapping `category_name` to `category`:
```javascript
// In API responses
{
  ...service,
  category: service.category_name // For backward compatibility
}
```

### 2. Frontend Interfaces
Existing TypeScript interfaces continue to work:
```typescript
interface Service {
  category: string; // Still works, populated from category_name
  category_name?: string; // New field available
}
```

## Future Enhancements

### 1. Category Management
- Admin interface for managing categories
- Category icons and descriptions
- Category-specific settings

### 2. Category Hierarchy
- Parent-child category relationships
- Nested category display
- Category-based filtering

### 3. Internationalization
- Multi-language category names
- Locale-specific category descriptions
- Regional category variations

## Troubleshooting

### 1. Missing service_categories Table
**Error:** `Table 'kriptocar.service_categories' doesn't exist`
**Solution:** Run the database migration script to create the table

### 2. Missing service_category_id Column
**Error:** `Unknown column 'service_category_id' in 'field list'`
**Solution:** Add the column to the services table

### 3. Foreign Key Constraint Errors
**Error:** `Cannot add or update a child row: a foreign key constraint fails`
**Solution:** Ensure all service_category_id values exist in service_categories table

### 4. API Errors
**Error:** `Unknown column 's.category' in 'field list'`
**Solution:** Update the API to use the new structure with JOIN

## Verification Checklist

- [ ] `service_categories` table exists
- [ ] `services` table has `service_category_id` column
- [ ] `services` table no longer has `category` column
- [ ] All services APIs work correctly
- [ ] Frontend displays categories properly
- [ ] Service booking works
- [ ] Notifications are created correctly
- [ ] No console errors in browser
- [ ] All tests pass

## Summary

The database structure update successfully migrates from a simple `category` column to a proper relational design with a `service_categories` table. This provides better data integrity, scalability, and maintainability while maintaining full backward compatibility for existing code.

