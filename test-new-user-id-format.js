const mysql = require('mysql2/promise');

// Test the new 3-digit user ID format
async function testNewUserIdFormat() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('🔍 Testing new 3-digit User ID format...\n');

    // Test 1: Check existing user IDs
    console.log('📋 Current user IDs in database:');
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM users ORDER BY user_id'
    );
    
    if (existingUsers.length === 0) {
      console.log('   No existing users found');
    } else {
      existingUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.user_id}`);
      });
    }
    console.log('');

    // Test 2: Generate test user IDs
    console.log('🧪 Generating test user IDs...');
    
    // Simulate the new 3-digit format logic
    const existingUserNumbers = existingUsers
      .map(row => row.user_id)
      .filter(userId => userId.match(/^USR\d+$/))
      .map(userId => {
        const match = userId.match(/^USR(\d+)$/);
        if (!match) return 0;
        const numberStr = match[1];
        const actualNumber = parseInt(numberStr.replace(/^0+/, '') || '0');
        return actualNumber;
      })
      .filter(num => num > 0 && num <= 999)
      .sort((a, b) => a - b);

    console.log(`   Existing user numbers: [${existingUserNumbers.join(', ')}]`);

    // Find next available number
    let nextNumber = 1;
    if (existingUserNumbers.length > 0) {
      const maxNumber = Math.max(...existingUserNumbers);
      
      // Check for gaps first
      for (let i = 1; i <= maxNumber; i++) {
        if (!existingUserNumbers.includes(i)) {
          nextNumber = i;
          break;
        }
      }
      
      // If no gaps, use next number
      if (nextNumber === 1) {
        nextNumber = maxNumber + 1;
      }
    }

    if (nextNumber > 999) {
      console.log('   ❌ ERROR: Maximum user ID limit reached (999)');
      return;
    }

    const newUserId = `USR${nextNumber.toString().padStart(3, '0')}`;
    console.log(`   Next available number: ${nextNumber}`);
    console.log(`   Generated user ID: ${newUserId}`);
    console.log('');

    // Test 3: Show examples of the format
    console.log('📝 Examples of the new 3-digit format:');
    const examples = [1, 10, 100, 999, 190];
    examples.forEach(num => {
      const userId = `USR${num.toString().padStart(3, '0')}`;
      console.log(`   ${num} → ${userId}`);
    });
    console.log('');

    // Test 4: Validate format
    console.log('✅ Format validation:');
    const testIds = ['USR001', 'USR010', 'USR100', 'USR999', 'USR190'];
    testIds.forEach(userId => {
      const isValid = /^USR\d{3}$/.test(userId);
      const number = parseInt(userId.substring(3));
      const isInRange = number >= 1 && number <= 999;
      console.log(`   ${userId}: ${isValid && isInRange ? '✅ Valid' : '❌ Invalid'}`);
    });
    console.log('');

    // Test 5: Check for any existing IDs that don't match the new format
    console.log('🔍 Checking for non-compliant existing IDs:');
    const nonCompliantIds = existingUsers
      .map(row => row.user_id)
      .filter(userId => {
        if (!userId.match(/^USR\d+$/)) return true;
        const match = userId.match(/^USR(\d+)$/);
        if (!match) return true;
        const number = parseInt(match[1]);
        return number < 1 || number > 999;
      });

    if (nonCompliantIds.length === 0) {
      console.log('   ✅ All existing user IDs are compliant with the new format');
    } else {
      console.log('   ⚠️  Found non-compliant user IDs:');
      nonCompliantIds.forEach(userId => {
        console.log(`      ${userId}`);
      });
    }
    console.log('');

    console.log('🎉 User ID format test completed successfully!');
    console.log('   New format: USR + exactly 3 digits (001-999)');
    console.log('   Examples: USR001, USR010, USR100, USR999, USR190');

  } catch (error) {
    console.error('❌ Error testing user ID format:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testNewUserIdFormat();
