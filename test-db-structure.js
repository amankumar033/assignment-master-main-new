const mysql = require('mysql2/promise');

async function testDatabaseStructure() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('🔍 Connected to database');

    // 1. Check vendors table structure
    console.log('\n📋 Checking vendors table structure...');
    try {
      const [structure] = await connection.execute('DESCRIBE vendors');
      console.table(structure);
    } catch (error) {
      console.log('❌ Error checking vendors table structure:', error.message);
    }

    // 2. Check if vendors table has the required columns
    console.log('\n🔍 Checking for required columns...');
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM vendors");
      const columnNames = columns.map(col => col.Field);
      console.log('Available columns:', columnNames);
      
      const requiredColumns = ['vendor_id', 'name', 'email', 'phone'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('❌ Missing columns:', missingColumns);
      } else {
        console.log('✅ All required columns exist');
      }
    } catch (error) {
      console.log('❌ Error checking columns:', error.message);
    }

    // 3. Check sample vendor data
    console.log('\n📋 Checking sample vendor data...');
    try {
      const [vendors] = await connection.execute('SELECT vendor_id, name, email, phone FROM vendors LIMIT 3');
      console.table(vendors);
    } catch (error) {
      console.log('❌ Error checking vendor data:', error.message);
    }

    // 4. Test the service orders query
    console.log('\n🧪 Testing service orders query...');
    try {
      const [serviceOrders] = await connection.execute(`
        SELECT 
          so.*,
          v.name as vendor_name,
          v.email as vendor_email,
          v.phone as vendor_phone
        FROM kriptocar.service_orders so
        LEFT JOIN kriptocar.vendors v ON so.vendor_id = v.vendor_id
        WHERE so.user_id = 'USR101'
        ORDER BY so.booking_date DESC
        LIMIT 5
      `);
      console.log('✅ Service orders query successful');
      console.log('Found service orders:', serviceOrders.length);
      if (serviceOrders.length > 0) {
        console.table(serviceOrders.map(so => ({
          service_order_id: so.service_order_id,
          user_id: so.user_id,
          vendor_id: so.vendor_id,
          vendor_name: so.vendor_name,
          vendor_email: so.vendor_email,
          service_name: so.service_name,
          service_status: so.service_status
        })));
      }
    } catch (error) {
      console.log('❌ Error testing service orders query:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testDatabaseStructure();
