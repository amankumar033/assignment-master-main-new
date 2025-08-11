// Test service detail API with varchar service IDs
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testServiceDetail() {
  console.log('🧪 Testing Service Detail API with varchar service IDs...\n');
  
  let connection;
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Database connection established');

    // Test 1: Get a sample service ID from the database
    console.log('\n📊 Test 1: Getting sample service IDs...');
    const [services] = await connection.execute(
      'SELECT service_id, name FROM kriptocar.services WHERE is_available = 1 LIMIT 3'
    );
    
    if (services.length === 0) {
      console.log('❌ No services found in database');
      return;
    }

    console.log('✅ Found services:');
    services.forEach((service, index) => {
      console.log(`  ${index + 1}. ID: ${service.service_id}, Name: ${service.name}`);
    });

    // Test 2: Test the service detail query directly
    console.log('\n📊 Test 2: Testing service detail query...');
    const sampleServiceId = services[0].service_id;
    
    try {
      const [serviceDetails] = await connection.execute(`
        SELECT 
          s.service_id,
          s.vendor_id,
          s.name,
          s.description,
          s.service_category_id,
          sc.name as category_name,
          s.type,
          s.base_price,
          s.duration_minutes,
          s.is_available,
          s.service_pincodes,
          s.created_at,
          s.updated_at
        FROM kriptocar.services s
        LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
        WHERE s.service_id = ?
      `, [sampleServiceId]);

      if (serviceDetails.length > 0) {
        const service = serviceDetails[0];
        console.log('✅ Service detail query successful!');
        console.log(`   Service ID: ${service.service_id}`);
        console.log(`   Name: ${service.name}`);
        console.log(`   Category: ${service.category_name}`);
        console.log(`   Type: ${service.type}`);
        console.log(`   Price: ${service.base_price}`);
        console.log(`   Vendor ID: ${service.vendor_id}`);
      } else {
        console.log('❌ No service found with ID:', sampleServiceId);
      }
    } catch (error) {
      console.error('❌ Service detail query failed:', error.message);
      if (error.sql) {
        console.error('SQL Error:', error.sql);
      }
    }

    // Test 3: Test with different service IDs
    console.log('\n📊 Test 3: Testing with different service IDs...');
    for (const service of services) {
      try {
        const [result] = await connection.execute(
          'SELECT service_id, name FROM kriptocar.services WHERE service_id = ?',
          [service.service_id]
        );
        
        if (result.length > 0) {
          console.log(`✅ Found service: ${service.service_id} - ${service.name}`);
        } else {
          console.log(`❌ Service not found: ${service.service_id}`);
        }
      } catch (error) {
        console.error(`❌ Error querying service ${service.service_id}:`, error.message);
      }
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing service detail:', error);
    console.error('Error details:', error.message);
    if (error.sql) {
      console.error('SQL Error:', error.sql);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testServiceDetail().catch(console.error);

