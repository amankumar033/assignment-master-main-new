require('dotenv').config({ path: '.env.local' });

const nodemailer = require('nodemailer');

async function testSimpleEmail() {
  console.log('🧪 Testing Simple Email...');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('❌ Email configuration missing');
    return;
  }

  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'lilonij125@cotasen.com',
    subject: 'Test Order Confirmation - KriptoCar',
    html: `
      <h1>Test Order Confirmation</h1>
      <p>Hello Test Customer,</p>
      <p>This is a test email to verify that order confirmation emails are working.</p>
      <p>Your order has been successfully placed!</p>
      <p>Best regards,<br>The KriptoCar Team</p>
    `
  };

  try {
    console.log('📧 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
  } catch (error) {
    console.error('❌ Error sending test email:', error.message);
  }
}

testSimpleEmail();





