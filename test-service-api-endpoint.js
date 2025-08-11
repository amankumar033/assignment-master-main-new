// Test the actual service detail API endpoint
const testServiceAPIEndpoint = async () => {
  console.log('🧪 Testing Service Detail API Endpoint...\n');

  try {
    // Test 1: Test with a valid service ID
    console.log('📡 Test 1: Testing with service ID "SRV1"');
    const response1 = await fetch('http://localhost:3000/api/services/SRV1');
    const data1 = await response1.json();
    
    console.log('Response 1:', {
      success: data1.success,
      message: data1.message,
      hasService: !!data1.service,
      serviceName: data1.service?.name || 'N/A'
    });

    // Test 2: Test with another valid service ID
    console.log('\n📡 Test 2: Testing with service ID "SRV2"');
    const response2 = await fetch('http://localhost:3000/api/services/SRV2');
    const data2 = await response2.json();
    
    console.log('Response 2:', {
      success: data2.success,
      message: data2.message,
      hasService: !!data2.service,
      serviceName: data2.service?.name || 'N/A'
    });

    // Test 3: Test with an invalid service ID
    console.log('\n📡 Test 3: Testing with invalid service ID "999"');
    const response3 = await fetch('http://localhost:3000/api/services/999');
    const data3 = await response3.json();
    
    console.log('Response 3:', {
      success: data3.success,
      message: data3.message,
      hasService: !!data3.service
    });

    // Test 4: Test with a non-existent service ID
    console.log('\n📡 Test 4: Testing with non-existent service ID "NONEXISTENT"');
    const response4 = await fetch('http://localhost:3000/api/services/NONEXISTENT');
    const data4 = await response4.json();
    
    console.log('Response 4:', {
      success: data4.success,
      message: data4.message,
      hasService: !!data4.service
    });

    console.log('\n✅ All API endpoint tests completed!');

  } catch (error) {
    console.error('❌ Error testing API endpoint:', error);
  }
};

// Run the test
testServiceAPIEndpoint().catch(console.error);

