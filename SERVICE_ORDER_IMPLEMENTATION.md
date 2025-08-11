# Service Order Implementation - Unique Service Order IDs & Notifications

## Overview
This implementation adds unique service order IDs to the KriptoCar application, following the format `SOR` + sequential number (e.g., SOR000001, SOR000002), and includes comprehensive notification system for admin and vendors.

## Features
- ✅ **Unique Service Order IDs**: Each service order gets a unique ID starting with "SOR"
- ✅ **Sequential Numbering**: Numbers increment based on the largest existing number in the database
- ✅ **Database Integration**: Seamlessly integrated with existing service order system
- ✅ **Admin Notifications**: Admin gets notified of new service orders
- ✅ **Vendor Notifications**: Vendors get notified when their services are booked
- ✅ **Rich Metadata**: Complete service order details stored in notifications

## Database Changes

### Migration Script: `migrate_service_order_ids.sql`
Run this script in your MySQL database to add the service_order_id column:

```sql
USE kriptocar;

-- Add service_order_id column to service_orders table
ALTER TABLE `kriptocar`.`service_orders`
ADD COLUMN `service_order_id` VARCHAR(20) UNIQUE NULL AFTER `service_order_id`;

-- Create index for better performance
CREATE INDEX idx_service_orders_service_order_id ON kriptocar.service_orders(service_order_id);

-- Update existing service orders to assign them sequential SOR format IDs
SET @counter = 1;
UPDATE `kriptocar`.`service_orders`
SET `service_order_id` = CONCAT('SOR', LPAD(@counter := @counter + 1, 6, '0'))
WHERE `service_order_id` IS NULL;

-- Make service_order_id NOT NULL after population
ALTER TABLE `kriptocar`.`service_orders`
MODIFY COLUMN `service_order_id` VARCHAR(20) NOT NULL;

-- Add unique constraint
ALTER TABLE `kriptocar`.`service_orders`
ADD UNIQUE KEY `unique_service_order_id` (`service_order_id`);
```

## Files Modified

### 1. `src/lib/serviceOrderIdGenerator.ts` (New File)
- **Purpose**: Generates unique service order IDs
- **Features**:
  - `DatabaseServiceOrderIdGenerator`: Queries database for largest existing SOR number
  - `FallbackServiceOrderIdGenerator`: For testing without database
  - Generates IDs like SOR000001, SOR000002, etc.

### 2. `src/app/api/service-booking/route.ts` (Updated)
- **Changes**:
  - Added service order ID generation before service order insertion
  - Updated INSERT statement to include `service_order_id` field
  - Integrated with notification systems for admin and vendor
  - Added proper database connection management
  - Fetches user details for notification metadata

### 3. `src/lib/notifications.ts` (Updated)
- **New Function**: `createServiceOrderNotifications`
- **Features**:
  - Creates admin notifications with type `service_created`
  - Creates vendor notifications with type `service_created`
  - Includes comprehensive service order metadata
  - Validates vendor existence before creating vendor notifications

### 4. `src/lib/notifications.ts` (Enhanced)
- **Enhanced Interface**: Added `for_vendor` and `vendor_id` fields
- **Updated SQL**: Modified INSERT statement to include vendor fields
- **Better Error Handling**: Vendor validation and error logging

## Service Order ID Format
- **Pattern**: `SOR` + 6-digit zero-padded number
- **Examples**: 
  - SOR000001 (first service order)
  - SOR000002 (second service order)
  - SOR000123 (123rd service order)
  - SOR999999 (999,999th service order)

## Notification Types

### Admin Notifications
- **Type**: `service_created`
- **Title**: "New Service Order Created"
- **Message**: "A new service order #SOR000001 has been created by John Doe for Car Wash Service at $299.99."
- **For Admin**: `true`
- **For Vendor**: `false`

### Vendor Notifications
- **Type**: `service_created`
- **Title**: "New Service Order for Your Service"
- **Message**: "A new service order #SOR000001 has been booked for your service "Car Wash Service" by John Doe for $299.99."
- **For Admin**: `false`
- **For Vendor**: `true`
- **Vendor ID**: Included for vendor-specific filtering

## Testing

### 1. Database Migration
```bash
# Run the migration script in your MySQL database
mysql -u your_username -p kriptocar < migrate_service_order_ids.sql
```

### 2. Test Service Order Notifications
```bash
# Test the service order notification system
node test-service-order-notifications.js
```

### 3. Test Complete Service Booking Flow
1. Browse services
2. Select a service
3. Book the service
4. Verify service order ID in:
   - Database (service_orders table)
   - Admin notification
   - Vendor notification

## Error Handling
- **Database Connection**: Proper connection management with cleanup
- **ID Generation**: Fallback mechanisms if database query fails
- **Service Order Insertion**: Transaction-like behavior for data consistency
- **Vendor Validation**: Checks vendor existence before creating vendor notifications
- **Notifications**: Non-blocking (service booking succeeds even if notifications fail)

## Integration Points

### Notification System
- Admin notifications: "New service order #SOR000001 created"
- Vendor notifications: "New service order #SOR000001 for your service"
- Complete service order metadata stored in notification records

### Database Schema
```sql
service_orders table:
- service_order_id (auto-increment)
- service_order_id (VARCHAR(20), UNIQUE, NOT NULL) -- NEW FIELD
- user_id
- service_id
- vendor_id
- service_name
- service_description
- service_category
- service_type
- base_price
- final_price
- duration_minutes
- booking_date
- service_date
- service_time
- service_status
- service_pincode
- service_address
- additional_notes
- payment_method
- payment_status
- transaction_id
- was_available
```

## Benefits
1. **Unique Identification**: Each service order has a human-readable unique ID
2. **Professional Appearance**: Clean, sequential numbering system
3. **Easy Reference**: Customers can easily reference their service order IDs
4. **Database Efficiency**: Indexed for fast lookups
5. **Scalability**: Supports up to 999,999 service orders
6. **Consistency**: Follows same pattern as order IDs (ORD format) and user IDs (USR format)
7. **Vendor Management**: Vendors get notified of bookings for their services
8. **Admin Oversight**: Admins can track all service bookings

## Next Steps
1. Run the database migration script
2. Test service order ID generation
3. Book test services to verify functionality
4. Monitor notification delivery for admin and vendors
5. Update any service order tracking or management interfaces

## Troubleshooting
- **Migration Errors**: Ensure database permissions and backup before running
- **ID Generation Errors**: Check database connection and table structure
- **Notification Issues**: Check notifications table structure and vendor existence
- **Vendor Notifications**: Verify vendor IDs exist in vendors table

## Comparison with Order System
| Feature | Orders | Service Orders |
|---------|--------|----------------|
| ID Format | ORD000001 | SOR000001 |
| Admin Notifications | ✅ | ✅ |
| Dealer/Vendor Notifications | ✅ (Dealers) | ✅ (Vendors) |
| Email Integration | ✅ | 🔄 (Can be added) |
| Metadata Storage | ✅ | ✅ |
| Unique Constraints | ✅ | ✅ |

## Future Enhancements
- Email notifications for service bookings
- SMS notifications for urgent service requests
- Service order status updates with notifications
- Vendor dashboard for managing service orders
- Admin dashboard for service order management

