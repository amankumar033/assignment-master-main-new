require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');

async function checkNotificationsStructure() {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('🔍 Checking notifications table structure...');
    
    const [columns] = await connection.execute('DESCRIBE kriptocar.notifications');
    
    console.log('\n📋 Notifications table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });

    // Check if there are any notifications
    const [notifications] = await connection.execute('SELECT COUNT(*) as count FROM kriptocar.notifications');
    console.log(`\n📊 Total notifications in database: ${notifications[0].count}`);

    // Check sample notifications
    const [sampleNotifications] = await connection.execute('SELECT * FROM kriptocar.notifications LIMIT 3');
    console.log('\n📋 Sample notifications:');
    sampleNotifications.forEach((notification, index) => {
      console.log(`  ${index + 1}. ${JSON.stringify(notification, null, 2)}`);
    });

  } catch (error) {
    console.error('❌ Error checking notifications structure:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkNotificationsStructure();













