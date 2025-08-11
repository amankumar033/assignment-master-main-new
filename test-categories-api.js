const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testCategoriesAPI() {
  let connection;
  
  try {
    console.log('🔍 Testing Categories API...\n');

    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log('✅ Database connection established\n');

    // Test 1: Check categories table structure
    console.log('📋 Testing categories table structure...');
    const [columns] = await connection.execute(`
      DESCRIBE kriptocar.categories
    `);
    
    console.log('Categories table columns:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'}`);
    });
    console.log('');

    // Test 2: Check if image column exists
    const imageColumn = columns.find(col => col.Field === 'image');
    if (imageColumn) {
      console.log('✅ Image column found:', imageColumn.Type);
    } else {
      console.log('❌ Image column not found');
    }
    console.log('');

    // Test 3: Check if is_active column exists
    const activeColumn = columns.find(col => col.Field === 'is_active');
    if (activeColumn) {
      console.log('✅ is_active column found:', activeColumn.Type);
    } else {
      console.log('❌ is_active column not found');
    }
    console.log('');

    // Test 4: Check if is_featured column still exists
    const featuredColumn = columns.find(col => col.Field === 'is_featured');
    if (featuredColumn) {
      console.log('⚠️  is_featured column still exists (should be removed):', featuredColumn.Type);
    } else {
      console.log('✅ is_featured column removed (as expected)');
    }
    console.log('');

    // Test 5: Fetch active categories
    console.log('📊 Fetching active categories...');
    const [categories] = await connection.execute(`
      SELECT 
        category_id,
        name,
        slug,
        description,
        is_active,
        image,
        created_at,
        updated_at,
        dealer_id
      FROM kriptocar.categories
      WHERE is_active = 1
      ORDER BY name ASC
    `);

    console.log(`✅ Found ${categories.length} active categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat.category_id})`);
      console.log(`    Slug: ${cat.slug}`);
      console.log(`    Active: ${cat.is_active}`);
      console.log(`    Has Image: ${cat.image ? 'Yes' : 'No'}`);
      if (cat.image) {
        console.log(`    Image Size: ${cat.image.length} bytes`);
      }
      console.log('');
    });

    // Test 6: Test image endpoint for first category
    if (categories.length > 0) {
      const firstCategory = categories[0];
      console.log(`🖼️  Testing image endpoint for "${firstCategory.name}"...`);
      
      if (firstCategory.image) {
        console.log(`✅ Category has image data (${firstCategory.image.length} bytes)`);
        console.log('📡 Image endpoint would be: /api/categories/image/' + firstCategory.category_id);
      } else {
        console.log('⚠️  Category has no image data');
      }
    }

    console.log('\n🎉 Categories API test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing categories API:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testCategoriesAPI();

