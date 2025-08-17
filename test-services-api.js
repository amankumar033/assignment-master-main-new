// Test services APIs with new database structure
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

const testServicesAPI = async () => {
  try {
    console.log('🧪 Testing Services API...\n');

    // Test 1: Show all services with pincode 201301
    console.log('📋 Test 1: Show all services for pincode 201301');
    const response1 = await fetch('http://localhost:3000/api/services/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pincode: '201301',
        radius: 1000,
        showAllServices: true
      })
    });

    const data1 = await response1.json();
    console.log(`✅ Response: ${data1.success ? 'Success' : 'Failed'}`);
    console.log(`📊 Total services returned: ${data1.services?.length || 0}`);
    console.log(`🎯 Filtering mode: ${data1.filteringMode}`);
    
    if (data1.services && data1.services.length > 0) {
      console.log('\n📋 Sample services:');
      data1.services.slice(0, 5).forEach((service, index) => {
        console.log(`   ${index + 1}. ${service.name} (${service.pincode}) - Distance: ${service.distance}km`);
      });
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Filter by distance (50km radius)
    console.log('📋 Test 2: Filter by 50km radius for pincode 201301');
    const response2 = await fetch('http://localhost:3000/api/services/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pincode: '201301',
        radius: 50,
        showAllServices: false
      })
    });

    const data2 = await response2.json();
    console.log(`✅ Response: ${data2.success ? 'Success' : 'Failed'}`);
    console.log(`📊 Services within 50km: ${data2.services?.length || 0}`);
    console.log(`🎯 Filtering mode: ${data2.filteringMode}`);
    console.log(`📍 User location: ${data2.userLocation?.pincode} (${data2.userLocation?.latitude}, ${data2.userLocation?.longitude})`);

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Check if specific service exists
    console.log('📋 Test 3: Looking for "Testing Service2"');
    if (data1.services) {
      const testingService = data1.services.find(s => s.name === 'Testing Service2');
      if (testingService) {
        console.log(`✅ Found: ${testingService.name}`);
        console.log(`   Service ID: ${testingService.service_id}`);
        console.log(`   Pincode: ${testingService.pincode}`);
        console.log(`   Distance: ${testingService.distance}km`);
        console.log(`   Available: ${testingService.is_available}`);
      } else {
        console.log('❌ "Testing Service2" not found in results');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testServicesAPI();

