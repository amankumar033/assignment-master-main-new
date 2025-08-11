// Test notifications creation
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testNotifications() {
  console.log('🧪 Testing Notifications Creation...\n');
  
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Database connection established');

    // Check if notifications table exists
    console.log('\n📊 Checking notifications table...');
    const [tables] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'kriptocar' AND table_name = 'notifications'"
    );
    
    if (tables[0].count === 0) {
      console.log('❌ Notifications table does not exist!');
      console.log('Please run the check-notifications-table.sql script first.');
      return;
    } else {
      console.log('✅ Notifications table exists');
    }

    // Show table structure
    console.log('\n📋 Notifications table structure:');
    const [columns] = await connection.execute('DESCRIBE kriptocar.notifications');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });

    // Test creating a notification
    console.log('\n🔔 Testing notification creation...');
    
    const testNotification = {
      type: 'order_placed', // Use correct ENUM value
      title: 'Test Order Notification',
      message: 'This is a test notification for order ORD000001',
      for_admin: 1,
      for_dealer: 0,
      dealer_id: null,
      user_id: null, // Set to null for admin notifications
      metadata: JSON.stringify({
        order_id: 'ORD000001',
        customer_name: 'Test Customer',
        total_amount: 99.99
      })
    };

    const [result] = await connection.execute(
      `INSERT INTO kriptocar.notifications (
        type, title, message, for_admin, for_dealer, dealer_id, user_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        testNotification.type,
        testNotification.title,
        testNotification.message,
        testNotification.for_admin,
        testNotification.for_dealer,
        testNotification.dealer_id,
        testNotification.user_id,
        testNotification.metadata
      ]
    );

    console.log('✅ Test notification created successfully!');
    console.log(`📝 Notification ID: ${result.insertId}`);

    // Show all notifications
    console.log('\n📋 All notifications in database:');
    const [notifications] = await connection.execute(
      'SELECT id, type, title, for_admin, for_dealer, dealer_id, user_id, created_at FROM kriptocar.notifications ORDER BY created_at DESC'
    );
    
    if (notifications.length === 0) {
      console.log('  No notifications found');
    } else {
      notifications.forEach(notification => {
        console.log(`  - ID: ${notification.id}, Type: ${notification.type}, Title: ${notification.title}`);
        console.log(`    Admin: ${notification.for_admin}, Dealer: ${notification.for_dealer}, Dealer ID: ${notification.dealer_id || 'N/A'}`);
      });
    }

    // Test the createOrderNotifications function logic
    console.log('\n🔔 Testing order notification logic...');
    
    const orderData = {
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      total_amount: 149.99,
      order_status: 'Pending',
      payment_status: 'Pending'
    };

    const orderId = 'ORD000002';
    const dealerId = null; // Set to null for testing

    // Create admin notification
    const adminResult = await connection.execute(
      `INSERT INTO kriptocar.notifications (
        type, title, message, for_admin, for_dealer, dealer_id, user_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'order_placed', // Use correct ENUM value
        'New Order Received',
        `A new order #${orderId} has been placed by ${orderData.customer_name} for $${orderData.total_amount.toFixed(2)}.`,
        1, // for_admin
        0, // for_dealer
        null, // dealer_id
        null, // user_id - null for admin notifications
        JSON.stringify({
          order_id: orderId,
          customer_name: orderData.customer_name,
          total_amount: orderData.total_amount,
          order_status: orderData.order_status,
          payment_status: orderData.payment_status
        })
      ]
    );

    console.log('✅ Admin notification created!');

    // Skip dealer notification for now since we don't have a valid dealer ID
    console.log('ℹ️ Skipping dealer notification (no valid dealer ID for testing)');

    console.log('\n✅ All notification tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing notifications:', error);
    console.error('Error details:', error.message);
    if (error.sql) {
      console.error('SQL Error:', error.sql);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testNotifications().catch(console.error);
