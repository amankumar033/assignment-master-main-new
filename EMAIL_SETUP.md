# Email Setup Guide

## Environment Variables Required

Add these variables to your `.env.local` file:

```env
# Email Configuration (for Nodemailer)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Gmail Setup (Recommended)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `EMAIL_PASSWORD`

## Other Email Services

You can use other email services by modifying the transporter in `src/lib/email.ts`:

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransporter({
  service: 'outlook',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

### Custom SMTP
```javascript
const transporter = nodemailer.createTransporter({
  host: 'your-smtp-host.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});
```

## Features Implemented

✅ **Welcome Email**: Sent to new users upon registration
✅ **Admin Notification**: Creates notification in database for admin
✅ **Error Handling**: Signup doesn't fail if email/notification fails
✅ **Professional Design**: HTML email with KriptoCar branding

## Testing

To test email functionality:
1. Set up environment variables in `.env.local`
2. Restart your development server
3. Register a new user
4. Check email inbox
5. Check notifications table in database

## Troubleshooting

### Email Not Sending
- Check if environment variables are set correctly
- Ensure Gmail 2FA is enabled and app password is generated
- Check console logs for email errors
- Signup will still work even if email fails

### Environment Variables Not Loading
- Make sure variables are in `.env.local` (not `.env`)
- Restart the development server after adding variables
- Check that variable names match exactly 