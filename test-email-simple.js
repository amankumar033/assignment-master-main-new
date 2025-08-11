require('dotenv').config({ path: '.env.local' });

console.log('🔍 Simple Email Configuration Check...\n');

// Check environment variables
console.log('📋 Email Environment Variables:');
console.log('  EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('  EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('  NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || '❌ NOT SET');

// Check database variables
console.log('\n📋 Database Environment Variables:');
console.log('  DB_HOST:', process.env.DB_HOST || '❌ NOT SET');
console.log('  DB_USER:', process.env.DB_USER || '❌ NOT SET');
console.log('  DB_PASSWORD:', process.env.DB_PASSWORD ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('  DB_NAME:', process.env.DB_NAME || '❌ NOT SET');

// Check if .env.local exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('\n✅ .env.local file exists');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  console.log('📄 File contents:');
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      console.log(`   ${key}`);
    }
  });
} else {
  console.log('\n❌ .env.local file does not exist');
}

console.log('\n🔧 To fix email issues:');
console.log('1. Make sure EMAIL_USER and EMAIL_PASSWORD are set in .env.local');
console.log('2. For Gmail: Use App Password, not regular password');
console.log('3. Restart the development server after changes');
