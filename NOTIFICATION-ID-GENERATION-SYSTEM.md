# Notification ID Generation System Documentation

## Overview

The Notification ID Generation System is a robust solution for generating unique notification IDs in the format 'NOT' + 3-digit number (NOT001 to NOT999). It implements range-based checking, gap detection, and duplicate prevention to ensure data integrity.

## Key Features

### 🔧 ID Generation System
- **Format**: `NOT` + 3-digit number (NOT001 to NOT999)
- **Range-Based**: 1-10, 11-20, 21-30, etc.
- **Gap Detection**: Finds first available number in sequence
- **Duplicate Prevention**: Multiple layers of checking

### 🛡️ Data Integrity
- Database transactions with proper locking
- Row-level locking during ID generation
- Race condition protection
- Error handling and rollback mechanisms

### 📊 Statistics and Monitoring
- Real-time usage statistics
- Range analysis and gap detection
- Performance monitoring
- Comprehensive logging

## System Architecture

### 1. ID Generation Process

```
1. Start Database Transaction
   ↓
2. Get All Existing Notification IDs (FOR UPDATE)
   ↓
3. Extract Notification Numbers and Sort
   ↓
4. Find Next Available Number (Gap Detection)
   ↓
5. Generate Notification ID
   ↓
6. Double-Check for Duplicates
   ↓
7. Commit Transaction
   ↓
8. Return Generated ID
```

### 2. Range-Based Approach

#### Range Structure
```
Range 1: NOT001 to NOT010
Range 2: NOT011 to NOT020
Range 3: NOT021 to NOT030
Range 4: NOT031 to NOT040
And so on...
```

#### Gap Detection Logic
```javascript
// Find first available number in sequence
for (let i = 1; i <= maxExistingNumber; i++) {
  if (!existingNumbers.includes(i)) {
    return i; // Found a gap
  }
}
return maxExistingNumber + 1; // No gaps, use next number
```

### 3. Database Integration

#### Required Table Structure
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  notification_id VARCHAR(10) UNIQUE NOT NULL,
  user_id VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notification_id (notification_id),
  INDEX idx_user_id (user_id),
  INDEX idx_notification_type (notification_type)
);
```

## API Endpoints

### POST /api/notifications/generate-id

#### Request
```http
POST /api/notifications/generate-id
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "message": "Notification ID generated successfully",
  "data": {
    "notification_id": "NOT001",
    "notification_number": 1,
    "range_info": {
      "rangeStart": 1,
      "rangeEnd": 10,
      "rangeNumber": 1
    },
    "statistics": {
      "total_notifications": 5,
      "next_available_number": 6,
      "used_ranges": [1],
      "available_ranges": [2, 3, 4],
      "gaps": [2, 4]
    }
  }
}
```

### GET /api/notifications/generate-id

#### Request
```http
GET /api/notifications/generate-id
```

#### Response
```json
{
  "success": true,
  "message": "Notification ID statistics retrieved successfully",
  "data": {
    "total_notifications": 5,
    "next_available_number": 6,
    "used_ranges": [1],
    "available_ranges": [2, 3, 4],
    "gaps": [2, 4],
    "range_explanation": {
      "range_1": "NOT001 to NOT010",
      "range_2": "NOT011 to NOT020",
      "range_3": "NOT021 to NOT030",
      "...": "And so on..."
    }
  }
}
```

## Usage Examples

### Basic Usage
```javascript
import { notificationIdGenerator } from '@/lib/notificationIdGenerator';

// Generate a new notification ID
const notificationId = await notificationIdGenerator.generateNotificationId();
console.log(notificationId); // Output: NOT001

// Validate notification ID format
const isValid = NotificationIdGenerator.validateNotificationIdFormat('NOT001'); // true
const isInvalid = NotificationIdGenerator.validateNotificationIdFormat('NOT1'); // false

// Extract notification number
const notificationNumber = NotificationIdGenerator.extractNotificationNumber('NOT001'); // 1

// Get range information
const rangeInfo = NotificationIdGenerator.getRangeInfo(1);
// { rangeStart: 1, rangeEnd: 10, rangeNumber: 1 }
```

### Advanced Usage
```javascript
// Check if notification ID is available
const isAvailable = await notificationIdGenerator.isNotificationIdAvailable('NOT001');

// Get comprehensive statistics
const statistics = await notificationIdGenerator.getNotificationIdStatistics();
console.log(statistics);
/*
{
  totalNotifications: 5,
  usedRanges: [1],
  availableRanges: [2, 3, 4],
  nextAvailableNumber: 6,
  gaps: [2, 4]
}
*/

// Create a notification with auto-generated ID
const notificationId = await notificationIdGenerator.createNotification({
  user_id: 'USR001',
  notification_type: 'order_placed',
  title: 'Order Placed Successfully',
  message: 'Your order has been placed successfully'
});
```

## Database Functions and Procedures

### get_next_notification_id() Function
```sql
-- Returns the next available notification ID
SELECT get_next_notification_id(); -- Returns: NOT006
```

### insert_notification_with_id() Procedure
```sql
-- Insert a new notification with auto-generated ID
CALL insert_notification_with_id('USR001', 'order_placed', 'Order Placed', 'Your order has been placed');
-- Returns: { generated_notification_id: 'NOT006' }
```

## Integration with Checkout System

### Updated Checkout API
The checkout API now uses the notification ID generator for creating notifications:

```javascript
// Create notification for dealer
await notificationIdGenerator.createNotification({
  user_id: dealerId,
  notification_type: 'order_received',
  title: 'New Order Received',
  message: `You have received ${dealerOrders.length} new order(s) from ${orderData.customer_name}`
});

