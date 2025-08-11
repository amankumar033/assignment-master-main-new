// Debug script to check environment variable loading
require('dotenv').config({ path: '.env.local' });

console.log('🔍 Debugging Email Environment Variables...\n');

// Check all environment variables
console.log('📋 All Environment Variables:');
console.log('process.env keys:', Object.keys(process.env).filter(key => key.includes('EMAIL') || key.includes('DB')));

console.log('\n📧 Email Variables:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? `"${process.env.EMAIL_USER}"` : 'undefined');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? `"${process.env.EMAIL_PASSWORD.substring(0, 4)}..."` : 'undefined');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'undefined');

console.log('\n🗄️ Database Variables:');
console.log('DB_HOST:', process.env.DB_HOST || 'undefined');
console.log('DB_USER:', process.env.DB_USER || 'undefined');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***set***' : 'undefined');
console.log('DB_NAME:', process.env.DB_NAME || 'undefined');

// Check if .env.local file exists
const fs = require('fs');
const path = require('path');

const envLocalPath = path.join(__dirname, '.env.local');
const envPath = path.join(__dirname, '.env');

console.log('\n📁 Environment Files:');
console.log('.env.local exists:', fs.existsSync(envLocalPath));
console.log('.env exists:', fs.existsSync(envPath));

if (fs.existsSync(envLocalPath)) {
  console.log('\n📄 .env.local content (first few lines):');
  const content = fs.readFileSync(envLocalPath, 'utf8');
  const lines = content.split('\n').slice(0, 5);
  lines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key] = line.split('=');
      console.log(`  ${key}=***`);
    }
  });
}

// Test different ways of loading environment variables
console.log('\n🧪 Testing Different Loading Methods:');

// Method 1: Direct require
try {
  require('dotenv').config({ path: '.env.local', override: true });
  console.log('Method 1 (override): EMAIL_USER =', process.env.EMAIL_USER ? 'set' : 'not set');
} catch (error) {
  console.log('Method 1 failed:', error.message);
}

// Method 2: Check if variables are in process.env
const hasEmailUser = 'EMAIL_USER' in process.env;
const hasEmailPassword = 'EMAIL_PASSWORD' in process.env;
console.log('Method 2 (in operator): EMAIL_USER =', hasEmailUser ? 'exists' : 'not exists');
console.log('Method 2 (in operator): EMAIL_PASSWORD =', hasEmailPassword ? 'exists' : 'not exists');

// Method 3: Check undefined vs null
console.log('Method 3 (undefined check): EMAIL_USER =', process.env.EMAIL_USER === undefined ? 'undefined' : 'defined');
console.log('Method 3 (undefined check): EMAIL_PASSWORD =', process.env.EMAIL_PASSWORD === undefined ? 'undefined' : 'defined');

// Method 4: Check empty string
console.log('Method 4 (empty check): EMAIL_USER =', process.env.EMAIL_USER === '' ? 'empty string' : 'not empty');
console.log('Method 4 (empty check): EMAIL_PASSWORD =', process.env.EMAIL_PASSWORD === '' ? 'empty string' : 'not empty');

console.log('\n🏁 Debug completed!');
