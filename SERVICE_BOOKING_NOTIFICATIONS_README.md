# Service Booking Notifications System

## Overview
This document outlines the notification system implemented for service bookings, ensuring that all relevant parties (admin, vendor, customer) receive appropriate notifications when a service is booked.

## Notification Types

### 1. Admin Notification
- **Type**: `service_order_created`
- **Trigger**: When any service order is created
- **Recipient**: Admin users
- **Content**: Service order details including customer name, service name, and price

### 2. Vendor Notification
- **Type**: `service_order_created`
- **Trigger**: When a service order is created for a specific vendor
- **Recipient**: The vendor who provides the service
- **Content**: Service order details and customer information
- **Email**: Automatic email notification sent to vendor

### 3. Customer Notification
- **Type**: Service order confirmation email
- **Trigger**: When service order is successfully created
- **Recipient**: Customer who booked the service
- **Content**: Service order confirmation with all details

## Database Requirements

### Vendors Table Structure
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

### Services Table Structure
```sql
CREATE TABLE `services` (
  `service_id` varchar(20) NOT NULL,
  `vendor_id` varchar(20) NOT NULL,  -- Must match vendors.vendor_id
  `name` varchar(255) NOT NULL,
  `description` text,
  `service_category_id` varchar(20),
  `type` varchar(100) NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `duration_minutes` int(11) NOT NULL,
  `is_available` tinyint(1) DEFAULT 1,
  `service_pincodes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`service_id`),
  KEY `vendor_id` (`vendor_id`)
);
```

## Implementation Details

### 1. Service Booking API (`/api/service-booking`)
```typescript
// After successful service order creation
await createServiceOrderNotifications(serviceOrderData, uniqueServiceOrderId, vendor_id);
```

### 2. Notification Creation Function
```typescript
export const createServiceOrderNotifications = async (
  serviceOrderData: any,
  serviceOrderId: string,
  vendorId: string | null
): Promise<void>
```

### 3. Vendor Email Function
```typescript
export const sendVendorServiceNotificationEmail = async (
  vendorServiceData: VendorServiceData
): Promise<boolean>
```

## Email Templates

### Vendor Notification Email
- **Subject**: New Service Order - [Service Name]
- **Content**: 
  - Service order ID
  - Customer details (name, email, phone)
  - Service details (name, category, type, price)
  - Service date and time
  - Service address and pincode
  - Additional notes

### Customer Confirmation Email
- **Subject**: Service Order Confirmation - [Service Order ID]
- **Content**:
  - Service order ID
  - Service details
  - Booking date and time
  - Payment information
  - Contact information

## Error Handling

### 1. Vendor Not Found
- Logs warning message
- Skips vendor notification
- Continues with admin and customer notifications
- Shows available vendors for debugging

### 2. Email Send Failure
- Logs error details
- Continues with other notifications
- Doesn't fail the service booking process

### 3. Database Errors
- Logs detailed error information
- Graceful fallback behavior
- Service booking continues even if notifications fail

## Setup Instructions

### 1. Run Vendor ID Fix Script
```bash
# Execute the fix-vendor-ids.sql script to align vendor IDs
mysql -u username -p database_name < fix-vendor-ids.sql
```

### 2. Verify Vendor Data
```sql
-- Check if vendors exist
SELECT vendor_id, name, email FROM vendors WHERE vendor_id IN ('VND1', 'VND2', 'VND3');

-- Check services vendor mapping
SELECT s.service_id, s.name, s.vendor_id, v.name as vendor_name 
FROM services s 
LEFT JOIN vendors v ON s.vendor_id = v.vendor_id;
```

### 3. Test Notifications
```bash
# Book a service and check logs for:
# - Admin notification creation
# - Vendor notification creation
# - Email sending status
```

## Troubleshooting

### Issue: "Unknown column 'name' in 'field list'"
**Cause**: Vendor ID mismatch between services and vendors tables
**Solution**: Run the fix-vendor-ids.sql script

### Issue: "Vendor ID does not exist"
**Cause**: Service references non-existent vendor
**Solution**: 
1. Check vendor ID in services table
2. Ensure vendor exists in vendors table
3. Update service vendor_id if needed

### Issue: Email not sent to vendor
**Cause**: Vendor email is null or invalid
**Solution**:
1. Check vendor email in database
2. Verify email configuration
3. Check email logs for errors

### Issue: Notification not created
**Cause**: Database connection or permission issues
**Solution**:
1. Check database connection
2. Verify table permissions
3. Check notification table structure

## Monitoring

### Log Messages to Monitor
- `✅ Admin notification created successfully`
- `✅ Vendor notification created successfully`
- `✅ Vendor service notification email sent successfully`
- `✅ Service order confirmation email sent successfully`

### Error Messages to Watch
- `⚠️ Vendor ID does not exist in vendors table`
- `❌ Error sending vendor service notification email`
- `❌ Error creating service order notifications`

## Future Enhancements

1. **SMS Notifications**: Add SMS notifications for vendors
2. **Push Notifications**: Implement push notifications for mobile apps
3. **Notification Preferences**: Allow vendors to set notification preferences
4. **Notification History**: Track notification delivery status
5. **Retry Mechanism**: Implement retry logic for failed notifications