// Create notification for customer
await notificationIdGenerator.createNotification({
  user_id: user_id,
  notification_type: 'order_placed',
  title: 'Order Placed Successfully',
  message: `Your order with ${cartItems.length} item(s) has been placed successfully`
});
```

## Error Handling

### Common Errors and Solutions

#### 1. Duplicate Notification ID
**Error**: `Duplicate entry 'NOT001' for key 'notifications.PRIMARY'`
**Solution**: System automatically retries with alternative ID

#### 2. Database Connection Issues
**Error**: `ECONNREFUSED`
**Solution**: Check database connectivity and credentials

#### 3. Transaction Failures
**Error**: `ER_LOCK_WAIT_TIMEOUT`
**Solution**: System retries with exponential backoff

#### 4. Invalid Notification ID Format
**Error**: `Invalid notification ID format`
**Solution**: Ensure notification ID matches pattern `NOT\d{3}`

### Error Response Format
```json
{
  "success": false,
  "message": "Failed to generate notification ID",
  "error": "Specific error message"
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: `notification_id` column is indexed for fast lookups
- **Batch Operations**: Multiple ID generations in single transaction
- **Connection Pooling**: Efficient database connection management

### Memory Management
- **Request Deduplication**: Prevents duplicate requests
- **Connection Cleanup**: Proper connection closing
- **Error Recovery**: Graceful error handling

### Scalability
- **Range-Based Approach**: Supports up to 999 notifications efficiently
- **Gap Detection**: Optimizes ID reuse
- **Transaction Isolation**: Prevents race conditions

## Testing

### Test Scripts
1. **test-notification-id-generation.js**: Comprehensive system testing
2. **setup-notification-id-system.sql**: Database setup and migration

### Test Coverage
- ✅ Notification ID format validation
- ✅ Database structure validation
- ✅ Gap detection and next available number logic
- ✅ Range-based approach testing
- ✅ Statistics generation and analysis
- ✅ Edge case handling
- ✅ Database transaction safety
- ✅ Duplicate prevention testing
- ✅ Notification creation testing

### Running Tests
```bash
# Run the test script
node test-notification-id-generation.js

# Execute database setup
mysql -u root -p kriptocar < setup-notification-id-system.sql
```

## Monitoring and Logging

### Key Metrics
- Notification ID generation time
- Database transaction success rate
- Gap detection efficiency
- Error rates by type

### Logging
```javascript
console.log(`Generated notification ID: ${notificationId}`);
console.log(`Existing notification numbers: ${existingNotificationNumbers.join(', ')}`);
console.log(`Next available number: ${nextNotificationNumber}`);
console.log(`✅ Created notification with ID: ${notificationId}`);
```

## Security Features

### Request Deduplication
```javascript
const processedRequests = new Set();
const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

if (processedRequests.has(requestId)) {
  return NextResponse.json(
    { success: false, message: 'Duplicate request detected' },
    { status: 409 }
  );
}
```

### Database Locking
```javascript
// Row-level locking during ID generation
const [existingNotifications] = await connection.execute(
  'SELECT notification_id FROM notifications ORDER BY notification_id FOR UPDATE'
);
```

## Deployment Checklist

### Database Setup
- [ ] Create notifications table with proper structure
- [ ] Add required indexes
- [ ] Set up database functions and procedures
- [ ] Test database connectivity

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kriptocar
```

### Testing
- [ ] Run comprehensive test suite
- [ ] Test with multiple concurrent requests
- [ ] Verify gap detection logic
- [ ] Test error scenarios

### Monitoring
- [ ] Set up error logging
- [ ] Configure performance monitoring
- [ ] Test transaction rollback scenarios

## Troubleshooting

### Common Issues

#### 1. Notification ID Generation Fails
**Problem**: System unable to generate unique notification ID
**Solution**: Check database connectivity and table structure

#### 2. Duplicate Notification IDs
**Problem**: Same notification ID generated multiple times
**Solution**: Verify transaction isolation and locking

#### 3. Performance Issues
**Problem**: Slow notification ID generation
**Solution**: Check database indexes and connection pooling

#### 4. Range Analysis Errors
**Problem**: Incorrect range calculations
**Solution**: Verify notification ID format and number extraction

### Debug Mode
Enable detailed logging by setting environment variable:
```env
DEBUG=true
```

## Future Enhancements

### Planned Features
- Real-time notification ID monitoring dashboard
- Advanced analytics and reporting
- Multi-tenant notification ID management
- API rate limiting and throttling

### Scalability Improvements
- Microservices architecture
- Caching layer for frequently accessed data
- Horizontal scaling support
- Advanced load balancing

## Support

For technical support or questions about the Notification ID Generation System, please refer to:
- System documentation
- Test scripts for validation
- Database migration scripts
- Error logs for troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team
