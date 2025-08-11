const fetch = require('node-fetch');

async function testLoginAPI() {
  console.log('🔐 TESTING LOGIN API...\n');
  
  const loginData = {
    email: 'test@example.com',
    password: 'test123'
  };
  
  try {
    console.log('📡 Making login request...');
    console.log('📧 Email:', loginData.email);
    console.log('🔑 Password:', loginData.password);
    
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });
    
    const data = await response.json();
    
    console.log('\n📥 Response Status:', response.status);
    console.log('📋 Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('\n✅ Login API test successful!');
      console.log('🎉 The login functionality is working correctly.');
    } else {
      console.log('\n❌ Login API test failed!');
      console.log('💡 Check the error message above for details.');
    }
    
  } catch (error) {
    console.error('❌ Error testing login API:', error.message);
    console.log('\n💡 Make sure your Next.js development server is running:');
    console.log('   npm run dev');
  }
}

testLoginAPI();
