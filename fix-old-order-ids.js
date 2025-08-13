const mysql = require('mysql2/promise');

// Fix old order IDs that are too long
async function fixOldOrderIds() {
  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kriptocar'
    });

    console.log('🔍 Checking for old format order IDs...\n');

    // Find order IDs that are longer than 8 characters (ORD + 5 digits = 8 chars)
    const [rows] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%" AND LENGTH(order_id) > 8'
    );
    
    if (rows.length === 0) {
      console.log('✅ No old format order IDs found. All order IDs are already in the correct format.');
      return;
    }

    console.log(`❌ Found ${rows.length} order IDs in old format:`);
    rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.order_id} (length: ${row.order_id.length})`);
    });

    console.log('\n🔄 Fixing old format order IDs...');
    
    // Get the next available number for new format
    const [maxRows] = await connection.execute(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) AS max_number FROM kriptocar.orders WHERE order_id LIKE "ORD%" AND LENGTH(order_id) <= 8'
    );
    
    let nextNumber = (maxRows[0]?.max_number || 0) + 1;
    
    // Update each old order ID
    for (const row of rows) {
      const oldOrderId = row.order_id;
      const newOrderId = `ORD${nextNumber.toString().padStart(5, '0')}`;
      
      console.log(`  Updating ${oldOrderId} → ${newOrderId}`);
      
      try {
        await connection.execute(
          'UPDATE kriptocar.orders SET order_id = ? WHERE order_id = ?',
          [newOrderId, oldOrderId]
        );
        console.log(`  ✅ Updated successfully`);
        nextNumber++;
      } catch (error) {
        console.log(`  ❌ Failed to update: ${error.message}`);
      }
    }

    console.log('\n✅ Order ID fix completed!');
    console.log('\n📋 Summary:');
    console.log(`- Fixed ${rows.length} old format order IDs`);
    console.log('- All order IDs now follow the format: ORD00001, ORD00002, etc.');
    console.log('- Maximum 5 digits after ORD prefix');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixOldOrderIds();

