// Test script to check email and notification configuration
require('dotenv').config();

console.log('=== Email Configuration Test ===');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');

console.log('\n=== Database Configuration Test ===');
console.log('DB_HOST:', process.env.DB_HOST || 'localhost');
console.log('DB_USER:', process.env.DB_USER || 'root');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? 'Set' : 'Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'kriptocar');

console.log('\n=== Testing Database Connection ===');
const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('✅ Database connection successful');

    // Test notifications table
    const [notifications] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
    console.log('Notifications table count:', notifications[0].count);

    // Test dealers table
    const [dealers] = await connection.execute('SELECT COUNT(*) as count FROM dealers');
    console.log('Dealers table count:', dealers[0].count);

    // Test orders table
    const [orders] = await connection.execute('SELECT COUNT(*) as count FROM orders');
    console.log('Orders table count:', orders[0].count);

    await connection.end();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  }
}

testConnection();
