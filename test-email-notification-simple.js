// Simple test for email and notification functionality
require('dotenv').config();

const mysql = require('mysql2/promise');

async function testEmailAndNotifications() {
  console.log('=== Testing Email and Notification Systems ===');
  
  try {
    // Test database connection
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

    // Test if we can insert a notification
    try {
      await connection.execute(
        `INSERT INTO notifications (
          notification_id, user_id, notification_type, title, message, is_read
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        ['NOT999', 'USR001', 'test', 'Test Notification', 'This is a test notification', 0]
      );
      console.log('✅ Test notification inserted successfully');
      
      // Clean up test notification
      await connection.execute('DELETE FROM notifications WHERE notification_id = ?', ['NOT999']);
      console.log('✅ Test notification cleaned up');
    } catch (error) {
      console.error('❌ Failed to insert test notification:', error.message);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
  }

  // Test email configuration
  console.log('\n=== Email Configuration ===');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.log('⚠️ Email configuration missing - emails will not be sent');
  } else {
    console.log('✅ Email configuration appears to be set');
  }
}

testEmailAndNotifications();
