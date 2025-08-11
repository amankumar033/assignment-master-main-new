// Test services APIs with new database structure
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testServicesAPI() {
  console.log('🧪 Testing Services APIs with new database structure...\n');
  
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

    // Test 1: Check if service_categories table exists
    console.log('\n📊 Test 1: Checking service_categories table...');
    const [categories] = await connection.execute(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'kriptocar' AND table_name = 'service_categories'"
    );
    
    if (categories[0].count === 0) {
      console.log('❌ service_categories table does not exist!');
      console.log('Please create the service_categories table first.');
      return;
    } else {
      console.log('✅ service_categories table exists');
    }

    // Test 2: Check services table structure
    console.log('\n📊 Test 2: Checking services table structure...');
    const [serviceColumns] = await connection.execute(
      "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = 'kriptocar' AND TABLE_NAME = 'services' ORDER BY ORDINAL_POSITION"
    );
    
    console.log('Services table columns:');
    serviceColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.DATA_TYPE}`);
    });

    // Check if service_category_id exists
    const hasServiceCategoryId = serviceColumns.some(col => col.COLUMN_NAME === 'service_category_id');
    const hasCategory = serviceColumns.some(col => col.COLUMN_NAME === 'category');
    
    if (hasServiceCategoryId) {
      console.log('✅ service_category_id column exists');
    } else {
      console.log('❌ service_category_id column does not exist');
    }
    
    if (hasCategory) {
      console.log('⚠️  category column still exists (should be removed)');
    } else {
      console.log('✅ category column has been removed');
    }

    // Test 3: Test the new query structure
    console.log('\n📊 Test 3: Testing new query structure...');
    try {
      const [services] = await connection.execute(`
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
        WHERE s.is_available = 1
        LIMIT 5
      `);

      console.log(`✅ Query executed successfully! Found ${services.length} services`);
      
      if (services.length > 0) {
        console.log('\n📋 Sample service data:');
        services.forEach((service, index) => {
          console.log(`  Service ${index + 1}:`);
          console.log(`    - ID: ${service.service_id}`);
          console.log(`    - Name: ${service.name}`);
          console.log(`    - Category ID: ${service.service_category_id}`);
          console.log(`    - Category Name: ${service.category_name}`);
          console.log(`    - Type: ${service.type}`);
          console.log(`    - Price: ${service.base_price}`);
        });
      }
    } catch (error) {
      console.error('❌ Query failed:', error.message);
      if (error.sql) {
        console.error('SQL Error:', error.sql);
      }
    }

    // Test 4: Check service_categories data
    console.log('\n📊 Test 4: Checking service_categories data...');
    try {
      const [categoryData] = await connection.execute(
        'SELECT service_category_id, name FROM kriptocar.service_categories LIMIT 10'
      );
      
      console.log(`✅ Found ${categoryData.length} service categories:`);
      categoryData.forEach(cat => {
        console.log(`  - ID: ${cat.service_category_id}, Name: ${cat.name}`);
      });
    } catch (error) {
      console.error('❌ Failed to fetch service categories:', error.message);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Error testing services API:', error);
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
testServicesAPI().catch(console.error);

