const mysql = require('mysql2/promise');

async function testProductsQuery() {
  console.log('🔍 Testing Products Query...');
  
  try {
    // Create connection using environment variables
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connection successful!');

    // Test the exact query from the products API
    const sqlQuery = `
      SELECT 
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.sale_price,
        p.original_price,
        p.rating,
        p.image_1,
        p.category_id,
        p.brand_name,
        p.sub_brand_name,
        p.stock_quantity,
        p.is_active,
        p.is_featured,
        p.is_hot_deal,
        p.created_at,
        p.updated_at,
        p.dealer_id,
        COALESCE(c.name, CONCAT('Category ', p.category_id)) as category_name,
        c.slug as category_slug,
        sc.slug as subcategory_slug
      FROM kriptocar.products p
      LEFT JOIN kriptocar.categories c ON p.category_id = c.category_id
      LEFT JOIN kriptocar.sub_categories sc ON p.sub_category_id = sc.sub_category_id
      WHERE 1=1
      ORDER BY 
        CASE 
          WHEN p.is_active = 1 AND p.stock_quantity > 0 THEN 0 
          WHEN p.is_active = 1 AND (p.stock_quantity IS NULL OR p.stock_quantity <= 0) THEN 1 
          ELSE 2 
        END ASC,
        p.rating DESC,
        p.created_at DESC
      LIMIT 10
    `;

    console.log('📋 Executing products query...');
    const [rows] = await connection.execute(sqlQuery);
    
    console.log(`✅ Query successful! Found ${rows.length} products`);
    
    if (rows.length > 0) {
      console.log('📦 Sample products:');
      rows.slice(0, 3).forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name} - $${product.sale_price} - Category: ${product.category_name}`);
      });
    }

    await connection.end();
    console.log('✅ Products query test completed successfully!');

  } catch (error) {
    console.error('❌ Products query test failed:', error.message);
    console.error('Full error:', error);
  }
}

testProductsQuery();
