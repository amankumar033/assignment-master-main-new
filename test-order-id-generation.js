// Test order ID generation
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testOrderIdGeneration() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    console.log('🔍 Checking current order IDs in database...\n');

    // Get all existing order IDs
    const [rows] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" ORDER BY CAST(SUBSTRING(order_id, 4) AS UNSIGNED)'
    );

    console.log('📋 Existing Order IDs:');
    if (rows.length === 0) {
      console.log('   No orders found in database');
    } else {
      rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.order_id}`);
      });
    }

    // Get the maximum order number
    const [maxRows] = await connection.execute(
      'SELECT MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)) as max_number FROM kriptocar.orders WHERE order_id LIKE "ORD%"'
    );

    const maxNumber = maxRows[0].max_number;
    const nextNumber = maxNumber ? maxNumber + 1 : 1;
    const nextOrderId = `ORD${nextNumber.toString().padStart(6, '0')}`;

    console.log('\n📊 Order ID Analysis:');
    console.log(`   Current maximum number: ${maxNumber || 'None'}`);
    console.log(`   Next number to use: ${nextNumber}`);
    console.log(`   Next order ID will be: ${nextOrderId}`);

    // Check for any gaps in the sequence
    if (rows.length > 0) {
      console.log('\n🔍 Checking for gaps in sequence...');
      const numbers = rows.map(row => parseInt(row.order_id.substring(3)));
      const sortedNumbers = numbers.sort((a, b) => a - b);
      
      let gaps = [];
      for (let i = 1; i < sortedNumbers.length; i++) {
        if (sortedNumbers[i] - sortedNumbers[i-1] > 1) {
          gaps.push(`${sortedNumbers[i-1] + 1} to ${sortedNumbers[i] - 1}`);
        }
      }
      
      if (gaps.length > 0) {
        console.log('   ⚠️  Found gaps in sequence:');
        gaps.forEach(gap => console.log(`      Gap: ${gap}`));
      } else {
        console.log('   ✅ No gaps found in sequence');
      }
    }

    console.log('\n✅ Order ID generation test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing order ID generation:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testOrderIdGeneration();

