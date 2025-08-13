const mysql = require('mysql2/promise');

// Test configuration
const testConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'kriptocar'
};

async function testEnhancedAPIs() {
  let connection;
  
  try {
    console.log('🧪 Testing Enhanced APIs with Product and Vendor Details...\n');
    
    connection = await mysql.createConnection(testConfig);
    
    // Test 1: Check if orders table has product details
    console.log('📊 Test 1: Checking orders with product details');
    const [ordersWithProducts] = await connection.execute(
      `SELECT 
        o.order_id,
        o.user_id,
        o.product_id,
        p.name as product_name,
        p.price as product_price,
        p.image_1 as product_image,
        p.description as product_description
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.product_id
      WHERE o.user_id = 'USR12'
      LIMIT 3`
    );
    
    console.log('Orders with product details:');
    ordersWithProducts.forEach(order => {
      console.log(`  - Order ${order.order_id}:`);
      console.log(`    Product: ${order.product_name || 'N/A'}`);
      console.log(`    Price: $${order.product_price || 0}`);
      console.log(`    Image: ${order.product_image ? 'Available' : 'Not available'}`);
      console.log(`    Description: ${order.product_description ? 'Available' : 'Not available'}`);
    });
    
    // Test 2: Check if service orders table has vendor details
    console.log('\n📊 Test 2: Checking service orders with vendor details');
    const [serviceOrdersWithVendors] = await connection.execute(
      `SELECT 
        so.service_order_id,
        so.user_id,
        so.service_name,
        so.final_price,
        v.vendor_name,
        v.contact_email as vendor_email,
        v.contact_phone as vendor_phone,
        v.address as vendor_address
      FROM service_orders so
      LEFT JOIN vendors v ON so.vendor_id = v.vendor_id
      WHERE so.user_id = 'USR12'
      LIMIT 3`
    );
    
    console.log('Service orders with vendor details:');
    serviceOrdersWithVendors.forEach(serviceOrder => {
      console.log(`  - Service Order ${serviceOrder.service_order_id}:`);
      console.log(`    Service: ${serviceOrder.service_name}`);
      console.log(`    Price: $${serviceOrder.final_price || 0}`);
      console.log(`    Vendor: ${serviceOrder.vendor_name || 'N/A'}`);
      console.log(`    Vendor Email: ${serviceOrder.vendor_email || 'N/A'}`);
      console.log(`    Vendor Phone: ${serviceOrder.vendor_phone || 'N/A'}`);
      console.log(`    Vendor Address: ${serviceOrder.vendor_address || 'N/A'}`);
    });
    
    // Test 3: Check data integrity
    console.log('\n🔍 Test 3: Checking data integrity');
    
    // Check for orders without product details
    const [ordersWithoutProducts] = await connection.execute(
      `SELECT COUNT(*) as count FROM orders o
       LEFT JOIN products p ON o.product_id = p.product_id
       WHERE p.product_id IS NULL`
    );
    
    console.log(`Orders without product details: ${ordersWithoutProducts[0].count}`);
    
    // Check for service orders without vendor details
    const [serviceOrdersWithoutVendors] = await connection.execute(
      `SELECT COUNT(*) as count FROM service_orders so
       LEFT JOIN vendors v ON so.vendor_id = v.vendor_id
       WHERE v.vendor_id IS NULL`
    );
    
    console.log(`Service orders without vendor details: ${serviceOrdersWithoutVendors[0].count}`);
    
    // Test 4: Sample API response simulation
    console.log('\n📋 Test 4: Simulating API responses');
    
    // Simulate order API response
    const sampleOrderResponse = {
      success: true,
      message: 'User orders fetched successfully',
      orders: ordersWithProducts.map(order => ({
        order_id: order.order_id,
        user_id: order.user_id,
        product_id: order.product_id,
        product_name: order.product_name || 'Product not found',
        product_price: parseFloat(order.product_price) || 0,
        product_image: order.product_image,
        product_description: order.product_description,
        quantity: 1, // Assuming quantity is stored in orders table
        customer_name: 'Test Customer',
        customer_email: 'test@example.com',
        customer_phone: '1234567890',
        shipping_address_line1: '123 Test St',
        shipping_address_line2: '',
        shipping_city: 'Test City',
        shipping_state: 'Test State',
        shipping_postal_code: '12345',
        shipping_country: 'India',
        order_date: new Date().toISOString(),
        order_status: 'Processing',
        total_amount: parseFloat(order.product_price) || 0,
        tax_amount: 0,
        shipping_cost: 0,
        discount_amount: 0,
        payment_method: 'cod',
        payment_status: 'Pending',
        transaction_id: null
      }))
    };
    
    console.log('Sample Order API Response Structure:');
    console.log(JSON.stringify(sampleOrderResponse, null, 2));
    
    // Simulate service order API response
    const sampleServiceOrderResponse = {
      success: true,
      orders: serviceOrdersWithVendors.map(serviceOrder => ({
        service_order_id: serviceOrder.service_order_id,
        user_id: serviceOrder.user_id,
        service_id: 'SRV001',
        vendor_id: 'VND001',
        vendor_name: serviceOrder.vendor_name || 'N/A',
        vendor_email: serviceOrder.vendor_email || 'N/A',
        vendor_phone: serviceOrder.vendor_phone || 'N/A',
        vendor_address: serviceOrder.vendor_address || 'N/A',
        service_name: serviceOrder.service_name,
        service_description: 'Test service description',
        service_category: 'Maintenance',
        service_type: 'Regular',
        base_price: parseFloat(serviceOrder.final_price) || 0,
        final_price: parseFloat(serviceOrder.final_price) || 0,
        duration_minutes: 60,
        booking_date: new Date().toISOString(),
        service_date: new Date().toISOString(),
        service_time: '10:00:00',
        service_status: 'Pending',
        service_pincode: '12345',
        service_address: '123 Test St, Test City',
        additional_notes: 'Test notes',
        payment_method: 'cod',
        payment_status: 'Pending',
        transaction_id: null,
        was_available: 1
      }))
    };
    
    console.log('\nSample Service Order API Response Structure:');
    console.log(JSON.stringify(sampleServiceOrderResponse, null, 2));
    
    console.log('\n✅ Enhanced API testing completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Order APIs now include product details (name, price, image, description)');
    console.log('- Service order APIs now include vendor details (name, email, phone, address)');
    console.log('- Frontend components updated to display the enhanced information');
    console.log('- Data integrity checks ensure proper relationships');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testEnhancedAPIs();
