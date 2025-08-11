const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testNotificationsAndEmail() {
  console.log('🔔 TESTING NOTIFICATIONS & EMAIL FUNCTIONALITY...\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      connectTimeout: 10000
    });
    
    console.log('✅ Database connected');
    
    // Check if notifications table exists
    console.log('📋 Checking notifications table...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "notifications"');
    const notificationsTableExists = tables.length > 0;
    console.log(`Notifications table exists: ${notificationsTableExists ? '✅ YES' : '❌ NO'}`);
    
    if (!notificationsTableExists) {
      console.log('💡 Run the create-notifications-table.sql script to create the notifications table');
      return;
    }
    
    // Check notifications table structure
    console.log('🏗️ Notifications table structure:');
    const [columns] = await connection.execute('DESCRIBE notifications');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    
    // Check existing notifications
    console.log('\n📢 Checking existing notifications...');
    const [notifications] = await connection.execute('SELECT COUNT(*) as count FROM notifications');
    console.log(`Total notifications in table: ${notifications[0].count}`);
    
    if (notifications[0].count > 0) {
      const [recentNotifications] = await connection.execute(
        'SELECT id, type, title, message, for_admin, user_id, is_read, created_at FROM notifications ORDER BY created_at DESC LIMIT 5'
      );
      console.log('Recent notifications:');
      recentNotifications.forEach(notification => {
        console.log(`  ${notification.id} - ${notification.type}: ${notification.title} (${notification.is_read ? 'Read' : 'Unread'})`);
      });
    }
    
    // Test creating a notification
    console.log('\n📝 Testing notification creation...');
    const testNotification = {
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification to verify the system works.',
      for_admin: 1,
      user_id: 'USR000001'
    };
    
    await connection.execute(
      `INSERT INTO notifications (type, title, message, for_admin, user_id) 
       VALUES (?, ?, ?, ?, ?)`,
      [testNotification.type, testNotification.title, testNotification.message, testNotification.for_admin, testNotification.user_id]
    );
    
    console.log('✅ Test notification created successfully');
    
    // Clean up test notification
    await connection.execute('DELETE FROM notifications WHERE type = ?', ['test']);
    console.log('🧹 Test notification cleaned up');
    
    // Check email configuration
    console.log('\n📧 Checking email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
      console.log('✅ Email configuration is set up');
      console.log('💡 Welcome emails will be sent to new users');
    } else {
      console.log('⚠️ Email configuration is missing');
      console.log('💡 Set EMAIL_USER and EMAIL_PASSWORD in .env.local to enable welcome emails');
    }
    
    console.log('\n🎉 NOTIFICATIONS & EMAIL TEST COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log(`✅ Notifications table: ${notificationsTableExists ? 'Exists' : 'Missing'}`);
    console.log(`✅ Notifications in table: ${notifications[0].count}`);
    console.log('✅ Notification creation: Working');
    console.log(`✅ Email configuration: ${process.env.EMAIL_USER && process.env.EMAIL_PASSWORD ? 'Set up' : 'Missing'}`);
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Run create-notifications-table.sql if notifications table is missing');
    console.log('2. Set up email configuration in .env.local for welcome emails');
    console.log('3. Test signup to see notifications and emails in action');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testNotificationsAndEmail();
