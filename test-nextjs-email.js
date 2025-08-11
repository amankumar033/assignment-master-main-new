// Test email in Next.js context
require('dotenv').config({ path: '.env.local' });

// Simulate the email library - fix the import
const nodemailer = require('nodemailer');

// Create transporter function (same as in email.ts)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Simulate the sendEmail function (same as in email.ts)
const sendEmail = async (options) => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email configuration not found, skipping email send');
      console.log('EMAIL_USER:', process.env.EMAIL_USER);
      console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***set***' : 'not set');
      return false;
    }

    console.log('✅ Email configuration found!');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASSWORD:', '***set***');

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

// Test function
async function testNextJsEmail() {
  console.log('🧪 Testing Email in Next.js Context...\n');
  
  console.log('📋 Environment Check:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : 'undefined');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '***set***' : 'undefined');
  
  console.log('\n📧 Testing sendEmail function...');
  
  const result = await sendEmail({
    to: process.env.EMAIL_USER,
    subject: '🧪 Next.js Email Test - ' + new Date().toLocaleString(),
    html: `
      <h1>Next.js Email Test</h1>
      <p>This is a test email from the Next.js context.</p>
      <p>Time: ${new Date().toLocaleString()}</p>
      <p>If you receive this, the email system is working in Next.js!</p>
    `
  });
  
  if (result) {
    console.log('\n✅ Email test successful!');
    console.log('📬 Check your inbox for the test email');
  } else {
    console.log('\n❌ Email test failed!');
  }
}

// Run the test
testNextJsEmail().catch(console.error);
