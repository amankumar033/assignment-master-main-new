// Test script for dealer and vendor email notifications
// Run this script to test the email functionality

const { sendDealerOrderNotificationEmail, sendVendorServiceNotificationEmail } = require('./src/lib/email');

// Test dealer order notification email
async function testDealerEmail() {
  console.log('🧪 Testing dealer order notification email...');
  
  const dealerOrderData = {
    order_id: 'ORD000001',
    dealer_name: 'Auto Parts Plus',
    dealer_email: 'dealer1@kriptocar.com',
    customer_name: 'John Doe',
    customer_email: 'john.doe@example.com',
    customer_phone: '+91-9876543210',
    total_amount: 299.99,
    order_date: new Date().toISOString(),
    order_status: 'Processing',
    payment_status: 'Paid',
    shipping_address: '123 Customer Street, Customer City',
    shipping_pincode: '400001',
    items: [
      {
        product_id: 'PROD001',
        name: 'Engine Oil Filter',
        price: 29.99,
        quantity: 2
      },
      {
        product_id: 'PROD002',
        name: 'Brake Pads',
        price: 119.99,
        quantity: 1
      },
      {
        product_id: 'PROD003',
        name: 'Air Filter',
        price: 19.99,
        quantity: 1
      }
    ]
  };

  try {
    const result = await sendDealerOrderNotificationEmail(dealerOrderData);
    if (result) {
      console.log('✅ Dealer email test successful!');
    } else {
      console.log('❌ Dealer email test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing dealer email:', error);
  }
}

// Test vendor service notification email
async function testVendorEmail() {
  console.log('🧪 Testing vendor service notification email...');
  
  const vendorServiceData = {
    service_order_id: 'SOR000001',
    vendor_name: 'Quick Fix Auto Services',
    vendor_email: 'vendor1@kriptocar.com',
    customer_name: 'Jane Smith',
    customer_email: 'jane.smith@example.com',
    customer_phone: '+91-9876543211',
    service_name: 'Engine Oil Change',
    service_category: 'Maintenance',
    service_type: 'Oil Service',
    final_price: 49.99,
    service_date: '2024-01-15',
    service_time: '10:00:00',
    service_status: 'Scheduled',
    payment_status: 'Pending',
    service_address: '456 Customer Avenue, Customer Town',
    service_pincode: '400001',
    additional_notes: 'Please bring synthetic oil if available'
  };

  try {
    const result = await sendVendorServiceNotificationEmail(vendorServiceData);
    if (result) {
      console.log('✅ Vendor email test successful!');
    } else {
      console.log('❌ Vendor email test failed!');
    }
  } catch (error) {
    console.error('❌ Error testing vendor email:', error);
  }
}

// Test notification functions
async function testNotifications() {
  console.log('🧪 Testing notification functions...');
  
  const { createOrderNotifications, createServiceOrderNotifications } = require('./src/lib/notifications');
  
  // Test order notification
  const orderData = {
    customer_name: 'Test Customer',
    customer_email: 'test@example.com',
    customer_phone: '+91-9876543212',
    total_amount: 199.99,
    order_status: 'Processing',
    payment_status: 'Paid',
    shipping_address: 'Test Address',
    shipping_pincode: '400001',
    items: [
      {
        product_id: 'PROD001',
        name: 'Test Product',
        price: 99.99,
        quantity: 2
      }
    ]
  };

  try {
    await createOrderNotifications(orderData, 'ORD000002', 'DLR000001');
    console.log('✅ Order notification test completed');
  } catch (error) {
    console.error('❌ Error testing order notification:', error);
  }

  // Test service notification
  const serviceOrderData = {
    customer_name: 'Test Service Customer',
    customer_email: 'service@example.com',
    customer_phone: '+91-9876543213',
    service_name: 'Test Service',
    service_category: 'Test Category',
    service_type: 'Test Type',
    final_price: 79.99,
    service_date: '2024-01-20',
    service_time: '14:00:00',
    service_status: 'Scheduled',
    payment_status: 'Pending',
    service_address: 'Test Service Address',
    service_pincode: '400001',
    additional_notes: 'Test notes'
  };

  try {
    await createServiceOrderNotifications(serviceOrderData, 'SOR000002', 'VND000001');
    console.log('✅ Service notification test completed');
  } catch (error) {
    console.error('❌ Error testing service notification:', error);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting dealer and vendor email tests...\n');
  
  // Check environment variables
  console.log('📋 Environment check:');
  console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('  - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
  console.log('  - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL || 'Not set');
  console.log('');

  // Run tests
  await testDealerEmail();
  console.log('');
  
  await testVendorEmail();
  console.log('');
  
  await testNotifications();
  console.log('');
  
  console.log('🏁 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  // Load environment variables
  require('dotenv').config({ path: '.env.local' });
  
  runTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = {
  testDealerEmail,
  testVendorEmail,
  testNotifications,
  runTests
};
