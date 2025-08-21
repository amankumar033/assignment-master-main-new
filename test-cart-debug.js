// Test script to debug cart functionality
const testCartDebug = async () => {
  try {
    console.log('Testing cart functionality...');
    
    // Test 1: Check hot deals API
    console.log('\n1. Testing hot deals API...');
    const hotDealsResponse = await fetch('http://localhost:3000/api/products/hot-deals');
    const hotDealsData = await hotDealsResponse.json();
    
    if (hotDealsData.success && hotDealsData.products.length > 0) {
      const testProduct = hotDealsData.products[0];
      console.log('Test product:', {
        name: testProduct.name,
        product_id: testProduct.product_id,
        stock_quantity: testProduct.stock_quantity,
        stock_quantity_type: typeof testProduct.stock_quantity,
        stock_quantity_parsed: Number(testProduct.stock_quantity)
      });
      
      // Test 2: Simulate what the Deals component does
      console.log('\n2. Simulating Deals component addToCart call...');
      const itemToAdd = {
        product_id: testProduct.product_id,
        name: testProduct.name,
        price: testProduct.sale_price,
        image: testProduct.image_1,
        stock_quantity: Number(testProduct.stock_quantity) || 0
      };
      
      console.log('Item to add:', itemToAdd);
      console.log('stock_quantity after Number() conversion:', itemToAdd.stock_quantity);
      console.log('stock_quantity type after conversion:', typeof itemToAdd.stock_quantity);
      
      // Test 3: Check if stock_quantity is undefined or null
      if (itemToAdd.stock_quantity === undefined) {
        console.log('❌ ERROR: stock_quantity is undefined after Number() conversion');
      } else if (itemToAdd.stock_quantity === null) {
        console.log('❌ ERROR: stock_quantity is null after Number() conversion');
      } else if (isNaN(itemToAdd.stock_quantity)) {
        console.log('❌ ERROR: stock_quantity is NaN after Number() conversion');
      } else {
        console.log('✅ stock_quantity is valid:', itemToAdd.stock_quantity);
      }
    } else {
      console.error('Failed to fetch hot deals:', hotDealsData.message);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testCartDebug();
