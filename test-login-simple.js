const http = require('http');

function testLoginAPI() {
  console.log('🔐 TESTING LOGIN API...\n');
  
  const loginData = JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };
  
  console.log('📡 Making login request...');
  console.log('📧 Email: test@example.com');
  console.log('🔑 Password: test123');
  
  const req = http.request(options, (res) => {
    console.log('\n📥 Response Status:', res.statusCode);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const responseData = JSON.parse(data);
        console.log('📋 Response Data:', JSON.stringify(responseData, null, 2));
        
        if (res.statusCode === 200) {
          console.log('\n✅ Login API test successful!');
          console.log('🎉 The login functionality is working correctly.');
          console.log('\n💡 You can now test login in your browser with:');
          console.log('   Email: test@example.com');
          console.log('   Password: test123');
        } else {
          console.log('\n❌ Login API test failed!');
          console.log('💡 Check the error message above for details.');
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing login API:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  });
  
  req.write(loginData);
  req.end();
}

testLoginAPI();
