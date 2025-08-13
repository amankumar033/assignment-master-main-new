// Simple environment variable check
require('dotenv').config();

console.log('=== Environment Variables Check ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'kriptocar');

// Test if .env file exists
const fs = require('fs');
if (fs.existsSync('.env')) {
  console.log('✅ .env file exists');
} else {
  console.log('❌ .env file not found');
}
