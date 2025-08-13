const mysql = require('mysql2/promise');

async function testCurrentDB() {
  let connection;
  
  try {
    console.log('🔍 Testing current database connection...');
    
    // Try to connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('✅ Connected to database successfully!');

    // Test the service orders query that was failing
    console.log('\n📋 Testing service orders query...');
    try {
      const [serviceOrders] = await connection.execute(`
        SELECT 
          so.*,
          v.vendor_name,
          v.contact_email as vendor_email,
          v.contact_phone as vendor_phone,
          v.business_address as vendor_address
        FROM service_orders so
        LEFT JOIN vendors v ON so.vendor_id = v.vendor_id
        LIMIT 1
      `);
      console.log('✅ Service orders query successful');
      if (serviceOrders.length > 0) {
        console.log('Sample service order:', {
          service_order_id: serviceOrders[0].service_order_id,
          vendor_name: serviceOrders[0].vendor_name,
          vendor_email: serviceOrders[0].vendor_email
        });
      }
    } catch (error) {
      console.log('❌ Service orders query failed:', error.message);
    }

    // Test vendors table structure
    console.log('\n📋 Testing vendors table structure...');
    try {
      const [vendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email, contact_phone, business_address FROM vendors LIMIT 1');
      console.log('✅ Vendors table query successful');
      console.log('Sample vendor:', vendors[0]);
    } catch (error) {
      console.log('❌ Vendors table query failed:', error.message);
    }

    console.log('\n🎉 All tests completed!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 To fix database connection issues:');
    console.log('1. Make sure MySQL is running');
    console.log('2. Check if the database "kriptocar" exists');
    console.log('3. Verify username/password are correct');
    console.log('4. Make sure the required tables exist');
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

testCurrentDB();
