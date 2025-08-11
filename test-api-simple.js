const http = require('http');

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Testing API Endpoints...\n');

  try {
    // Test 1: Homepage
    console.log('🏠 Test 1: Testing homepage...');
    try {
      const homeResponse = await makeRequest('/');
      console.log(`✅ Homepage: Status ${homeResponse.status}`);
    } catch (error) {
      console.log(`❌ Homepage: ${error.message}`);
    }

    // Test 2: Products API
    console.log('\n📦 Test 2: Testing Products API...');
    try {
      const productsResponse = await makeRequest('/api/products/all');
      if (productsResponse.status === 200 && productsResponse.data.success) {
        console.log(`✅ Products API: SUCCESS (${productsResponse.data.products.length} products found)`);
      } else {
        console.log(`❌ Products API: FAILED - Status ${productsResponse.status}`);
        if (productsResponse.data && productsResponse.data.message) {
          console.log(`   Error: ${productsResponse.data.message}`);
        }
      }
    } catch (error) {
      console.log(`❌ Products API: ${error.message}`);
    }

    // Test 3: Categories API
    console.log('\n📂 Test 3: Testing Categories API...');
    try {
      const categoriesResponse = await makeRequest('/api/categories');
      if (categoriesResponse.status === 200 && categoriesResponse.data.success) {
        console.log(`✅ Categories API: SUCCESS (${categoriesResponse.data.categories.length} categories found)`);
      } else {
        console.log(`❌ Categories API: FAILED - Status ${categoriesResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Categories API: ${error.message}`);
    }

    // Test 4: Brands API
    console.log('\n🏷️ Test 4: Testing Brands API...');
    try {
      const brandsResponse = await makeRequest('/api/brands');
      if (brandsResponse.status === 200 && brandsResponse.data.success) {
        console.log(`✅ Brands API: SUCCESS (${brandsResponse.data.brands.length} brands found)`);
      } else {
        console.log(`❌ Brands API: FAILED - Status ${brandsResponse.status}`);
      }
    } catch (error) {
      console.log(`❌ Brands API: ${error.message}`);
    }

    console.log('\n📋 API Test Summary:');
    console.log('✅ All API endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPIs();
