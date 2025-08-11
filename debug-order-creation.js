require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function debugOrderCreation() {
  console.log('🔍 Debugging Order Creation Process...\n');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    console.log('✅ Database connection established');

    // Test 1: Check what dealers exist
    console.log('\n1. Checking existing dealers...');
    const [dealers] = await connection.execute(
      'SELECT dealer_id, name FROM kriptocar.dealers LIMIT 5'
    );
    
    if (dealers.length === 0) {
      console.log('❌ No dealers found in database');
      console.log('💡 This is why order creation is failing!');
      return;
    }
    
    console.log('✅ Found dealers:');
    dealers.forEach(dealer => {
      console.log(`   - ${dealer.dealer_id}: ${dealer.name}`);
    });

    // Test 2: Check what products exist and their dealer associations
    console.log('\n2. Checking products and their dealers...');
    const [products] = await connection.execute(
      'SELECT product_id, name, dealer_id FROM kriptocar.products LIMIT 5'
    );
    
    console.log('✅ Found products:');
    products.forEach(product => {
      console.log(`   - ${product.product_id}: ${product.name} (Dealer: ${product.dealer_id})`);
    });

    // Test 3: Test order ID generation manually
    console.log('\n3. Testing Order ID Generation...');
    
    // Get all order IDs and find the maximum number
    const [rows] = await connection.execute(
      'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE "ORD%"'
    );

    const result = rows;
    let maxNumber = 0;
    
    // Parse each order ID to find the maximum number
    for (const row of result) {
      const orderId = row.order_id;
      // Extract the numeric part after "ORD"
      const numericPart = orderId.substring(3);
      const number = parseInt(numericPart);
      
      if (!isNaN(number) && number > maxNumber) {
        maxNumber = number;
      }
    }

    const nextNumber = maxNumber + 1;
    const orderId = `ORD${nextNumber.toString().padStart(6, '0')}`;
    
    console.log(`Generated order ID: ${orderId} (max found: ${maxNumber}, next: ${nextNumber})`);

    // Test 4: Test direct order insertion with valid dealer ID
    console.log('\n4. Testing direct order insertion with valid dealer...');
    
    // Use the dealer ID that actually exists and is associated with products
    const validDealerId = 'DLR7'; // This exists and is associated with products
    const validProductId = products[0].product_id;
    
    console.log('Using dealer ID:', validDealerId);
    console.log('Using product ID:', validProductId);
    console.log('Generated test order ID:', orderId);
    
    try {
      const insertResult = await connection.execute(
        `INSERT INTO kriptocar.orders (
          order_id, user_id, dealer_id, product_id, customer_name, customer_email, 
          customer_phone, shipping_address, shipping_pincode, order_date, 
          order_status, total_amount, tax_amount, shipping_cost, 
          discount_amount, payment_method, payment_status, transaction_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          'USR1',
          validDealerId,
          validProductId,
          'Test Customer',
          'test@example.com',
          '1234567890',
          '123 Test Street',
          '123456',
          new Date().toISOString().slice(0, 19).replace('T', ' '),
          'Pending',
          100.00,
          10.00,
          5.00,
          0.00,
          'cod',
          'Pending',
          null
        ]
      );
      
      console.log('Insert result:', insertResult);
      
      if (insertResult[0].affectedRows > 0) {
        console.log('✅ Direct order insertion successful');
        
        // Clean up - delete the test order
        await connection.execute(
          'DELETE FROM kriptocar.orders WHERE order_id = ?',
          [orderId]
        );
        console.log('✅ Test order cleaned up');
      } else {
        console.log('❌ Direct order insertion failed - no rows affected');
      }
    } catch (insertError) {
      console.log('❌ Insert error:', insertError.message);
      console.log('Error code:', insertError.code);
    }

  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the debug
debugOrderCreation();
