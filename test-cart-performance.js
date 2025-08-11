// Test script to verify cart performance optimizations
const testCartPerformance = async () => {
  console.log('Testing cart performance optimizations...');
  
  // Test 1: Multiple rapid add to cart operations
  console.log('\n1. Testing multiple rapid add to cart operations...');
  
  const startTime = Date.now();
  
  // Simulate multiple rapid add to cart calls
  const promises = [];
  for (let i = 0; i < 5; i++) {
    promises.push(
      fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: `test_product_${i}`,
          user_id: 'test_user_123'
        }),
      })
    );
  }
  
  try {
    const responses = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log(`✅ Multiple rapid operations completed in ${endTime - startTime}ms`);
    
    // Check if all responses are successful
    const allSuccessful = responses.every(response => response.ok);
    console.log(`✅ All responses successful: ${allSuccessful}`);
    
  } catch (error) {
    console.error('❌ Error testing rapid operations:', error);
  }
  
  // Test 2: Single add to cart operation
  console.log('\n2. Testing single add to cart operation...');
  
  const singleStartTime = Date.now();
  
  try {
    const response = await fetch('/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: 'single_test_product',
        user_id: 'test_user_123'
      }),
    });
    
    const singleEndTime = Date.now();
    
    console.log(`✅ Single operation completed in ${singleEndTime - singleStartTime}ms`);
    console.log(`✅ Response status: ${response.status}`);
    
  } catch (error) {
    console.error('❌ Error testing single operation:', error);
  }
  
  console.log('\n🎉 Cart performance test completed!');
};

// Run the test if this script is executed directly
if (typeof window === 'undefined') {
  // Node.js environment
  testCartPerformance();
} else {
  // Browser environment
  window.testCartPerformance = testCartPerformance;
  console.log('Test function available as window.testCartPerformance()');
}

