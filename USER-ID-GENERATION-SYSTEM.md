# User ID Generation System Documentation

## Overview

The User ID Generation System is a robust solution for generating unique user IDs in the format 'USR' + 3-digit number (USR001 to USR999). It implements range-based checking, gap detection, and duplicate prevention to ensure data integrity.

## Key Features

### 🔧 ID Generation System
- **Format**: `USR` + 3-digit number (USR001 to USR999)
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
2. Get All Existing User IDs (FOR UPDATE)
   ↓
3. Extract User Numbers and Sort
   ↓
4. Find Next Available Number (Gap Detection)
   ↓
5. Generate User ID
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
Range 1: USR001 to USR010
Range 2: USR011 to USR020
Range 3: USR021 to USR030
Range 4: USR031 to USR040
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
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_email (email)
);
```

## API Endpoints

### POST /api/users/generate-id

#### Request
```http
POST /api/users/generate-id
Content-Type: application/json
```

#### Response
```json
{
  "success": true,
  "message": "User ID generated successfully",
  "data": {
    "user_id": "USR001",
    "user_number": 1,
    "range_info": {
      "rangeStart": 1,
      "rangeEnd": 10,
      "rangeNumber": 1
    },
    "statistics": {
      "total_users": 5,
      "next_available_number": 6,
      "used_ranges": [1],
      "available_ranges": [2, 3, 4],
      "gaps": [2, 4]
    }
  }
}
```

### GET /api/users/generate-id

#### Request
```http
GET /api/users/generate-id
```

#### Response
```json
{
  "success": true,
  "message": "User ID statistics retrieved successfully",
  "data": {
    "total_users": 5,
    "next_available_number": 6,
    "used_ranges": [1],
    "available_ranges": [2, 3, 4],
    "gaps": [2, 4],
    "range_explanation": {
      "range_1": "USR001 to USR010",
      "range_2": "USR011 to USR020",
      "range_3": "USR021 to USR030",
      "...": "And so on..."
    }
  }
}
```

## Usage Examples

### Basic Usage
```javascript
import { userIdGenerator } from '@/lib/userIdGenerator';

// Generate a new user ID
const userId = await userIdGenerator.generateUserId();
console.log(userId); // Output: USR001

// Validate user ID format
const isValid = UserIdGenerator.validateUserIdFormat('USR001'); // true
const isInvalid = UserIdGenerator.validateUserIdFormat('USR1'); // false

// Extract user number
const userNumber = UserIdGenerator.extractUserNumber('USR001'); // 1

// Get range information
const rangeInfo = UserIdGenerator.getRangeInfo(1);
// { rangeStart: 1, rangeEnd: 10, rangeNumber: 1 }
```

### Advanced Usage
```javascript
// Check if user ID is available
const isAvailable = await userIdGenerator.isUserIdAvailable('USR001');

// Get comprehensive statistics
const statistics = await userIdGenerator.getUserIdStatistics();
console.log(statistics);
/*
{
  totalUsers: 5,
  usedRanges: [1],
  availableRanges: [2, 3, 4],
  nextAvailableNumber: 6,
  gaps: [2, 4]
}
*/
```

## Database Functions and Procedures

### get_next_user_id() Function
```sql
-- Returns the next available user ID
SELECT get_next_user_id(); -- Returns: USR006
```

### insert_user_with_id() Procedure
```sql
-- Insert a new user with auto-generated ID
CALL insert_user_with_id('John Doe', 'john@example.com', '1234567890', 'hashed_password');
-- Returns: { generated_user_id: 'USR006' }
```

## Error Handling

### Common Errors and Solutions

#### 1. Duplicate User ID
**Error**: `Duplicate entry 'USR001' for key 'users.PRIMARY'`
**Solution**: System automatically retries with alternative ID

#### 2. Database Connection Issues
**Error**: `ECONNREFUSED`
**Solution**: Check database connectivity and credentials

#### 3. Transaction Failures
**Error**: `ER_LOCK_WAIT_TIMEOUT`
**Solution**: System retries with exponential backoff

#### 4. Invalid User ID Format
**Error**: `Invalid user ID format`
**Solution**: Ensure user ID matches pattern `USR\d{3}`

### Error Response Format
```json
{
  "success": false,
  "message": "Failed to generate user ID",
  "error": "Specific error message"
}
```

## Performance Considerations

### Database Optimization
- **Indexes**: `user_id` column is indexed for fast lookups
- **Batch Operations**: Multiple ID generations in single transaction
- **Connection Pooling**: Efficient database connection management

### Memory Management
- **Request Deduplication**: Prevents duplicate requests
- **Connection Cleanup**: Proper connection closing
- **Error Recovery**: Graceful error handling

### Scalability
- **Range-Based Approach**: Supports up to 999 users efficiently
- **Gap Detection**: Optimizes ID reuse
- **Transaction Isolation**: Prevents race conditions

## Testing

### Test Scripts
1. **test-user-id-generation.js**: Comprehensive system testing
2. **setup-user-id-system.sql**: Database setup and migration

### Test Coverage
- ✅ User ID format validation
- ✅ Database structure validation
- ✅ Gap detection and next available number logic
- ✅ Range-based approach testing
- ✅ Statistics generation and analysis
- ✅ Edge case handling
- ✅ Database transaction safety
- ✅ Duplicate prevention testing

### Running Tests
```bash
# Run the test script
node test-user-id-generation.js

# Execute database setup
mysql -u root -p kriptocar < setup-user-id-system.sql
```

## Monitoring and Logging

### Key Metrics
- User ID generation time
- Database transaction success rate
- Gap detection efficiency
- Error rates by type

### Logging
```javascript
console.log(`Generated user ID: ${userId}`);
console.log(`Existing user numbers: ${existingUserNumbers.join(', ')}`);
console.log(`Next available number: ${nextUserNumber}`);
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
const [existingUsers] = await connection.execute(
  'SELECT user_id FROM users ORDER BY user_id FOR UPDATE'
);
```

## Deployment Checklist

### Database Setup
- [ ] Create users table with proper structure
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

#### 1. User ID Generation Fails
**Problem**: System unable to generate unique user ID
**Solution**: Check database connectivity and table structure

#### 2. Duplicate User IDs
**Problem**: Same user ID generated multiple times
**Solution**: Verify transaction isolation and locking

#### 3. Performance Issues
**Problem**: Slow user ID generation
**Solution**: Check database indexes and connection pooling

#### 4. Range Analysis Errors
**Problem**: Incorrect range calculations
**Solution**: Verify user ID format and number extraction

### Debug Mode
Enable detailed logging by setting environment variable:
```env
DEBUG=true
```

## Future Enhancements

### Planned Features
- Real-time user ID monitoring dashboard
- Advanced analytics and reporting
- Multi-tenant user ID management
- API rate limiting and throttling

### Scalability Improvements
- Microservices architecture
- Caching layer for frequently accessed data
- Horizontal scaling support
- Advanced load balancing

## Support

For technical support or questions about the User ID Generation System, please refer to:
- System documentation
- Test scripts for validation
- Database migration scripts
- Error logs for troubleshooting

---

**Version**: 1.0.0  
**Last Updated**: December 2024  
**Maintainer**: Development Team
