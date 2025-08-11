# User ID Implementation Guide

This document explains the implementation of unique user IDs that start with "USR" followed by the largest number in the database.

## Overview

The system now generates unique user IDs in the format `USR000001`, `USR000002`, etc., where the number is the largest existing number in the database plus 1.

## Files Modified/Created

### 1. New Files Created

- `src/lib/userIdGenerator.ts` - User ID generation utility
- `migrate_user_ids.sql` - Database migration script
- `test-user-id-generation.js` - Test script for verification
- `USER_ID_IMPLEMENTATION.md` - This documentation

### 2. Files Modified

- `src/lib/auth.ts` - Updated User interface to use string user_id
- `src/app/api/signup/route.ts` - Modified to generate unique user IDs
- `src/app/api/login/route.ts` - Updated to handle string user IDs

## Implementation Details

### User ID Generator (`src/lib/userIdGenerator.ts`)

The `DatabaseUserIdGenerator` class:
- Queries the database to find the maximum USR number
- Generates the next sequential number
- Returns a formatted user ID (e.g., `USR000001`)

```typescript
// Example usage
const userIdGenerator = new DatabaseUserIdGenerator(connection);
const uniqueUserId = await userIdGenerator.generateUserId();
// Returns: "USR000001", "USR000002", etc.
```

### Database Migration

The migration script (`migrate_user_ids.sql`) performs the following:

1. **Adds user_id column** to the users table (VARCHAR(20))
2. **Updates existing users** to have USR format IDs
3. **Creates indexes** for better performance
4. **Adds unique constraints** to prevent duplicates

### API Changes

#### Signup API
- Now generates unique user IDs during registration
- Uses the `DatabaseUserIdGenerator` class
- Returns the generated user_id in the response

#### Login API
- Handles string user IDs instead of numbers
- Provides fallback for existing users without USR format

## Setup Instructions

### Step 1: Run Database Migration

Execute the migration script in your database:

```sql
-- Run migrate_user_ids.sql in your phpMyAdmin or MySQL client
```

### Step 2: Test the Implementation

Run the test script to verify everything works:

```bash
node test-user-id-generation.js
```

### Step 3: Verify API Endpoints

Test the signup and login APIs to ensure they work with the new user ID format.

## User ID Format

- **Format**: `USR` + 6-digit zero-padded number
- **Examples**: `USR000001`, `USR000002`, `USR000123`
- **Maximum**: `USR999999` (supports up to 999,999 users)

## Database Schema Changes

### Users Table
```sql
ALTER TABLE `kriptocar`.`users` 
ADD COLUMN `user_id` VARCHAR(20) NOT NULL UNIQUE;
```

### Indexes
```sql
CREATE INDEX idx_users_user_id ON kriptocar.users(user_id);
```

## Error Handling

The system includes comprehensive error handling:

1. **Database Connection Errors**: Graceful fallback
2. **Duplicate User IDs**: Unique constraint prevents duplicates
3. **Migration Errors**: Detailed error messages
4. **API Errors**: Proper HTTP status codes and messages

## Testing

### Manual Testing
1. Register a new user and verify the USR format ID
2. Login with existing users to ensure compatibility
3. Check that all API endpoints work with string user IDs

### Automated Testing
Run the test script to verify:
- Database connection
- User ID generation
- Existing user migration
- Table structure validation

## Migration Considerations

### Existing Users
- Users without USR format IDs will be automatically migrated
- The migration script assigns sequential USR IDs to existing users
- No data loss occurs during migration

### API Compatibility
- All existing API endpoints have been updated to handle string user IDs
- Backward compatibility is maintained for existing users
- New users will always have USR format IDs

## Performance Considerations

- User ID generation uses database queries for uniqueness
- Indexes are created for optimal performance
- The system can handle high concurrent registration rates

## Security Considerations

- User IDs are generated server-side
- No client-side user ID manipulation is possible
- Unique constraints prevent duplicate IDs
- Database transactions ensure data integrity

## Troubleshooting

### Common Issues

1. **Migration Fails**
   - Check database permissions
   - Verify table structure
   - Review error logs

2. **User ID Generation Fails**
   - Check database connection
   - Verify user_id column exists
   - Review SQL query syntax

3. **API Errors**
   - Check user_id format in requests
   - Verify database constraints
   - Review API error logs

### Debug Commands

```bash
# Test user ID generation
node test-user-id-generation.js

# Check database structure
DESCRIBE kriptocar.users;

# Verify user IDs
SELECT user_id, email FROM kriptocar.users WHERE user_id LIKE 'USR%';
```

## Future Enhancements

1. **UUID Support**: Consider UUID format for even better uniqueness
2. **Sharding**: Implement user ID sharding for large-scale deployments
3. **Caching**: Add Redis caching for user ID generation
4. **Monitoring**: Add metrics for user ID generation performance

## Support

For issues or questions regarding this implementation:
1. Check the test script output
2. Review database logs
3. Verify API responses
4. Check migration script execution
