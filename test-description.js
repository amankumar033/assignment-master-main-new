const mysql = require('mysql2/promise');

async function testDescriptionData() {
  console.log('🔍 Testing Description Data from Database\n');

  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '82.29.162.35',
      user: process.env.DB_USER || 'kriptocar',
      password: process.env.DB_PASSWORD || 'kriptocar',
      database: process.env.DB_NAME || 'kriptocar',
      charset: 'utf8mb4'
    });

    console.log('✅ Database connection successful');

    // Test 1: Get sample products with descriptions
    console.log('\n1. Fetching products with descriptions...');
    const [products] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description IS NOT NULL AND description != '' 
      LIMIT 5
    `);
    
    console.log(`📊 Found ${products.length} products with descriptions`);
    
    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1} ---`);
      console.log(`ID: ${product.product_id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Description Length: ${product.description.length}`);
      console.log(`Description Preview: ${product.description.substring(0, 200)}...`);
      
      // Check if description contains HTML
      const hasHtml = /<[^>]*>/.test(product.description);
      console.log(`Contains HTML: ${hasHtml ? 'YES' : 'NO'}`);
      
      if (hasHtml) {
        console.log('HTML Tags found:', product.description.match(/<[^>]*>/g));
      }
    });

    // Test 2: Insert a test product with HTML description
    console.log('\n2. Testing HTML description insertion...');
    const testHtmlDescription = `
      <h2>Test Product Features</h2>
      <p>This is a <strong>test product</strong> with <em>HTML formatting</em>:</p>
      <ul>
        <li>Feature 1: <span style="color: red;">Red text</span></li>
        <li>Feature 2: <strong>Bold text</strong></li>
        <li>Feature 3: <em>Italic text</em></li>
      </ul>
      <blockquote>This is a blockquote with special formatting</blockquote>
      <p>For more info, visit our <a href="#" style="color: blue;">website</a>.</p>
    `;

    const [insertResult] = await connection.execute(`
      INSERT INTO products (name, description, sale_price, original_price, rating, image, category_id, brand, stock_quantity, is_active, is_featured, is_hot_deal, dealer_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      'Test HTML Product',
      testHtmlDescription,
      99.99,
      129.99,
      4.5,
      '/test-image.png',
      1,
      'Test Brand',
      10,
      1,
      0,
      0,
      1
    ]);

    console.log('✅ Test product inserted with ID:', insertResult.insertId);

    // Test 3: Retrieve the test product
    console.log('\n3. Retrieving test product...');
    const [testProduct] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE product_id = ?
    `, [insertResult.insertId]);

    if (testProduct.length > 0) {
      const product = testProduct[0];
      console.log('✅ Test product retrieved successfully');
      console.log(`ID: ${product.product_id}`);
      console.log(`Name: ${product.name}`);
      console.log(`Description Length: ${product.description.length}`);
      console.log(`Description Content:`);
      console.log(product.description);
      
      // Check if HTML was preserved
      const hasHtml = /<[^>]*>/.test(product.description);
      console.log(`\nHTML preserved: ${hasHtml ? 'YES' : 'NO'}`);
    }

    // Clean up: Delete test product
    console.log('\n4. Cleaning up test data...');
    await connection.execute('DELETE FROM products WHERE name = ?', ['Test HTML Product']);
    console.log('✅ Test product deleted');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the test
testDescriptionData();