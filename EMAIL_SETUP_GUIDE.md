# Email Setup Guide - Fix "Email configuration not found"

## Problem
You're seeing "Email configuration not found, skipping email send" because the email environment variables are not configured.

## Solution

### Step 1: Create .env.local file

Create a file named `.env.local` in your project root directory (same level as `package.json`) with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=kriptocar

# Email Configuration (for Gmail)
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 2: Set up Gmail App Password

**Important**: You cannot use your regular Gmail password. You need to create an "App Password".

#### For Gmail:

1. **Enable 2-Factor Authentication**:
   - Go to your Google Account settings
   - Security → 2-Step Verification
   - Turn on 2-Step Verification if not already enabled

2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Select "Mail" as the app
   - Click "Generate"
   - Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

3. **Use the App Password**:
   - Replace `your_app_password` in `.env.local` with the generated app password
   - Remove spaces from the password

### Step 3: Example .env.local file

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=kriptocar

# Email Configuration
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 4: Test the Email Configuration

After creating the `.env.local` file, run the email test:

```bash
node test-email.js
```

You should see:
```
✅ Email connection successful!
✅ Test email sent successfully!
```

### Step 5: Test with Application

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Register a new user
3. Check if welcome email is sent

## Troubleshooting

### Common Issues:

1. **"Invalid login" error**:
   - Make sure you're using an App Password, not your regular password
   - Ensure 2FA is enabled on your Gmail account

2. **"Less secure app access" error**:
   - Gmail no longer supports "less secure app access"
   - You must use App Passwords with 2FA enabled

3. **"Connection timeout"**:
   - Check your internet connection
   - Try using a different email provider

4. **"Authentication failed"**:
   - Double-check your email and app password
   - Make sure there are no extra spaces in the password

### Alternative Email Providers:

If Gmail doesn't work, you can use other providers:

#### Outlook/Hotmail:
```env
EMAIL_USER=your_email@outlook.com
EMAIL_PASSWORD=your_password
```

#### Yahoo:
```env
EMAIL_USER=your_email@yahoo.com
EMAIL_PASSWORD=your_app_password
```

### Testing Different Providers:

Run the test script to check different providers:
```bash
node test-email.js
```

## Security Notes

- **Never commit `.env.local` to version control**
- **Use App Passwords, not regular passwords**
- **Keep your App Password secure**
- **Regularly rotate your App Password**

## Next Steps

After setting up email:

1. Test user registration to see welcome emails
2. Check email logs for any issues
3. Monitor email delivery rates
4. Set up email templates for different scenarios

## Verification

Once configured, you should see:
- ✅ "Email sent successfully" in console logs
- ✅ Welcome emails in your inbox
- ✅ No more "Email configuration not found" warnings
