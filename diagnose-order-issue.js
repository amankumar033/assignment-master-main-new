require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function diagnoseOrderIssue() {
  console.log('🔍 Diagnosing Order Not Found Issue...\n');
  
  let connection;
  
  try {
    // Test 1: Database Connection
    console.log('1. Testing Database Connection...');
    
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    };
    
    console.log('Database config:', { ...dbConfig, password: '***' });
    
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful\n');

    // Test 2: Check if orders table exists
    console.log('2. Checking Orders Table...');
    const [tables] = await connection.execute("SHOW TABLES LIKE 'orders'");
    
    if (tables.length === 0) {
      console.log('❌ Orders table does not exist!');
      console.log('💡 Solution: Run the database migration scripts');
      return;
    }
    console.log('✅ Orders table exists');

    // Test 3: Check orders table structure
    console.log('\n3. Checking Orders Table Structure...');
    const [columns] = await connection.execute("DESCRIBE kriptocar.orders");
    console.log('Orders table columns:');
    columns.forEach(col => {
      console.log(`   - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });

    // Test 4: Check for order_id column
    const hasOrderId = columns.some(col => col.Field === 'order_id');
    if (!hasOrderId) {
      console.log('\n❌ order_id column missing!');
      console.log('💡 Solution: Run migrate_order_ids.sql');
      return;
    }
    console.log('\n✅ order_id column exists');

    // Test 5: Check existing orders
    console.log('\n4. Checking Existing Orders...');
    const [orders] = await connection.execute(
      'SELECT order_id, user_id, customer_name, order_date FROM kriptocar.orders ORDER BY order_date DESC LIMIT 5'
    );
    
    if (orders.length === 0) {
      console.log('❌ No orders found in database');
      console.log('💡 This explains why orders show as "not found"');
    } else {
      console.log(`✅ Found ${orders.length} orders:`);
      orders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.order_id} - ${order.customer_name} (${order.user_id})`);
      });
    }

    // Test 6: Test order ID generation
    console.log('\n5. Testing Order ID Generation...');
    const [existingIds] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" ORDER BY order_id'
    );
    
    if (existingIds.length === 0) {
      console.log('No existing ORD format IDs found');
    } else {
      console.log(`Found ${existingIds.length} ORD format IDs:`);
      existingIds.slice(0, 5).forEach(id => console.log(`   - ${id.order_id}`));
    }

    // Test 7: Check for any recent orders
    console.log('\n6. Checking Recent Orders (Last 24 hours)...');
    const [recentOrders] = await connection.execute(
      'SELECT order_id, customer_name, order_date FROM kriptocar.orders WHERE order_date >= DATE_SUB(NOW(), INTERVAL 1 DAY) ORDER BY order_date DESC'
    );
    
    if (recentOrders.length === 0) {
      console.log('❌ No recent orders found');
    } else {
      console.log(`✅ Found ${recentOrders.length} recent orders:`);
      recentOrders.forEach(order => {
        console.log(`   - ${order.order_id} - ${order.customer_name} - ${order.order_date}`);
      });
    }

    // Test 8: Check users table
    console.log('\n7. Checking Users Table...');
    const [users] = await connection.execute(
      'SELECT user_id, cart_items FROM kriptocar.users WHERE cart_items IS NOT NULL AND cart_items != "null" AND cart_items != "" LIMIT 3'
    );
    
    if (users.length === 0) {
      console.log('❌ No users with cart items found');
    } else {
      console.log(`✅ Found ${users.length} users with cart items:`);
      users.forEach(user => {
        console.log(`   - User ${user.user_id}: ${user.cart_items}`);
      });
    }

    // Test 9: Check products table
    console.log('\n8. Checking Products Table...');
    const [products] = await connection.execute(
      'SELECT product_id, name FROM kriptocar.products LIMIT 3'
    );
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      console.log('💡 This would prevent orders from being created');
    } else {
      console.log(`✅ Found ${products.length} products:`);
      products.forEach(product => {
        console.log(`   - ${product.product_id}: ${product.name}`);
      });
    }

    // Summary and Recommendations
    console.log('\n📋 DIAGNOSIS SUMMARY:');
    console.log('=====================');
    
    if (orders.length === 0) {
      console.log('❌ PRIMARY ISSUE: No orders exist in database');
      console.log('💡 SOLUTIONS:');
      console.log('   1. Ensure database connection is working');
      console.log('   2. Place a test order through the application');
      console.log('   3. Check if checkout process is working');
    } else {
      console.log('✅ Orders exist in database');
      console.log('💡 If orders still show as "not found":');
      console.log('   1. Check the order_id format in URL');
      console.log('   2. Verify the order_id exists in database');
      console.log('   3. Check for case sensitivity issues');
    }

    console.log('\n🔧 RECOMMENDED ACTIONS:');
    console.log('1. Create a .env.local file with proper database config');
    console.log('2. Run database migration scripts if needed');
    console.log('3. Test order creation through the application');
    console.log('4. Check server logs for detailed error messages');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Database connection refused');
      console.log('   - Make sure MySQL is running');
      console.log('   - Check database credentials in .env.local');
      console.log('   - Verify database host and port');
    } else if (error.code === 'ER_ACCESS_DENIED') {
      console.log('\n💡 SOLUTION: Database access denied');
      console.log('   - Check username and password');
      console.log('   - Verify user has access to kriptocar database');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 SOLUTION: Database does not exist');
      console.log('   - Create the kriptocar database');
      console.log('   - Run database setup scripts');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the diagnosis
diagnoseOrderIssue();
