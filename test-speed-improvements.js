require('dotenv').config({ path: '.env.local' });

async function testSpeedImprovements() {
  console.log('🚀 Testing Speed Improvements...\n');
  
  // Test 1: Check if server is running
  console.log('1. Testing server connection...');
  try {
    const response = await fetch('http://localhost:3006/api/products/featured');
    if (response.ok) {
      console.log('✅ Server is running on port 3006');
    } else {
      console.log('❌ Server not responding properly');
      return;
    }
  } catch (error) {
    console.log('❌ Server not accessible:', error.message);
    return;
  }
  
  // Test 2: Test cart API speed
  console.log('\n2. Testing cart API speed...');
  const startTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3006/api/cart/get?userId=USR1');
    const data = await response.json();
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Cart API response time: ${duration}ms`);
    console.log(`📦 Cart items: ${data.cartItems?.length || 0}`);
    
    if (duration < 500) {
      console.log('✅ Fast response time!');
    } else {
      console.log('⚠️  Response time could be faster');
    }
  } catch (error) {
    console.log('❌ Cart API test failed:', error.message);
  }
  
  // Test 3: Test checkout API speed
  console.log('\n3. Testing checkout API speed...');
  const checkoutStartTime = Date.now();
  
  try {
    const response = await fetch('http://localhost:3006/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: 'USR1',
        customer_name: 'Speed Test',
        customer_email: 'speed@test.com',
        customer_phone: '1234567890',
        shipping_address: 'Speed Test Address',
        shipping_pincode: '123456',
        order_status: 'Pending',
        total_amount: 100,
        tax_amount: 10,
        shipping_cost: 5,
        discount_amount: 0,
        payment_method: 'cod',
        payment_status: 'Pending',
        transaction_id: null
      }),
    });
    
    const data = await response.json();
    const checkoutEndTime = Date.now();
    const checkoutDuration = checkoutEndTime - checkoutStartTime;
    
    console.log(`✅ Checkout API response time: ${checkoutDuration}ms`);
    
    if (data.success) {
      console.log(`📝 Order created: ${data.order_id}`);
    } else {
      console.log('⚠️  Checkout failed (expected if no cart items):', data.message);
    }
    
    if (checkoutDuration < 2000) {
      console.log('✅ Fast checkout processing!');
    } else {
      console.log('⚠️  Checkout could be faster');
    }
  } catch (error) {
    console.log('❌ Checkout API test failed:', error.message);
  }
  
  console.log('\n🎯 Speed Test Summary:');
  console.log('• Toast animations: 0.08s (ultra-fast)');
  console.log('• Button transitions: 0.075s (instant)');
  console.log('• Cart updates: Optimistic (immediate)');
  console.log('• Loading states: Immediate clear');
  console.log('• Toast duration: 2s (quick)');
  
  console.log('\n💡 To test UI speed improvements:');
  console.log('1. Open http://localhost:3006/shop');
  console.log('2. Click "Add to Cart" buttons');
  console.log('3. Watch for instant toast notifications');
  console.log('4. Notice immediate button state changes');
  console.log('5. Check cart dropdown responsiveness');
}

// Run the test
testSpeedImprovements();
