require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');

async function testStockReduction() {
  console.log('🧪 Testing Stock Reduction...');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('✅ Connected to database');

    // Get a sample product to test with
    const [products] = await connection.execute(
      'SELECT product_id, name, stock_quantity FROM kriptocar.products WHERE stock_quantity > 0 LIMIT 1'
    );

    if (products.length === 0) {
      console.log('❌ No products with stock available for testing');
      return;
    }

    const testProduct = products[0];
    console.log(`📦 Testing with product: ${testProduct.name} (ID: ${testProduct.product_id})`);
    console.log(`📦 Current stock: ${testProduct.stock_quantity}`);

    // Simulate stock reduction (like in checkout)
    const quantityToReduce = 1;
    const newQuantity = Math.max(0, testProduct.stock_quantity - quantityToReduce);

    console.log(`📦 Reducing stock by ${quantityToReduce}...`);
    
    await connection.execute(
      'UPDATE kriptocar.products SET stock_quantity = ? WHERE product_id = ?',
      [newQuantity, testProduct.product_id]
    );

    console.log(`✅ Stock reduced: ${testProduct.stock_quantity} → ${newQuantity}`);

    // Verify the update
    const [updatedProducts] = await connection.execute(
      'SELECT stock_quantity FROM kriptocar.products WHERE product_id = ?',
      [testProduct.product_id]
    );

    const updatedProduct = updatedProducts[0];
    console.log(`✅ Verified stock: ${updatedProduct.stock_quantity}`);

    // Restore the original stock (like in order cancellation)
    console.log(`📦 Restoring original stock...`);
    
    await connection.execute(
      'UPDATE kriptocar.products SET stock_quantity = ? WHERE product_id = ?',
      [testProduct.stock_quantity, testProduct.product_id]
    );

    console.log(`✅ Stock restored: ${newQuantity} → ${testProduct.stock_quantity}`);

    console.log('✅ Stock reduction test completed successfully!');

  } catch (error) {
    console.error('❌ Error testing stock reduction:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testStockReduction();
