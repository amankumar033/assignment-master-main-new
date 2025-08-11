require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkOrders() {
  let connection;
  
  try {
    console.log('🔍 Checking Orders in Database...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    console.log('✅ Database connection established\n');

    // Check if orders table exists
    console.log('📋 Checking orders table...');
    const [tables] = await connection.execute(
      'SHOW TABLES LIKE "orders"'
    );
    
    if (tables.length === 0) {
      console.log('❌ Orders table does not exist!');
      return;
    }
    
    console.log('✅ Orders table exists');

    // Check total number of orders
    const [countResult] = await connection.execute(
      'SELECT COUNT(*) as total FROM kriptocar.orders'
    );
    
    console.log(`📊 Total orders in database: ${countResult[0].total}`);

    // Get all orders
    const [orders] = await connection.execute(
      'SELECT order_id, customer_name, customer_email, order_date, order_status FROM kriptocar.orders ORDER BY order_date DESC LIMIT 10'
    );
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      console.log('\n🔧 This means:');
      console.log('   - No orders have been placed yet');
      console.log('   - Or orders were deleted');
      console.log('   - Or there\'s a database issue');
    } else {
      console.log('\n📋 Recent Orders:');
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.order_id} - ${order.customer_name} (${order.customer_email}) - ${order.order_status}`);
      });
    }

    // Check users table for cart items
    console.log('\n📋 Checking users with cart items...');
    const [usersWithCart] = await connection.execute(
      'SELECT user_id, cart_items FROM kriptocar.users WHERE cart_items IS NOT NULL AND cart_items != "null" AND cart_items != "" LIMIT 5'
    );
    
    if (usersWithCart.length === 0) {
      console.log('   No users with cart items found');
    } else {
      console.log(`   Found ${usersWithCart.length} users with cart items`);
      usersWithCart.forEach(user => {
        console.log(`   User ${user.user_id}: ${user.cart_items}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking orders:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the check
checkOrders();
