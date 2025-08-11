// Quick email test - run this after setting up .env.local
require('dotenv').config({ path: '.env.local' });
const nodemailer = require('nodemailer');

async function quickTest() {
  console.log('🧪 Quick Email Test\n');
  
  // Check if env vars are set
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email configuration missing!');
    console.log('Please create .env.local file with EMAIL_USER and EMAIL_PASSWORD');
    return;
  }
  
  console.log(`📧 Testing with: ${process.env.EMAIL_USER}`);
  
  // Create transporter
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  // Test connection
  try {
    await transporter.verify();
    console.log('✅ Connection successful!');
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return;
  }
  
  // Send test email
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: '✅ KriptoCar Email Test - ' + new Date().toLocaleTimeString(),
      html: '<h1>Email Test Successful!</h1><p>Your KriptoCar email system is working! 🎉</p>'
    });
    
    console.log('✅ Test email sent!');
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log('📬 Check your inbox for the test email');
  } catch (error) {
    console.log('❌ Failed to send email:', error.message);
  }
}

quickTest().catch(console.error);
