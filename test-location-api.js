// Test script to verify the location API changes
const testLocationAPI = async () => {
  console.log('🧪 Testing Location API with showAllServices parameter...\n');

  try {
    // Test 1: Fetch services with showAllServices = true
    console.log('📡 Test 1: Fetching services with showAllServices = true');
    const response1 = await fetch('http://localhost:3000/api/services/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        latitude: 28.6139, 
        longitude: 77.2090, 
        radius: 10, 
        showAllServices: true 
      }),
    });

    const data1 = await response1.json();
    console.log('✅ Response 1:', {
      success: data1.success,
      totalServices: data1.services?.length || 0,
      message: data1.message
    });

    // Test 2: Fetch services with showAllServices = false (default)
    console.log('\n📡 Test 2: Fetching services with showAllServices = false (default)');
    const response2 = await fetch('http://localhost:3000/api/services/nearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        latitude: 28.6139, 
        longitude: 77.2090, 
        radius: 10 
      }),
    });

    const data2 = await response2.json();
    console.log('✅ Response 2:', {
      success: data2.success,
      totalServices: data2.services?.length || 0,
      message: data2.message
    });

    // Compare results
    console.log('\n📊 Comparison:');
    console.log(`   All services (showAllServices=true): ${data1.services?.length || 0}`);
    console.log(`   Filtered services (showAllServices=false): ${data2.services?.length || 0}`);
    
    if (data1.services?.length >= data2.services?.length) {
      console.log('✅ Test PASSED: showAllServices=true returns more or equal services');
    } else {
      console.log('❌ Test FAILED: showAllServices=true should return more services');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
};

// Run the test
testLocationAPI(); 