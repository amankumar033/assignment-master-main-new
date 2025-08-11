# Order ID Implementation - Unique Order IDs

## Overview
This implementation adds unique order IDs to the KriptoCar application, following the format `ORD` + sequential number (e.g., ORD000001, ORD000002).

## Features
- ✅ **Unique Order IDs**: Each order gets a unique ID starting with "ORD"
- ✅ **Sequential Numbering**: Numbers increment based on the largest existing number in the database
- ✅ **Database Integration**: Seamlessly integrated with existing order system
- ✅ **Email Integration**: Order confirmation emails use the new order IDs
- ✅ **Notification Integration**: Admin and dealer notifications include order IDs

## Database Changes

### Migration Script: `migrate_order_ids.sql`
Run this script in your MySQL database to add the order_id column:

```sql
USE kriptocar;

-- Add order_id column to orders table
ALTER TABLE `kriptocar`.`orders`
ADD COLUMN `order_id` VARCHAR(20) UNIQUE NULL AFTER `id`;

-- Create index for better performance
CREATE INDEX idx_orders_order_id ON kriptocar.orders(order_id);

-- Update existing orders to assign them sequential ORD format IDs
SET @counter = 1;
UPDATE `kriptocar`.`orders`
SET `order_id` = CONCAT('ORD', LPAD(@counter := @counter + 1, 6, '0'))
WHERE `order_id` IS NULL;

-- Make order_id NOT NULL after population
ALTER TABLE `kriptocar`.`orders`
MODIFY COLUMN `order_id` VARCHAR(20) NOT NULL;

-- Add unique constraint
ALTER TABLE `kriptocar`.`orders`
ADD UNIQUE KEY `unique_order_id` (`order_id`);
```

## Files Modified

### 1. `src/lib/orderIdGenerator.ts` (New File)
- **Purpose**: Generates unique order IDs
- **Features**:
  - `DatabaseOrderIdGenerator`: Queries database for largest existing ORD number
  - `FallbackOrderIdGenerator`: For testing without database
  - Generates IDs like ORD000001, ORD000002, etc.

### 2. `src/app/api/checkout/route.ts` (Updated)
- **Changes**:
  - Added order ID generation before order insertion
  - Updated INSERT statement to include `order_id` field
  - Integrated with email and notification systems
  - Added proper database connection management

### 3. `src/lib/email.ts` (Already Updated)
- **Order Confirmation Emails**: Now use the new order IDs
- **Email Template**: Displays order ID prominently

### 4. `src/lib/notifications.ts` (Already Updated)
- **Notifications**: Include order IDs in metadata
- **Admin/Dealer Alerts**: Reference order IDs in messages

## Order ID Format
- **Pattern**: `ORD` + 6-digit zero-padded number
- **Examples**: 
  - ORD000001 (first order)
  - ORD000002 (second order)
  - ORD000123 (123rd order)
  - ORD999999 (999,999th order)

## Testing

### 1. Database Migration
```bash
# Run the migration script in your MySQL database
mysql -u your_username -p kriptocar < migrate_order_ids.sql
```

### 2. Test Order ID Generation
```bash
# Test the order ID generation
node test-order-id-generation.js
```

### 3. Test Complete Order Flow
1. Add items to cart
2. Proceed to checkout
3. Place an order
4. Verify order ID in:
   - Database (orders table)
   - Email confirmation
   - Admin notification
   - Dealer notification

## Error Handling
- **Database Connection**: Proper connection management with cleanup
- **ID Generation**: Fallback mechanisms if database query fails
- **Order Insertion**: Transaction-like behavior for data consistency
- **Email/Notifications**: Non-blocking (order succeeds even if email fails)

## Integration Points

### Email System
- Order confirmation emails display the order ID
- Email subject includes order ID: "Order Confirmation #ORD000001 - KriptoCar"

### Notification System
- Admin notifications: "New order #ORD000001 received"
- Dealer notifications: "New order #ORD000001 for your products"
- Complete order metadata stored in notification records

### Database Schema
```sql
orders table:
- id (auto-increment)
- order_id (VARCHAR(20), UNIQUE, NOT NULL) -- NEW FIELD
- user_id
- dealer_id
- product_id
- customer_name
- customer_email
- customer_phone
- shipping_address
- shipping_pincode
- order_date
- order_status
- total_amount
- tax_amount
- shipping_cost
- discount_amount
- payment_method
- payment_status
- transaction_id
```

## Benefits
1. **Unique Identification**: Each order has a human-readable unique ID
2. **Professional Appearance**: Clean, sequential numbering system
3. **Easy Reference**: Customers can easily reference their order IDs
4. **Database Efficiency**: Indexed for fast lookups
5. **Scalability**: Supports up to 999,999 orders
6. **Consistency**: Follows same pattern as user IDs (USR format)

## Next Steps
1. Run the database migration script
2. Test order ID generation
3. Place test orders to verify functionality
4. Monitor email delivery and notifications
5. Update any order tracking or management interfaces

## Troubleshooting
- **Migration Errors**: Ensure database permissions and backup before running
- **ID Generation Errors**: Check database connection and table structure
- **Email Issues**: Verify email configuration in `.env.local`
- **Notification Issues**: Check notifications table structure

