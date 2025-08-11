const nodemailer = require('nodemailer');

// Test email configuration
async function testEmailConfiguration() {
  console.log('🔍 Testing Email Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);
  console.log(`  NEXT_PUBLIC_APP_URL: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Email configuration incomplete!');
    console.log('Please set EMAIL_USER and EMAIL_PASSWORD in your .env.local file');
    console.log('\nExample .env.local file:');
    console.log('EMAIL_USER=your_email@gmail.com');
    console.log('EMAIL_PASSWORD=your_app_password');
    console.log('NEXT_PUBLIC_APP_URL=http://localhost:3000');
    return;
  }

  // Create transporter
  console.log('\n🔧 Creating email transporter...');
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // Test connection
  console.log('🔗 Testing email connection...');
  try {
    await transporter.verify();
    console.log('✅ Email connection successful!');
  } catch (error) {
    console.log('❌ Email connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure you have 2FA enabled on your Gmail account');
    console.log('2. Generate an App Password (not your regular password)');
    console.log('3. Check if your Gmail account allows "less secure app access"');
    console.log('4. Try using a different email provider');
    return;
  }

  // Test email sending
  console.log('\n📧 Testing email sending...');
  const testEmail = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself for testing
    subject: '🧪 KriptoCar Email Test - ' + new Date().toLocaleString(),
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Email Test</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #034c8c 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .success { color: #28a745; font-weight: bold; }
          .info { background: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Email Test Successful!</h1>
            <p>KriptoCar Email System is Working</p>
          </div>
          
          <div class="content">
            <h2 class="success">✅ Email Configuration Test Passed!</h2>
            
            <div class="info">
              <h3>Test Details:</h3>
              <ul>
                <li><strong>From:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>To:</strong> ${process.env.EMAIL_USER}</li>
                <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
                <li><strong>Service:</strong> Gmail</li>
              </ul>
            </div>
            
            <p>This email confirms that your KriptoCar application can successfully send emails. The email system is now ready for:</p>
            <ul>
              <li>Welcome emails for new user registrations</li>
              <li>Order confirmation emails</li>
              <li>Password reset emails</li>
              <li>Service booking confirmations</li>
            </ul>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Register a new user to test welcome emails</li>
              <li>Check that emails are being sent automatically</li>
              <li>Monitor your email logs for any issues</li>
            </ol>
            
            <p>If you received this email, your email configuration is working perfectly! 🎉</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
Email Test Successful!

KriptoCar Email System is Working

Test Details:
- From: ${process.env.EMAIL_USER}
- To: ${process.env.EMAIL_USER}
- Time: ${new Date().toLocaleString()}
- Service: Gmail

This email confirms that your KriptoCar application can successfully send emails.

Next Steps:
1. Register a new user to test welcome emails
2. Check that emails are being sent automatically
3. Monitor your email logs for any issues

If you received this email, your email configuration is working perfectly!
    `
  };

  try {
    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    console.log('\n📬 Check your email inbox for the test message');
    console.log('📧 Sent to:', process.env.EMAIL_USER);
  } catch (error) {
    console.log('❌ Failed to send test email:', error.message);
    console.log('\n🔧 Common issues and solutions:');
    console.log('1. Check your Gmail app password is correct');
    console.log('2. Make sure 2FA is enabled on your Gmail account');
    console.log('3. Try generating a new app password');
    console.log('4. Check if your Gmail account has any restrictions');
    console.log('5. Try using a different email provider');
  }
}

// Test different email providers
async function testDifferentProviders() {
  console.log('\n🔍 Testing Different Email Providers...\n');

  const providers = [
    {
      name: 'Gmail',
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      }
    },
    {
      name: 'Outlook',
      config: {
        service: 'outlook',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      }
    },
    {
      name: 'Yahoo',
      config: {
        service: 'yahoo',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        }
      }
    }
  ];

  for (const provider of providers) {
    console.log(`🔧 Testing ${provider.name}...`);
    try {
      const transporter = nodemailer.createTransporter(provider.config);
      await transporter.verify();
      console.log(`✅ ${provider.name} connection successful!`);
    } catch (error) {
      console.log(`❌ ${provider.name} connection failed: ${error.message}`);
    }
  }
}

// Main test function
async function runEmailTests() {
  console.log('🚀 Starting Email Configuration Tests...\n');
  
  try {
    await testEmailConfiguration();
    await testDifferentProviders();
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
  
  console.log('\n🏁 Email tests completed!');
}

// Run the tests
runEmailTests().catch(console.error);
