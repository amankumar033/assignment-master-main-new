// Test the application's email functionality
const { sendEmail, sendWelcomeEmail } = require('./src/lib/email.ts');

async function testAppEmail() {
  console.log('🔍 Testing Application Email Functionality...\n');

  // Check environment variables
  console.log('📋 Environment Variables Check:');
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set'}`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('\n❌ Email configuration incomplete!');
    console.log('Please set EMAIL_USER and EMAIL_PASSWORD in your .env.local file');
    return;
  }

  // Test 1: Basic email sending
  console.log('\n📧 Test 1: Basic Email Sending...');
  try {
    const result = await sendEmail({
      to: process.env.EMAIL_USER,
      subject: '🧪 App Email Test - ' + new Date().toLocaleString(),
      html: `
        <h1>App Email Test</h1>
        <p>This is a test email from the KriptoCar application.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
        <p>If you receive this, the app email system is working!</p>
      `,
      text: `
App Email Test

This is a test email from the KriptoCar application.
Time: ${new Date().toLocaleString()}

If you receive this, the app email system is working!
      `
    });

    if (result) {
      console.log('✅ Basic email sent successfully!');
    } else {
      console.log('❌ Basic email failed to send');
    }
  } catch (error) {
    console.log('❌ Basic email error:', error.message);
  }

  // Test 2: Welcome email
  console.log('\n📧 Test 2: Welcome Email...');
  try {
    const result = await sendWelcomeEmail(process.env.EMAIL_USER, 'Test User');
    
    if (result) {
      console.log('✅ Welcome email sent successfully!');
    } else {
      console.log('❌ Welcome email failed to send');
    }
  } catch (error) {
    console.log('❌ Welcome email error:', error.message);
  }

  // Test 3: Multiple emails
  console.log('\n📧 Test 3: Multiple Emails...');
  const testEmails = [
    {
      to: process.env.EMAIL_USER,
      subject: 'Test Email 1',
      html: '<h1>Test Email 1</h1><p>First test email</p>'
    },
    {
      to: process.env.EMAIL_USER,
      subject: 'Test Email 2',
      html: '<h1>Test Email 2</h1><p>Second test email</p>'
    }
  ];

  for (let i = 0; i < testEmails.length; i++) {
    try {
      const result = await sendEmail(testEmails[i]);
      console.log(`✅ Test email ${i + 1} sent: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.log(`❌ Test email ${i + 1} error: ${error.message}`);
    }
  }

  console.log('\n🏁 App email tests completed!');
  console.log('📬 Check your email inbox for test messages');
}

// Run the test
testAppEmail().catch(console.error);
