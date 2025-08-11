# Dealer and Vendor Email Notifications

This feature automatically sends email notifications to dealers and vendors when orders and service bookings are placed on the KriptoCar platform.

## Overview

When customers place orders or book services, the system now automatically:
1. **Sends email notifications to dealers** when their products are ordered
2. **Sends email notifications to vendors** when their services are booked
3. **Creates database notifications** for admin, dealer, and vendor dashboards
4. **Handles errors gracefully** without affecting the main order/booking process

## Features

### 🛒 Product Orders
- **Dealer Email Notifications**: Dealers receive detailed emails when customers order their products
- **Order Details**: Complete order information including items, quantities, and pricing
- **Customer Information**: Customer contact details and shipping address
- **Professional Design**: Branded email templates with KriptoCar styling

### 🔧 Service Bookings
- **Vendor Email Notifications**: Vendors receive detailed emails when customers book their services
- **Service Details**: Complete service information including schedule and location
- **Customer Information**: Customer contact details and service address
- **Professional Design**: Branded email templates with KriptoCar styling

## Database Setup

### 1. Run the SQL Script

Execute the `create-dealers-vendors-tables.sql` file in your phpMyAdmin database:

```sql
-- This will create:
-- 1. Dealers table with email support
-- 2. Vendors table with email support
-- 3. Sample data for testing
```

### 2. Table Structures

#### Dealers Table
```sql
CREATE TABLE `dealers` (
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
  UNIQUE KEY `unique_dealer_email` (`email`)
);
```

#### Vendors Table
```sql
CREATE TABLE `vendors` (
  `vendor_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `service_areas` text,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`vendor_id`),
  UNIQUE KEY `unique_vendor_email` (`email`)
);
```

## Email Templates

### Dealer Order Notification Email
- **Subject**: `New Order #ORD000001 - KriptoCar`
- **Content**: 
  - Order details (ID, date, status, amount)
  - Customer information
  - Order items table
  - Shipping address
  - Next steps for fulfillment

### Vendor Service Notification Email
- **Subject**: `New Service Booking #SOR000001 - KriptoCar`
- **Content**:
  - Service booking details
  - Service schedule (date, time, location)
  - Customer information
  - Next steps for service delivery

## Implementation Details

### 1. Email Functions (`src/lib/email.ts`)

#### `sendDealerOrderNotificationEmail(dealerOrderData)`
Sends order notification emails to dealers.

**Parameters:**
```typescript
interface DealerOrderData {
  order_id: string;
  dealer_name: string;
  dealer_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  order_date: string;
  order_status: string;
  payment_status: string;
  shipping_address: string;
  shipping_pincode: string;
  items: OrderItem[];
}
```

#### `sendVendorServiceNotificationEmail(vendorServiceData)`
Sends service booking notification emails to vendors.

**Parameters:**
```typescript
interface VendorServiceData {
  service_order_id: string;
  vendor_name: string;
  vendor_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  service_category: string;
  service_type: string;
  final_price: number;
  service_date: string;
  service_time: string;
  service_status: string;
  payment_status: string;
  service_address: string;
  service_pincode: string;
  additional_notes?: string;
}
```

### 2. Notification Functions (`src/lib/notifications.ts`)

#### `createOrderNotifications(orderData, orderId, dealerId)`
Creates notifications and sends emails for product orders.

**Process:**
1. Creates admin notification
2. If dealer exists, creates dealer notification
3. If dealer has email, sends dealer notification email
4. Handles errors gracefully

#### `createServiceOrderNotifications(serviceOrderData, serviceOrderId, vendorId)`
Creates notifications and sends emails for service bookings.

**Process:**
1. Creates admin notification
2. If vendor exists, creates vendor notification
3. If vendor has email, sends vendor notification email
4. Handles errors gracefully

## Environment Variables

Ensure these environment variables are set in your `.env.local` file:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=kriptocar
```

## Testing

### 1. Run the Test Script

```bash
node test-dealer-vendor-emails.js
```

This script will:
- Test dealer email functionality
- Test vendor email functionality
- Test notification creation
- Verify environment variables

### 2. Manual Testing

1. **Place a Product Order**:
   - Add products to cart
   - Complete checkout process
   - Check dealer email inbox
   - Verify notification in database

2. **Book a Service**:
   - Select a service
   - Complete booking process
   - Check vendor email inbox
   - Verify notification in database

## Error Handling

The system includes comprehensive error handling:

### Email Failures
- Email failures don't affect order/booking success
- Detailed error logging for debugging
- Graceful fallback when email configuration is missing

### Database Errors
- Database errors are logged but don't break the process
- Notifications are created even if emails fail
- System continues to function normally

### Missing Data
- Handles missing dealer/vendor emails gracefully
- Skips email sending when email is not available
- Continues with notification creation

## Logging

The system provides detailed logging for monitoring:

```
🔔 Creating order notifications for: { orderId, dealerId, customerName, totalAmount }
📧 Dealer details found: { name, email }
✅ Dealer order notification email sent successfully to: dealer@example.com
❌ Failed to send dealer order notification email to: dealer@example.com
⚠️ Dealer email not found, skipping email notification
```

## Sample Data

### Sample Dealers
- **DLR000001**: Auto Parts Plus (dealer1@kriptocar.com)
- **DLR000002**: Car Care Center (dealer2@kriptocar.com)
- **DLR000003**: Premium Auto Solutions (dealer3@kriptocar.com)

### Sample Vendors
- **VND000001**: Quick Fix Auto Services (vendor1@kriptocar.com)
- **VND000002**: Professional Car Care (vendor2@kriptocar.com)
- **VND000003**: Elite Auto Maintenance (vendor3@kriptocar.com)

## Troubleshooting

### Email Not Sending
1. Check environment variables are set correctly
2. Verify Gmail 2FA is enabled and app password is generated
3. Check console logs for email errors
4. Ensure dealer/vendor emails exist in database

### Database Errors
1. Verify dealers and vendors tables exist
2. Check database connection settings
3. Ensure dealer_id and vendor_id are valid
4. Check table structure matches expected schema

### Missing Notifications
1. Verify notifications table exists
2. Check dealer/vendor IDs are correct
3. Ensure email addresses are populated
4. Review error logs for specific issues

## Future Enhancements

- **SMS Notifications**: Add SMS support for urgent notifications
- **Email Templates**: Customizable email templates for dealers/vendors
- **Notification Preferences**: Allow dealers/vendors to configure notification settings
- **Dashboard Integration**: Real-time notification display in dealer/vendor dashboards
- **Bulk Notifications**: Support for bulk email sending
- **Email Tracking**: Track email open rates and engagement

## Support

For issues or questions:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test with the provided test script
4. Review database table structures and sample data
