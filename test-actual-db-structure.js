const mysql = require('mysql2/promise');

async function testActualDatabaseStructure() {
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

    // 2. Check dealers table structure
    console.log('\n📋 Checking dealers table structure...');
    try {
      const [structure] = await connection.execute('DESCRIBE dealers');
      console.table(structure);
    } catch (error) {
      console.log('❌ Error checking dealers table structure:', error.message);
    }

    // 3. Test the service orders query with actual column names
    console.log('\n🧪 Testing service orders query with actual column names...');
    try {
      const [serviceOrders] = await connection.execute(`
        SELECT 
          so.*,
          v.vendor_name,
          v.contact_email as vendor_email,
          v.contact_phone as vendor_phone,
          v.business_address as vendor_address
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

    // 4. Test the products query with actual dealer column names
    console.log('\n🧪 Testing products query with actual dealer column names...');
    try {
      const [products] = await connection.execute(`
        SELECT 
          p.product_id,
          p.name,
          p.sale_price,
          p.dealer_id,
          p.image_1,
          d.business_name as dealer_name,
          d.email as dealer_email
        FROM kriptocar.products p
        LEFT JOIN kriptocar.dealers d ON p.dealer_id = d.dealer_id
        LIMIT 5
      `);
      console.log('✅ Products query successful');
      console.log('Found products:', products.length);
      if (products.length > 0) {
        console.table(products.map(p => ({
          product_id: p.product_id,
          name: p.name,
          dealer_id: p.dealer_id,
          dealer_name: p.dealer_name,
          dealer_email: p.dealer_email
        })));
      }
    } catch (error) {
      console.log('❌ Error testing products query:', error.message);
    }

    // 5. Test dealer lookup query
    console.log('\n🧪 Testing dealer lookup query...');
    try {
      const [dealers] = await connection.execute(`
        SELECT dealer_id, business_name, email FROM kriptocar.dealers LIMIT 3
      `);
      console.log('✅ Dealer lookup query successful');
      console.table(dealers);
    } catch (error) {
      console.log('❌ Error testing dealer lookup query:', error.message);
    }

    // 6. Test vendor lookup query
    console.log('\n🧪 Testing vendor lookup query...');
    try {
      const [vendors] = await connection.execute(`
        SELECT vendor_id, vendor_name, contact_email FROM kriptocar.vendors LIMIT 3
      `);
      console.log('✅ Vendor lookup query successful');
      console.table(vendors);
    } catch (error) {
      console.log('❌ Error testing vendor lookup query:', error.message);
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

testActualDatabaseStructure();
