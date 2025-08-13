# Multi-Product Checkout System Documentation

## Overview

The Multi-Product Checkout System is a comprehensive solution for handling orders with multiple products from different dealers. It ensures data integrity, proper ID generation, and separate communication channels for each dealer.

## Key Features

### 🔧 ID Generation System
- **User ID Format**: `USR` + 3-digit number (USR001 to USR999)
- **Order ID Format**: `ORD` + user_number + sequence (ORD0011, ORD0012, etc.)
- **Service Order ID Format**: `SRVD` + user_number + sequence (SRVD0011, SRVD0012, etc.)
- **Parent Order ID**: `PORD` + user_number + sequence (for relationship tracking)

### 🛡️ Data Integrity
- Database transactions with proper locking
- Duplicate request prevention
- ID uniqueness validation
- Error handling and rollback mechanisms

### 📧 Communication System
- Separate emails for each dealer
- Comprehensive customer email with all order details
- Individual notifications for each party
- Dealer-specific order grouping

## System Architecture

### 1. Request Processing Flow

```
1. Validate Request Structure
   ↓
2. Validate User ID Format (USR001-USR999)
   ↓
3. Start Database Transaction
   ↓
4. Validate Products and Get Dealer Information
   ↓
5. Generate Unique Order IDs
   ↓
6. Create Parent Order Record
   ↓
7. Insert All Orders
   ↓
8. Group Orders by Dealer
   ↓
9. Send Separate Emails/Notifications
   ↓
10. Commit Transaction
   ↓
11. Return Response
```

### 2. ID Generation Process

#### Order ID Generation
```javascript
// Extract user number from user_id
const userNumber = user_id.replace(/\D/g, ''); // USR001 → 001

// Get existing order numbers for this user
const existingOrderNumbers = [1, 3, 5, 7, 9]; // Example

// Find next available number using range-based approach
let nextOrderNumber = 1;
for (let i = 1; i <= Math.max(...existingOrderNumbers) + 10; i++) {
  if (!existingOrderNumbers.includes(i)) {
    nextOrderNumber = i;
    break;
  }
}

// Generate order IDs
const orderIds = [];
for (let i = 0; i < cartItems.length; i++) {
  const orderNumber = nextOrderNumber + i;
  const orderId = `ORD${userNumber}${orderNumber}`;
  orderIds.push(orderId);
}
```

#### Range-Based Approach
```
Range 1-10:   ORD0011 to ORD00110
Range 11-20:  ORD00111 to ORD00120
Range 21-30:  ORD00121 to ORD00130
And so on...
```

### 3. Multi-Dealer Order Processing

#### Order Grouping
```javascript
const ordersByDealer = new Map();

cartItems.forEach((item, index) => {
  const product = productMap.get(item.product_id);
  const dealerId = product.dealer_id;
  const orderId = orderIds[index];
  
  if (!ordersByDealer.has(dealerId)) {
    ordersByDealer.set(dealerId, []);
  }
  
  ordersByDealer.get(dealerId).push({
    order_id: orderId,
    product_id: item.product_id,
    product_name: product.name,
    product_price: item.price,
    quantity: item.quantity,
    total_price: item.price * item.quantity,
    dealer_name: product.dealer_name
  });
});
```

#### Separate Communication
```javascript
// For each dealer
for (const [dealerId, dealerOrders] of ordersByDealer) {
  // Send email to dealer
  await sendOrderConfirmationEmail(dealerEmailData);
  
  // Create notification for dealer
  await createDealerNotification(dealerId, dealerOrders);
}

// Send comprehensive email to customer
await sendCustomerOrderConfirmationEmail(customerEmailData);
```

## API Endpoints

### POST /api/checkout

#### Request Body
```json
{
  "cartItems": [
    {
      "product_id": "PROD001",
      "name": "Oil Filter",
      "price": 25.99,
      "quantity": 2,
      "image": "oil-filter.jpg"
    }
  ],
  "orderData": {
    "user_id": "USR001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "customer_phone": "1234567890",
    "shipping_address": "123 Main St",
    "shipping_pincode": "12345",
    "tax_amount": 5.20,
    "shipping_cost": 10.00,
    "discount_amount": 0,
    "payment_method": "cod",
    "transaction_id": "TXN123456"
  }
}
```

#### Response
```json
{
  "success": true,
  "message": "Orders placed successfully",
  "orders": [
    {
      "order_id": "ORD0011",
      "product_id": "PROD001",
      "name": "Oil Filter",
      "price": 25.99,
      "quantity": 2,
      "image": "oil-filter.jpg",
      "dealer_name": "AutoParts Pro"
    }
  ],
  "total_items": 3,
  "total_amount": 97.48,
  "order_ids": ["ORD0011", "ORD0012", "ORD0013"],
  "parent_order_id": "PORD0011"
}
```

## Database Schema

