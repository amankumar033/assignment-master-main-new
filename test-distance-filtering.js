const fetch = require('node-fetch');

async function testDistanceFiltering() {
  console.log('🧪 Testing Distance Filtering API...\n');

  const testCases = [
    {
      name: 'Test 1: 10km radius filtering',
      body: { pincode: '201301', radius: 10, showAllServices: false }
    },
    {
      name: 'Test 2: 25km radius filtering',
      body: { pincode: '201301', radius: 25, showAllServices: false }
    },
    {
      name: 'Test 3: 50km radius filtering',
      body: { pincode: '201301', radius: 50, showAllServices: false }
    },
    {
      name: 'Test 4: Show all services (any distance)',
      body: { pincode: '201301', radius: 1000, showAllServices: true }
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 ${testCase.name}`);
    console.log('Request body:', testCase.body);
    
    try {
      const response = await fetch('http://localhost:3000/api/services/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.body)
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`✅ Success: ${data.totalFound} services found`);
        console.log(`   Filtering mode: ${data.filteringMode}`);
        console.log(`   Radius: ${data.radius || 'N/A'}`);
        
        // Show first few services with distances
        const servicesWithDistance = data.services.filter(s => s.distance !== undefined);
        console.log(`   Services with distance info: ${servicesWithDistance.length}`);
        
        if (servicesWithDistance.length > 0) {
          console.log('   Sample distances:', servicesWithDistance.slice(0, 3).map(s => `${s.name}: ${s.distance}km`));
        }
      } else {
        console.log(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.log(`❌ Request failed: ${error.message}`);
    }
  }
}

// Run the test
testDistanceFiltering().catch(console.error); 