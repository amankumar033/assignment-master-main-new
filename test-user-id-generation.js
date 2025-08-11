const mysql = require('mysql2/promise');

// Test the user ID generation functionality
async function testUserIdGeneration() {
  let connection;
  
  try {
    console.log('🔍 Testing User ID Generation...');
    
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
    });

    console.log('✅ Database connection established');

    // Test 1: Check current users with USR format
    console.log('\n📊 Current users with USR format:');
    const [currentUsers] = await connection.execute(
      'SELECT user_id, email, full_name FROM kriptocar.users WHERE user_id LIKE "USR%" ORDER BY user_id'
    );
    
    if (currentUsers.length > 0) {
      currentUsers.forEach(user => {
        console.log(`  ${user.user_id} - ${user.email} (${user.full_name})`);
      });
    } else {
      console.log('  No users found with USR format');
    }

    // Test 2: Find the maximum USR number
    console.log('\n🔍 Finding maximum USR number:');
    const [maxResult] = await connection.execute(
      'SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) as max_number FROM kriptocar.users WHERE user_id LIKE "USR%"'
    );
    
    const maxNumber = maxResult[0]?.max_number || 0;
    console.log(`  Maximum USR number: ${maxNumber}`);
    
    // Test 3: Generate next user ID
    const nextNumber = maxNumber + 1;
    const nextUserId = `USR${nextNumber.toString().padStart(6, '0')}`;
    console.log(`  Next user ID would be: ${nextUserId}`);

    // Test 4: Check if users table has the user_id column
    console.log('\n🔍 Checking users table structure:');
    const [columns] = await connection.execute(
      'DESCRIBE kriptocar.users'
    );
    
    const hasUserIdColumn = columns.some(col => col.Field === 'user_id');
    console.log(`  Has user_id column: ${hasUserIdColumn}`);
    
    if (hasUserIdColumn) {
      const userIdColumn = columns.find(col => col.Field === 'user_id');
      console.log(`  user_id column type: ${userIdColumn.Type}`);
      console.log(`  user_id column null: ${userIdColumn.Null}`);
      console.log(`  user_id column key: ${userIdColumn.Key}`);
    }

    // Test 5: Check for users without USR format
    console.log('\n🔍 Users without USR format:');
    const [nonUsrUsers] = await connection.execute(
      'SELECT id, user_id, email, full_name FROM kriptocar.users WHERE user_id IS NULL OR user_id NOT LIKE "USR%"'
    );
    
    if (nonUsrUsers.length > 0) {
      console.log('  Users that need migration:');
      nonUsrUsers.forEach(user => {
        console.log(`    ID: ${user.id}, user_id: ${user.user_id || 'NULL'}, Email: ${user.email}`);
      });
    } else {
      console.log('  All users have USR format user_ids');
    }

    console.log('\n✅ User ID generation test completed successfully');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testUserIdGeneration().catch(console.error);
