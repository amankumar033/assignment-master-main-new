const API_URL = 'http://localhost:3000/api/users';

async function testCreateUser() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        password_hash: 'securepassword123',
        phone: '1234567890'
      }),
    });

    // First check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(`Expected JSON but got: ${text.substring(0, 100)}...`);
    }

    const data = await response.json();
    console.log('Success:', data);
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Make sure:');
    console.log('1. Your Next.js server is running (npm run dev)');
    console.log('2. The API route exists at /api/users');
    console.log('3. The endpoint accepts POST requests');
  }
}

testCreateUser();