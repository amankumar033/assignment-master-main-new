// Test script to simulate cart quantity handling
const testCartQuantity = async () => {
  try {
    console.log('Testing cart quantity handling...');
    
    // Simulate what happens when items are added to cart
    const mockCartItem = {
      product_id: 'PRO00628',
      name: 'Fuel Filter Kit',
      price: 24.99,
      image: 'test-image.jpg',
      stock_quantity: 30,
      quantity: 1
    };
    
    console.log('Mock cart item:', mockCartItem);
    console.log('Quantity:', mockCartItem.quantity);
    console.log('Quantity type:', typeof mockCartItem.quantity);
    
    // Simulate updating quantity
    const updatedQuantity = 2;
    const updatedItem = { ...mockCartItem, quantity: updatedQuantity };
    
    console.log('\nAfter updating quantity to 2:');
    console.log('Updated item:', updatedItem);
    console.log('Quantity:', updatedItem.quantity);
    console.log('Quantity type:', typeof updatedItem.quantity);
    
    // Test what happens if quantity is undefined
    const itemWithUndefinedQuantity = { ...mockCartItem, quantity: undefined };
    console.log('\nItem with undefined quantity:');
    console.log('Item:', itemWithUndefinedQuantity);
    console.log('Quantity:', itemWithUndefinedQuantity.quantity);
    console.log('Quantity type:', typeof itemWithUndefinedQuantity.quantity);
    console.log('Quantity === undefined:', itemWithUndefinedQuantity.quantity === undefined);
    
    // Test what happens if quantity is null
    const itemWithNullQuantity = { ...mockCartItem, quantity: null };
    console.log('\nItem with null quantity:');
    console.log('Item:', itemWithNullQuantity);
    console.log('Quantity:', itemWithNullQuantity.quantity);
    console.log('Quantity type:', typeof itemWithNullQuantity.quantity);
    console.log('Quantity === null:', itemWithNullQuantity.quantity === null);
    
    // Test what happens if quantity is 0
    const itemWithZeroQuantity = { ...mockCartItem, quantity: 0 };
    console.log('\nItem with zero quantity:');
    console.log('Item:', itemWithZeroQuantity);
    console.log('Quantity:', itemWithZeroQuantity.quantity);
    console.log('Quantity type:', typeof itemWithZeroQuantity.quantity);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testCartQuantity();
