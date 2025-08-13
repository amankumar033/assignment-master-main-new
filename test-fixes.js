const mysql = require('mysql2/promise');

async function testFixes() {
  let connection;
  
  try {
    console.log('🧪 Testing database fixes...');
    
    // Try to connect to database
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kriptocar'
    });

    console.log('✅ Connected to database successfully!');

    // Test 1: Check if vendors table has correct structure
    console.log('\n📋 Test 1: Checking vendors table structure...');
    try {
      const [vendors] = await connection.execute('SELECT vendor_id, vendor_name, contact_email, contact_phone, business_address FROM vendors LIMIT 1');
      console.log('✅ Vendors table query successful');
      console.log('Sample vendor:', vendors[0]);
    } catch (error) {
      console.log('❌ Vendors table query failed:', error.message);
    }

    // Test 2: Check if dealers table has correct structure
    console.log('\n📋 Test 2: Checking dealers table structure...');
    try {
      const [dealers] = await connection.execute('SELECT dealer_id, business_name, email FROM dealers LIMIT 1');
      console.log('✅ Dealers table query successful');
      console.log('Sample dealer:', dealers[0]);
    } catch (error) {
      console.log('❌ Dealers table query failed:', error.message);
    }

    // Test 3: Test service orders query (the one that was failing)
    console.log('\n📋 Test 3: Testing service orders query...');
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

    // Test 4: Test products query with dealer join
    console.log('\n📋 Test 4: Testing products query with dealer join...');
    try {
      const [products] = await connection.execute(`
        SELECT 
          p.product_id,
          p.name,
          p.sale_price,
          p.dealer_id,
          d.business_name as dealer_name,
          d.email as dealer_email
        FROM products p
        LEFT JOIN dealers d ON p.dealer_id = d.dealer_id
        LIMIT 1
      `);
      console.log('✅ Products query successful');
      if (products.length > 0) {
        console.log('Sample product:', {
          product_id: products[0].product_id,
          name: products[0].name,
          dealer_name: products[0].dealer_name,
          dealer_email: products[0].dealer_email
        });
      }
    } catch (error) {
      console.log('❌ Products query failed:', error.message);
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

testFixes();
