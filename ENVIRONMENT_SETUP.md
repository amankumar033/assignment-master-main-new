# Environment Setup Guide

This guide helps you set up the environment variables needed for the application to work properly.

## Required Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

### Database Configuration
```env
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=kriptocar
```

### Email Configuration (Optional - for welcome emails)
```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Email Setup Instructions

### For Gmail:
1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
3. Use the generated password in `EMAIL_PASSWORD`

### For Other Email Providers:
Update the `service` field in `src/lib/email.ts`:
- Outlook: `service: 'outlook'`
- Yahoo: `service: 'yahoo'`
- Custom SMTP: Use `host` and `port` instead of `service`

## Database Setup

1. Create a MySQL database named `kriptocar`
2. Run the migration scripts:
   ```sql
   -- Run database_setup.sql
   -- Run serviceorders_setup.sql
   -- Run migrate_user_ids.sql
   ```

## Testing the Setup

1. **Test Database Connection:**
   ```bash
   node test-db-connection.js
   ```

2. **Test User ID Generation:**
   ```bash
   node test-user-id-generation.js
   ```

3. **Test Email Configuration:**
   - Register a new user
   - Check if welcome email is sent (if configured)

## Troubleshooting

### Email Issues
- **"Email configuration not found"**: This is normal if email env vars are not set
- **"Authentication failed"**: Check your email credentials and app password
- **"Connection timeout"**: Check your internet connection and firewall settings

### Database Issues
- **"Connection refused"**: Make sure MySQL is running
- **"Access denied"**: Check database credentials
- **"Database not found"**: Create the `kriptocar` database

### User ID Generation Issues
- **"Failed to generate unique user ID"**: Check database connection and table structure
- **"Column not found"**: Run the migration scripts

## Development vs Production

### Development
- Email warnings are normal and won't break functionality
- Use local database
- Set `NEXT_PUBLIC_APP_URL=http://localhost:3000`

### Production
- Set up proper email configuration
- Use production database
- Set `NEXT_PUBLIC_APP_URL` to your domain
- Use environment-specific database credentials

## Security Notes

- Never commit `.env.local` to version control
- Use strong passwords for database and email
- Use app passwords for email (not regular passwords)
- Regularly rotate credentials
