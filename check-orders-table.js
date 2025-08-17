require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function checkOrdersTable() {
  let connection;
  
  try {
    console.log('🔍 Checking orders table structure...');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    // Check table structure
    const [columns] = await connection.execute('DESCRIBE kriptocar.orders');
    console.log('📋 Orders table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type})`);
    });

    // Check if quantity column exists
    const quantityColumn = columns.find(col => col.Field === 'quantity');
    if (quantityColumn) {
      console.log('✅ Quantity column exists');
    } else {
      console.log('❌ Quantity column does not exist');
      
      // Check for similar columns
      const similarColumns = columns.filter(col => 
        col.Field.toLowerCase().includes('qty') || 
        col.Field.toLowerCase().includes('amount') ||
        col.Field.toLowerCase().includes('count')
      );
      console.log('🔍 Similar columns found:', similarColumns.map(col => col.Field));
    }

    // Check recent orders
    const [recentOrders] = await connection.execute(
      'SELECT order_id, customer_name, customer_email FROM kriptocar.orders ORDER BY order_date DESC LIMIT 3'
    );
    console.log('📦 Recent orders:', recentOrders);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

checkOrdersTable();
