const mysql = require('mysql2/promise');

// Test configuration
const testConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kriptocar'
};

async function testNewIdGeneration() {
  let connection;
  
  try {
    console.log('🧪 Testing new user-based ID generation logic...\n');
    
    connection = await mysql.createConnection(testConfig);
    
    // Test 1: Check existing orders for user USR12
    console.log('📊 Test 1: Checking existing orders for USR12');
    const [existingOrders] = await connection.execute(
      'SELECT order_id FROM orders WHERE user_id = "USR12" ORDER BY order_id'
    );
    
    console.log('Existing orders for USR12:');
    existingOrders.forEach(order => {
      console.log(`  - ${order.order_id}`);
    });
    
    // Test 2: Check existing service orders for user USR12
    console.log('\n📊 Test 2: Checking existing service orders for USR12');
    const [existingServiceOrders] = await connection.execute(
      'SELECT service_order_id FROM service_orders WHERE user_id = "USR12" ORDER BY service_order_id'
    );
    
    console.log('Existing service orders for USR12:');
    existingServiceOrders.forEach(order => {
      console.log(`  - ${order.service_order_id}`);
    });
    
    // Test 3: Simulate ID generation logic
    console.log('\n🧮 Test 3: Simulating new ID generation logic');
    
    // Extract user number from USR12
    const userNumber = 'USR12'.replace(/\D/g, '');
    console.log(`User number extracted: ${userNumber}`);
    
    // Find next order number
    const userOrderIds = existingOrders
      .map(row => row.order_id)
      .filter(id => id.startsWith(`ORD${userNumber}`))
      .map(id => {
        const match = id.match(new RegExp(`ORD${userNumber}(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      });
    
    const nextOrderNumber = userOrderIds.length > 0 ? Math.max(...userOrderIds) + 1 : 1;
    console.log(`Next order number for USR12: ${nextOrderNumber}`);
    
    // Generate 3 order IDs for USR12
    console.log('\nGenerated order IDs for USR12:');
    for (let i = 0; i < 3; i++) {
      const orderId = `ORD${userNumber}${nextOrderNumber + i}`;
      console.log(`  - ${orderId}`);
    }
    
    // Find next service order number
    const userServiceOrderIds = existingServiceOrders
      .map(row => row.service_order_id)
      .filter(id => id.startsWith(`SRV${userNumber}`))
      .map(id => {
        const match = id.match(new RegExp(`SRV${userNumber}(\\d+)`));
        return match ? parseInt(match[1]) : 0;
      });
    
    const nextServiceOrderNumber = userServiceOrderIds.length > 0 ? Math.max(...userServiceOrderIds) + 1 : 1;
    console.log(`\nNext service order number for USR12: ${nextServiceOrderNumber}`);
    
    // Generate 3 service order IDs for USR12
    console.log('\nGenerated service order IDs for USR12:');
    for (let i = 0; i < 3; i++) {
      const serviceOrderId = `SRV${userNumber}${nextServiceOrderNumber + i}`;
      console.log(`  - ${serviceOrderId}`);
    }
    
    // Test 4: Check for any duplicate IDs
    console.log('\n🔍 Test 4: Checking for duplicate IDs');
    
    const [allOrderIds] = await connection.execute(
      'SELECT order_id, COUNT(*) as count FROM orders GROUP BY order_id HAVING COUNT(*) > 1'
    );
    
    if (allOrderIds.length > 0) {
      console.log('❌ Duplicate order IDs found:');
      allOrderIds.forEach(duplicate => {
        console.log(`  - ${duplicate.order_id} (${duplicate.count} times)`);
      });
    } else {
      console.log('✅ No duplicate order IDs found');
    }
    
    const [allServiceOrderIds] = await connection.execute(
      'SELECT service_order_id, COUNT(*) as count FROM service_orders GROUP BY service_order_id HAVING COUNT(*) > 1'
    );
    
    if (allServiceOrderIds.length > 0) {
      console.log('❌ Duplicate service order IDs found:');
      allServiceOrderIds.forEach(duplicate => {
        console.log(`  - ${duplicate.service_order_id} (${duplicate.count} times)`);
      });
    } else {
      console.log('✅ No duplicate service order IDs found');
    }
    
    console.log('\n✅ ID generation logic test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testNewIdGeneration();

