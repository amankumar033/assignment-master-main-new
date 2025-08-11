require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testOrderIdFix() {
  let connection;
  
  try {
    console.log('🔧 Testing and fixing order ID generation...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    console.log('✅ Database connection established\n');

    // Step 1: Check current order IDs
    console.log('📋 Current order IDs:');
    const [currentOrders] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" ORDER BY order_id'
    );
    
    if (currentOrders.length === 0) {
      console.log('   No orders found');
    } else {
      currentOrders.forEach(order => {
        console.log(`   - ${order.order_id}`);
      });
    }

    // Step 2: Fix ORD2 to ORD000002 if it exists
    const [updateResult] = await connection.execute(
      'UPDATE kriptocar.orders SET order_id = ? WHERE order_id = ?',
      ['ORD000002', 'ORD2']
    );
    
    if (updateResult.affectedRows > 0) {
      console.log(`\n🔧 Fixed ${updateResult.affectedRows} inconsistent order ID(s)`);
    }

    // Step 3: Test order ID generation
    console.log('\n🧪 Testing order ID generation...');
    
    // Get all order IDs and find the maximum number
    const [allOrders] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%"'
    );
    
    let maxNumber = 0;
    for (const order of allOrders) {
      const orderId = order.order_id;
      const numericPart = orderId.substring(3);
      const number = parseInt(numericPart);
      
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }

    const nextNumber = maxNumber + 1;
    const nextOrderId = `ORD${nextNumber.toString().padStart(6, '0')}`;
    
    console.log(`   Current maximum number: ${maxNumber}`);
    console.log(`   Next order ID will be: ${nextOrderId}`);

    // Step 4: Show final state
    console.log('\n📋 Final order IDs:');
    const [finalOrders] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" ORDER BY order_id'
    );
    
    finalOrders.forEach(order => {
      console.log(`   - ${order.order_id}`);
    });

    console.log('\n✅ Order ID test and fix completed successfully!');
    console.log(`🔮 Next order ID: ${nextOrderId}`);

  } catch (error) {
    console.error('❌ Error testing order ID generation:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testOrderIdFix();
