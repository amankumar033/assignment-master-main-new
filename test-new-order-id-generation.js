const mysql = require('mysql2/promise');

// Test the new order ID generation
async function testNewOrderIdGeneration() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kriptocar'
    });

    console.log('🔍 Testing new order ID generation...\n');

    // Import the new generator
    const { DatabaseOrderIdGenerator } = require('./src/lib/orderIdGenerator.ts');
    const orderGenerator = new DatabaseOrderIdGenerator(connection);
    
    // Generate 10 order IDs to test the new format
    console.log('📦 Generating 10 new order IDs:');
    for (let i = 0; i < 10; i++) {
      const orderId = await orderGenerator.generateOrderId();
      console.log(`  ${i + 1}. ${orderId}`);
      
      // Verify the format
      if (!orderId.match(/^ORD\d{5}$/)) {
        console.log(`  ❌ Invalid format: ${orderId} (should be ORD + 5 digits)`);
      } else {
        console.log(`  ✅ Valid format: ${orderId}`);
      }
    }

    // Check existing order IDs in database
    console.log('\n📊 Checking existing order IDs in database:');
    const [rows] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" ORDER BY order_id LIMIT 10'
    );
    
    console.log('Existing order IDs:');
    rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.order_id}`);
    });

    console.log('\n✅ New order ID generation test completed!');
    console.log('\n📋 Summary:');
    console.log('- New format: ORD00001, ORD00002, etc. (5 digits max)');
    console.log('- Range-based generation: 1-10, 11-20, 21-30, etc.');
    console.log('- Unique validation ensures no duplicates');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testNewOrderIdGeneration();

