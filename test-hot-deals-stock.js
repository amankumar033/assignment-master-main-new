const testHotDealsStock = async () => {
  try {
    console.log('Testing hot deals API...');
    
    const response = await fetch('http://localhost:3000/api/products/hot-deals');
    const data = await response.json();
    
    if (data.success) {
      console.log('Hot deals API response:', data.products.length, 'products');
      
      data.products.forEach((product, index) => {
        console.log(`Product ${index + 1}:`, {
          name: product.name,
          product_id: product.product_id,
          stock_quantity: product.stock_quantity,
          stock_quantity_type: typeof product.stock_quantity,
          stock_quantity_parsed: Number(product.stock_quantity)
        });
      });
    } else {
      console.error('API failed:', data.message);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
};

testHotDealsStock();
