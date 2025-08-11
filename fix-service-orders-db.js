const mysql = require('mysql2/promise');

async function fixServiceOrders() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your password if needed
      database: 'kriptocar'
    });

    console.log('🔍 Connected to database');

    // First, let's see what service orders exist
    console.log('\n📋 Current service orders:');
    const [currentOrders] = await connection.execute(
      'SELECT service_order_id, user_id, service_name, booking_date FROM service_orders ORDER BY service_order_id'
    );
    console.table(currentOrders);

    // Check for duplicates
    console.log('\n🔍 Checking for duplicate service order IDs:');
    const [duplicates] = await connection.execute(
      'SELECT service_order_id, COUNT(*) as count FROM service_orders GROUP BY service_order_id HAVING COUNT(*) > 1'
    );
    console.table(duplicates);

    if (duplicates.length > 0) {
      console.log('\n⚠️ Found duplicates! Fixing...');
      
      // Create backup
      await connection.execute('CREATE TABLE IF NOT EXISTS service_orders_backup AS SELECT * FROM service_orders');
      console.log('✅ Backup created');

      // Delete all existing service orders to start fresh
      await connection.execute('DELETE FROM service_orders');
      console.log('✅ Cleared existing service orders');

      // Now the next service order will be SRV1
      console.log('✅ Database cleaned. Next service order will be SRV1');
    } else {
      console.log('✅ No duplicates found');
    }

    // Test the ID generation logic
    console.log('\n🧪 Testing ID generation:');
    const [testResult] = await connection.execute(
      'SELECT CONCAT("SRV", COALESCE(MAX(CAST(SUBSTRING(service_order_id, 4) AS UNSIGNED)), 0) + 1) as next_id FROM service_orders WHERE service_order_id LIKE "SRV%"'
    );
    console.log('Next ID will be:', testResult[0]?.next_id || 'SRV1');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the fix
fixServiceOrders().then(() => {
  console.log('\n🎉 Service orders database fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

