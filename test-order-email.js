require('dotenv').config({ path: '.env.local' });

const { sendCustomerOrderConfirmationEmail } = require('./src/lib/email.ts');

async function testOrderEmail() {
  console.log('🧪 Testing Order Confirmation Email...');
  
  const testOrderData = {
    customer_name: 'Test Customer',
    customer_email: 'lilonij125@cotasen.com',
    customer_phone: '1234567890',
    shipping_address: '123 Test Street',
    shipping_pincode: '12345',
    orders: [
      {
        order_id: 'ORD001001',
        product_id: 'PROD001',
        product_name: 'Test Product',
        product_price: 100,
        quantity: 2,
        total_price: 200,
        dealer_name: 'Test Dealer'
      }
    ],
    total_amount: 200,
    tax_amount: 20,
    shipping_cost: 10,
    discount_amount: 0,
    payment_method: 'cod',
    payment_status: 'Pending'
  };

  try {
    console.log('📧 Sending test order confirmation email...');
    const result = await sendCustomerOrderConfirmationEmail(testOrderData);
    
    if (result) {
      console.log('✅ Test order confirmation email sent successfully!');
    } else {
      console.log('❌ Test order confirmation email failed to send');
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error);
  }
}

testOrderEmail();





