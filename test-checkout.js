require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testCheckout() {
  let connection;
  
  try {
    console.log('🧪 Testing Complete Checkout Process...\n');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    // Step 1: Add items to user's cart
    console.log('📦 Step 1: Adding items to user cart...');
    const cartItems = [
      {
        product_id: '1',
        name: 'Test Product',
        price: 50.00,
        quantity: 2,
        image: '/engine1.png'
      }
    ];

    await connection.execute(
      'UPDATE kriptocar.users SET cart_items = ? WHERE user_id = ?',
      [JSON.stringify(cartItems), 'USR1']
    );
    
    console.log('✅ Cart items added to user USR1');

    // Step 2: Test checkout
    console.log('\n🛒 Step 2: Testing checkout process...');
    
    const checkoutData = {
      user_id: 'USR1',
      customer_name: 'Test Customer',
      customer_email: 'test@example.com',
      customer_phone: '1234567890',
      shipping_address: '123 Test Street, Test City',
      shipping_pincode: '123456',
      order_status: 'Pending',
      total_amount: 100.00,
      tax_amount: 10.00,
      shipping_cost: 5.00,
      discount_amount: 0.00,
      payment_method: 'cod',
      payment_status: 'Pending',
      transaction_id: null
    };

    console.log('📤 Sending checkout request...');

    const response = await fetch('http://localhost:3004/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData),
    });

    const data = await response.json();
    
    console.log('\n📥 Response Status:', response.status);
    console.log('📥 Response Data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Checkout successful!');
      console.log('Order ID:', data.order_id);
      console.log('Order IDs:', data.order_ids);
      
      // Step 3: Test order retrieval
      console.log('\n📋 Step 3: Testing order retrieval...');
      const orderResponse = await fetch(`http://localhost:3004/api/orders/${data.order_id}`);
      const orderData = await orderResponse.json();
      
      console.log('Order retrieval response:', JSON.stringify(orderData, null, 2));
      
    } else {
      console.log('\n❌ Checkout failed!');
      console.log('Error:', data.message);
    }

  } catch (error) {
    console.error('❌ Error testing checkout:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testCheckout();
