// Test script to verify orders API returns product details
require('dotenv').config();

const mysql = require('mysql2/promise');

async function testOrdersWithProducts() {
  console.log('=== Testing Orders with Product Details ===');
  
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('✅ Database connection successful');

    // Test the exact query that the orders API uses
    const [ordersResult] = await connection.execute(
      `SELECT 
        o.*,
        p.name as product_name,
        p.sale_price as product_price,
        p.image_1 as product_image,
        p.description as product_description
      FROM kriptocar.orders o
      LEFT JOIN kriptocar.products p ON o.product_id = p.product_id
      WHERE o.user_id = 'USR001' 
      ORDER BY o.order_date DESC
      LIMIT 3`
    );

    console.log(`✅ Found ${ordersResult.length} orders for USR001`);
    
    if (ordersResult.length > 0) {
      console.log('\n=== Sample Order with Product Details ===');
      const sampleOrder = ordersResult[0];
      console.log('Order ID:', sampleOrder.order_id);
      console.log('Product ID:', sampleOrder.product_id);
      console.log('Product Name:', sampleOrder.product_name);
      console.log('Product Price:', sampleOrder.product_price);
      console.log('Product Image:', sampleOrder.product_image);
      console.log('Quantity:', sampleOrder.qauntity);
      console.log('Total Amount:', sampleOrder.total_amount);
      console.log('Order Date:', sampleOrder.order_date);
    } else {
      console.log('No orders found for USR001');
    }

    // Test products table to make sure it has the right structure
    const [productsResult] = await connection.execute(
      'SELECT product_id, name, sale_price, image_1 FROM products LIMIT 3'
    );
    
    console.log(`\n✅ Found ${productsResult.length} products`);
    if (productsResult.length > 0) {
      console.log('Sample product:', productsResult[0]);
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testOrdersWithProducts();
