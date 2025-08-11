require('dotenv').config();

console.log('=== Email Configuration Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ Set' : '❌ Not set');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
  console.log('\n❌ Email configuration is missing!');
  console.log('Please set EMAIL_USER and EMAIL_PASSWORD in your .env file');
  console.log('For Gmail, use an App Password instead of your regular password');
} else {
  console.log('\n✅ Email configuration appears to be set up correctly');
  console.log('Note: This only checks if the variables are set, not if they are valid');
}
