const http = require('http');

function testSignupAPI() {
  console.log('📝 TESTING SIGNUP API...\n');
  
  const signupData = JSON.stringify({
    fullName: 'Test Signup User',
    email: 'signup-test@example.com',
    password: 'test123',
    phone: '9876543210',
    address: 'Test Address',
    city: 'Test City',
    state: 'Test State',
    pincode: '123456'
  });
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/signup',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(signupData)
    }
  };
  
  console.log('📡 Making signup request...');
  console.log('📧 Email: signup-test@example.com');
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
          console.log('\n✅ Signup API test successful!');
          console.log('🎉 The signup functionality is working correctly.');
          console.log('\n💡 You can now test signup in your browser');
        } else {
          console.log('\n❌ Signup API test failed!');
          console.log('💡 Check the error message above for details.');
        }
      } catch (error) {
        console.log('❌ Error parsing response:', error.message);
        console.log('Raw response:', data);
      }
    });
  });
  
  req.on('error', (error) => {
    console.error('❌ Error testing signup API:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  });
  
  req.write(signupData);
  req.end();
}

testSignupAPI();
