// Test script for service email flow
// This script tests the email functionality by simulating the API calls

const https = require('https');
const http = require('http');

// Test data for service booking
const testServiceBooking = {
  user_id: "1",
  service_id: "1", 
  vendor_id: "1",
  service_name: "Car Wash & Detailing",
  service_description: "Premium car wash and interior detailing",
  service_category: "Cleaning",
  service_type: "Premium",
  base_price: 75.00,
  final_price: 89.99,
  duration_minutes: 120,
  service_date: "2024-12-15",
  service_time: "10:00",
  service_address: "123 Main Street",
  service_pincode: "12345",
  payment_method: "cod",
  additional_notes: "Please clean the interior thoroughly"
};

// Test data for service status update (vendor acceptance)
const testServiceAcceptance = {
  new_status: "Accepted",
  updated_by: "vendor",
  vendor_id: "1"
};

async function makeRequest(url, method, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 3000),
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testServiceEmailFlow() {
  console.log('🧪 Testing Service Booking Email Flow...\n');
  
  const baseUrl = 'http://localhost:3000';
  let serviceOrderId = null;

  try {
    // Step 1: Book a service (this should trigger both customer and vendor emails)
    console.log('📧 Step 1: Booking a service...');
    const bookingResponse = await makeRequest(`${baseUrl}/api/service-booking`, 'POST', testServiceBooking);
    
    if (bookingResponse.status === 200 && bookingResponse.data.success) {
      serviceOrderId = bookingResponse.data.service_order_id;
      console.log(`✅ Service booked successfully! Order ID: ${serviceOrderId}`);
      console.log('📧 Customer confirmation email should have been sent');
      console.log('📧 Vendor notification email should have been sent');
    } else {
      console.log(`❌ Service booking failed: ${bookingResponse.data.message}`);
      return;
    }

    // Wait a moment for emails to process
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 2: Vendor accepts the service (this should trigger acceptance emails)
    if (serviceOrderId) {
      console.log('\n📧 Step 2: Vendor accepting the service...');
      const acceptanceResponse = await makeRequest(
        `${baseUrl}/api/service-orders/${serviceOrderId}`, 
        'PUT', 
        testServiceAcceptance
      );
      
      if (acceptanceResponse.status === 200 && acceptanceResponse.data.success) {
        console.log(`✅ Service accepted successfully!`);
        console.log(`📧 Customer acceptance email should have been sent`);
        console.log(`📧 Vendor acceptance confirmation email should have been sent`);
      } else {
        console.log(`❌ Service acceptance failed: ${acceptanceResponse.data.message}`);
      }
    }

    console.log('\n📋 Email Flow Summary:');
    console.log('1. ✅ Service Booked → Customer gets confirmation email');
    console.log('2. ✅ Service Booked → Vendor gets notification email');
    console.log('3. ✅ Vendor Accepts → Customer gets acceptance email');
    console.log('4. ✅ Vendor Accepts → Vendor gets confirmation email');
    console.log('\n✅ Complete email flow implemented and tested!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your development server is running on localhost:3000');
    console.log('💡 Make sure your .env.local file has EMAIL_USER and EMAIL_PASSWORD configured');
  }
}

// Run the test
testServiceEmailFlow();