### Orders Table
```sql
CREATE TABLE orders (
  order_id VARCHAR(20) PRIMARY KEY,
  user_id VARCHAR(10) NOT NULL,
  dealer_id VARCHAR(20) NOT NULL,
  product_id VARCHAR(20) NOT NULL,
  quantity INT NOT NULL,
  customer_name VARCHAR(100) NOT NULL,
  customer_email VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_pincode VARCHAR(10) NOT NULL,
  order_date DATETIME NOT NULL,
  order_status VARCHAR(20) DEFAULT 'Pending',
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  payment_method VARCHAR(20) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'Pending',
  transaction_id VARCHAR(50),
  INDEX idx_user_id (user_id),
  INDEX idx_dealer_id (dealer_id),
  INDEX idx_order_date (order_date)
);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

## Email Templates

### Dealer Email Structure
```javascript
{
  dealer_name: "AutoParts Pro",
  dealer_email: "orders@autopartspro.com",
  customer_name: "John Doe",
  customer_email: "john@example.com",
  customer_phone: "1234567890",
  shipping_address: "123 Main St",
  shipping_pincode: "12345",
  orders: [
    {
      order_id: "ORD0011",
      product_id: "PROD001",
      product_name: "Oil Filter",
      product_price: 25.99,
      quantity: 2,
      total_price: 51.98
    }
  ],
  total_amount: 51.98,
  tax_amount: 5.20,
  shipping_cost: 10.00,
  discount_amount: 0,
  payment_method: "cod",
  payment_status: "Pending"
}
```

### Customer Email Structure
```javascript
{
  customer_name: "John Doe",
  customer_email: "john@example.com",
  customer_phone: "1234567890",
  shipping_address: "123 Main St",
  shipping_pincode: "12345",
  orders: [
    {
      order_id: "ORD0011",
      product_id: "PROD001",
      product_name: "Oil Filter",
      product_price: 25.99,
      quantity: 2,
      total_price: 51.98,
      dealer_name: "AutoParts Pro"
    }
  ],
  total_amount: 97.48,
  tax_amount: 9.75,
  shipping_cost: 10.00,
  discount_amount: 0,
  payment_method: "cod",
  payment_status: "Pending"
}
```

## Error Handling

### Validation Errors
- **Invalid User ID**: Must match pattern `USR\d{3}`
- **Missing Products**: All products must exist in database
- **Invalid Request Structure**: Required fields missing

### Database Errors
- **Duplicate Order ID**: System retries with alternative ID
- **Transaction Failures**: Automatic rollback and error response
- **Connection Issues**: Graceful error handling

### Communication Errors
- **Email Failures**: Logged but don't block order processing
- **Notification Failures**: Logged but don't block order processing

## Security Features

### Request Deduplication
```javascript
const processedRequests = new Set();

// Generate unique request ID
const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);

// Check for duplicates
if (processedRequests.has(requestId)) {
  return NextResponse.json(
    { success: false, message: 'Duplicate request detected' },
    { status: 409 }
  );
}

// Clean up after 5 seconds
setTimeout(() => {
  processedRequests.delete(requestId);
}, 5000);
```

### Database Locking
```javascript
// Row-level locking during ID generation
const [existingUserOrders] = await connection.execute(
  'SELECT order_id FROM orders WHERE user_id = ? ORDER BY order_id FOR UPDATE',
  [user_id]
);
```

## Testing

### Test Scripts
1. **test-multi-product-checkout.js**: Comprehensive system testing
2. **test-new-id-generation-system.js**: ID generation validation
3. **update-id-formats.sql**: Database migration script

### Test Coverage
- ✅ User ID format validation
- ✅ Database structure validation
- ✅ Product and dealer data integrity
- ✅ ID generation with gap detection
- ✅ Multi-dealer order separation
- ✅ Email structure validation
- ✅ Notification system testing
- ✅ Transaction safety testing
- ✅ API response structure validation

## Performance Considerations

### Database Optimization
- Indexes on frequently queried columns
- Batch insertions for multiple orders
- Connection pooling for better performance

### Memory Management
- Request deduplication cleanup
- Proper connection closing
- Error handling without memory leaks

### Scalability
- Range-based ID generation supports high volume
- Separate dealer processing allows parallelization
- Transaction isolation prevents conflicts

## Monitoring and Logging

### Key Metrics
- Order processing time
- Email delivery success rate
- Database transaction success rate
- Error rates by type

### Logging
```javascript
console.log(`Generated order ID ${i + 1}: ${proposedId}`);
console.log(`Email sent to dealer ${dealer.dealer_name}`);
console.log('Checkout completed successfully:', responseData);
```

## Deployment Checklist

### Database Setup
- [ ] Create required tables with proper indexes
- [ ] Set up notifications table
- [ ] Configure database connection parameters
- [ ] Test database connectivity

### Environment Variables
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kriptocar
EMAIL_USER=your-email@example.com
EMAIL_PASSWORD=your-email-password
```

### Testing
- [ ] Run comprehensive test suite
- [ ] Test with multiple products and dealers
- [ ] Verify email delivery
- [ ] Test error scenarios

### Monitoring
- [ ] Set up error logging
- [ ] Configure performance monitoring
- [ ] Test transaction rollback scenarios

## Troubleshooting

### Common Issues

#### Duplicate Order IDs
**Problem**: `Duplicate entry 'ORD0011' for key 'orders.PRIMARY'`
**Solution**: System automatically retries with alternative ID

#### Email Delivery Failures
**Problem**: Emails not being sent
**Solution**: Check email configuration and credentials

#### Database Connection Issues
**Problem**: `ECONNREFUSED` errors
**Solution**: Verify database is running and credentials are correct

#### Transaction Failures
**Problem**: Orders not being created
**Solution**: Check database constraints and data validation

### Debug Mode
Enable detailed logging by setting environment variable:
```env
DEBUG=true
```

## Future Enhancements

### Planned Features
- Real-time order tracking
- Advanced inventory management
- Multi-language support
- Mobile app integration
- Advanced analytics dashboard

### Scalability Improvements
- Microservices architecture
- Message queue for email processing
- Caching layer for product data
- CDN for static assets

## Support

For technical support or questions about the Multi-Product Checkout System, please refer to:
- System documentation
- Test scripts for validation
- Database migration scripts
- Error logs for troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team
