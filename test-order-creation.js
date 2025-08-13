require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testOrderCreation() {
  console.log('🧪 Testing Order Creation Process...\n');
  
  let connection;
  
  try {
    // Connect to database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    // Test 1: Check available products
    console.log('1. Checking available products...');
    const [products] = await connection.execute(
      'SELECT product_id, name FROM kriptocar.products LIMIT 3'
    );
    
    if (products.length === 0) {
      console.log('❌ No products found in database');
      return;
    }
    
    console.log('✅ Found products:');
    products.forEach(product => {
      console.log(`   - ${product.product_id}: ${product.name}`);
    });

    // Test 2: Add cart items to user
    console.log('\n2. Adding cart items to user...');
    
    // Check stock before adding to cart
    const [stockResult] = await connection.execute(
      'SELECT stock_quantity FROM kriptocar.products WHERE product_id = ?',
      [products[0].product_id]
    );
    
    const currentStock = stockResult[0]?.stock_quantity || 0;
    console.log(`Current stock for ${products[0].product_id}: ${currentStock}`);
    
    if (currentStock < 2) {
      console.log('⚠️  Insufficient stock, updating stock quantity...');
      await connection.execute(
        'UPDATE kriptocar.products SET stock_quantity = 10 WHERE product_id = ?',
        [products[0].product_id]
      );
      console.log('✅ Stock updated to 10');
    }
    
    const cartItems = [
      {
        product_id: products[0].product_id,
        name: products[0].name,
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

    // Test 3: Check if server is running
    console.log('\n3. Testing server connection...');
    const serverResponse = await fetch('http://localhost:3005/api/products/featured');
    if (serverResponse.ok) {
      console.log('✅ Server is running on port 3005');
    } else {
      console.log('❌ Server not responding properly');
      return;
    }

    // Test 4: Test checkout API directly
    console.log('\n4. Testing checkout API...');
    
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
    console.log('Checkout data:', checkoutData);

    const response = await fetch('http://localhost:3005/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartItems: cartItems,
        orderData: checkoutData
      }),
    });

    console.log('📥 Response status:', response.status);
    
    const data = await response.json();
    console.log('📥 Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('\n✅ Checkout successful!');
      console.log('Order ID:', data.order_id);
      console.log('Order IDs:', data.order_ids);
      
      // Test 5: Test order retrieval
      console.log('\n5. Testing order retrieval...');
      if (data.order_id) {
        const orderResponse = await fetch(`http://localhost:3005/api/orders/${data.order_id}`);
        const orderData = await orderResponse.json();
        
        console.log('Order retrieval response:', JSON.stringify(orderData, null, 2));
        
        if (orderData.success) {
          console.log('✅ Order retrieval successful!');
        } else {
          console.log('❌ Order retrieval failed:', orderData.message);
        }
      } else {
        console.log('❌ No order_id returned from checkout!');
      }
    } else {
      console.log('\n❌ Checkout failed!');
      console.log('Error:', data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the test
testOrderCreation();
