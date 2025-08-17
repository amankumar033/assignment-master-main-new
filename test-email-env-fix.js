require('dotenv').config({ path: '.env.local' });

console.log('🔍 Testing Email Environment Variables...');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : 'undefined');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'SET (hidden)' : 'undefined');

if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
  console.log('✅ Email configuration is properly set');
  
  // Test the email sending function
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  
  console.log('📧 Testing email connection...');
  
  transporter.verify(function(error, success) {
    if (error) {
      console.log('❌ Email connection failed:', error.message);
    } else {
      console.log('✅ Email server is ready to send messages');
    }
  });
} else {
  console.log('❌ Email configuration is missing');
  console.log('Please check your .env.local file');
}





