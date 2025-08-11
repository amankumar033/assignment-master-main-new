// Test service order notifications
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testServiceOrderNotifications() {
  console.log('🧪 Testing Service Order Notifications...\n');

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
      return;
    } else {
      console.log('✅ Notifications table exists');
    }

    // Test creating service order notifications
    console.log('\n🔔 Testing service order notification creation...');

    const serviceOrderData = {
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      service_name: 'Car Wash Service',
      service_category: 'Cleaning',
      service_type: 'Premium',
      final_price: 299.99,
      service_date: '2024-12-25',
      service_time: '10:00:00',
      service_status: 'Scheduled',
      payment_status: 'Pending',
      service_address: '123 Main Street, City',
      service_pincode: '123456',
      additional_notes: 'Please be careful with the paint'
    };

    const serviceOrderId = 'SRVD000001';
    const vendorId = null; // Set to null for testing

    // Create admin notification for service order
    const adminResult = await connection.execute(
      `INSERT INTO kriptocar.notifications (
        type, title, message, for_admin, for_dealer, for_vendor, dealer_id, vendor_id, user_id, metadata, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        'service_created', // Use correct ENUM value
        'New Service Order Created',
        `A new service order #${serviceOrderId} has been created by ${serviceOrderData.customer_name} for ${serviceOrderData.service_name} at $${serviceOrderData.final_price.toFixed(2)}.`,
        1, // for_admin
        0, // for_dealer
        0, // for_vendor
        null, // dealer_id
        null, // vendor_id
        null, // user_id
        JSON.stringify({
          service_order_id: serviceOrderId,
          customer_name: serviceOrderData.customer_name,
          service_name: serviceOrderData.service_name,
          final_price: serviceOrderData.final_price,
          service_date: serviceOrderData.service_date,
          service_time: serviceOrderData.service_time
        })
      ]
    );

    console.log('✅ Admin notification for service order created!');

    // Show all service-related notifications
    console.log('\n📋 All service-related notifications in database:');
    const [notifications] = await connection.execute(
      'SELECT id, type, title, for_admin, for_dealer, for_vendor, dealer_id, vendor_id, created_at FROM kriptocar.notifications WHERE type = "service_created" ORDER BY created_at DESC'
    );

    if (notifications.length === 0) {
      console.log('  No service notifications found');
    } else {
      notifications.forEach(notification => {
        console.log(`  - ID: ${notification.id}, Type: ${notification.type}, Title: ${notification.title}`);
        console.log(`    Admin: ${notification.for_admin}, Dealer: ${notification.for_dealer}, Vendor: ${notification.for_vendor}`);
        console.log(`    Dealer ID: ${notification.dealer_id || 'N/A'}, Vendor ID: ${notification.vendor_id || 'N/A'}`);
      });
    }

    console.log('\n✅ Service order notification tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing service order notifications:', error);
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
testServiceOrderNotifications().catch(console.error);
