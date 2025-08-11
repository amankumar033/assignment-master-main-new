// Test script to demonstrate user ID generation logic
// This script doesn't require database connection

class MockUserIdGenerator {
  constructor() {
    this.mockUsers = [
      { user_id: 'USR000001', email: 'user1@example.com' },
      { user_id: 'USR000002', email: 'user2@example.com' },
      { user_id: 'USR000005', email: 'user5@example.com' },
      { user_id: 'USR000010', email: 'user10@example.com' }
    ];
  }

  async generateUserId() {
    try {
      // Simulate database query to find maximum USR number
      const maxNumber = this.findMaxUsrNumber();
      const nextNumber = maxNumber + 1;
      
      // Generate the new user ID
      const userId = `USR${nextNumber.toString().padStart(6, '0')}`;
      
      console.log(`Generated user ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error generating user ID:', error);
      throw new Error('Failed to generate unique user ID');
    }
  }

  findMaxUsrNumber() {
    let maxNumber = 0;
    
    this.mockUsers.forEach(user => {
      if (user.user_id && user.user_id.startsWith('USR')) {
        const numberPart = user.user_id.substring(3); // Remove 'USR' prefix
        const number = parseInt(numberPart, 10);
        if (!isNaN(number) && number > maxNumber) {
          maxNumber = number;
        }
      }
    });
    
    return maxNumber;
  }

  addUser(userId) {
    this.mockUsers.push({ user_id: userId, email: `user${this.mockUsers.length + 1}@example.com` });
  }
}

// Test the user ID generation
async function testUserIdLogic() {
  console.log('🔍 Testing User ID Generation Logic...\n');
  
  const generator = new MockUserIdGenerator();
  
  console.log('📊 Current mock users:');
  generator.mockUsers.forEach(user => {
    console.log(`  ${user.user_id} - ${user.email}`);
  });
  
  console.log('\n🔍 Finding maximum USR number:');
  const maxNumber = generator.findMaxUsrNumber();
  console.log(`  Maximum USR number: ${maxNumber}`);
  
  console.log('\n🔍 Generating next user ID:');
  const nextUserId = await generator.generateUserId();
  console.log(`  Next user ID: ${nextUserId}`);
  
  console.log('\n🔍 Adding new user and generating another ID:');
  generator.addUser(nextUserId);
  
  const nextUserId2 = await generator.generateUserId();
  console.log(`  Next user ID after adding user: ${nextUserId2}`);
  
  console.log('\n📊 Updated mock users:');
  generator.mockUsers.forEach(user => {
    console.log(`  ${user.user_id} - ${user.email}`);
  });
  
  console.log('\n✅ User ID generation logic test completed successfully');
  
  // Test edge cases
  console.log('\n🔍 Testing edge cases:');
  
  // Test with no existing users
  const emptyGenerator = new MockUserIdGenerator();
  emptyGenerator.mockUsers = [];
  const firstUserId = await emptyGenerator.generateUserId();
  console.log(`  First user ID (no existing users): ${firstUserId}`);
  
  // Test with non-sequential numbers
  const nonSequentialGenerator = new MockUserIdGenerator();
  nonSequentialGenerator.mockUsers = [
    { user_id: 'USR000001', email: 'user1@example.com' },
    { user_id: 'USR000999', email: 'user999@example.com' },
    { user_id: 'USR000100', email: 'user100@example.com' }
  ];
  const nextUserId3 = await nonSequentialGenerator.generateUserId();
  console.log(`  Next user ID (non-sequential): ${nextUserId3}`);
  
  console.log('\n✅ All tests completed successfully!');
}

// Run the test
testUserIdLogic().catch(console.error);
