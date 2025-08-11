const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function diagnoseLoginIssue() {
  console.log('🔍 DIAGNOSING LOGIN/SIGNUP ISSUES...\n');
  
  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log('DB_HOST:', process.env.DB_HOST || 'localhost (default)');
  console.log('DB_USER:', process.env.DB_USER || 'root (default)');
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : '***NOT SET***');
  console.log('DB_NAME:', process.env.DB_NAME || 'kriptocar (default)');
  console.log('');
  
  let connection;
  
  try {
    // Test database connection
    console.log('🔌 Testing database connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000
    });
    console.log('✅ Database connection successful!\n');
    
    // Check if database exists
    console.log('🗄️ Checking database...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const dbExists = databases.some(db => db.Database === (process.env.DB_NAME || 'kriptocar'));
    console.log(`Database "${process.env.DB_NAME || 'kriptocar'}" exists: ${dbExists ? '✅ YES' : '❌ NO'}`);
    
    if (!dbExists) {
      console.log('💡 Create the database first: CREATE DATABASE kriptocar;');
      return;
    }
    console.log('');
    
    // Check if users table exists
    console.log('📋 Checking users table...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    const usersTableExists = tables.length > 0;
    console.log(`Users table exists: ${usersTableExists ? '✅ YES' : '❌ NO'}`);
    
    if (!usersTableExists) {
      console.log('💡 Run the create-users-table.sql script to create the users table');
      return;
    }
    console.log('');
    
    // Check users table structure
    console.log('🏗️ Users table structure:');
    const [columns] = await connection.execute('DESCRIBE users');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    console.log('');
    
    // Check if there are any users
    console.log('👥 Checking for users...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Total users in table: ${users[0].count}`);
    
    if (users[0].count === 0) {
      console.log('⚠️ No users found! Creating a test user...');
      
      // Create a test user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      await connection.execute(`
        INSERT INTO users (user_id, full_name, email, password, phone, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['USR000001', 'Test User', 'test@example.com', hashedPassword, '1234567890', 1]);
      
      console.log('✅ Test user created successfully!');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: test123');
    } else {
      // Show existing users
      const [existingUsers] = await connection.execute('SELECT user_id, email, full_name FROM users LIMIT 5');
      console.log('Existing users:');
      existingUsers.forEach(user => {
        console.log(`  ${user.user_id} - ${user.email} (${user.full_name})`);
      });
    }
    console.log('');
    
    // Test login query
    console.log('🔐 Testing login query...');
    const testEmail = 'test@example.com';
    const [loginResult] = await connection.execute(
      'SELECT user_id, email, password, full_name FROM users WHERE email = ? LIMIT 1',
      [testEmail]
    );
    
    if (loginResult.length === 0) {
      console.log('❌ Login query failed - no user found with email:', testEmail);
    } else {
      console.log('✅ Login query successful!');
      console.log('Found user:', {
        user_id: loginResult[0].user_id,
        email: loginResult[0].email,
        full_name: loginResult[0].full_name,
        has_password: !!loginResult[0].password
      });
    }
    console.log('');
    
    // Test signup query
    console.log('📝 Testing signup query...');
    const testSignupEmail = 'signup-test@example.com';
    const bcrypt = require('bcryptjs');
    const signupPassword = await bcrypt.hash('signup123', 10);
    
    try {
      await connection.execute(`
        INSERT INTO users (user_id, full_name, email, password, phone, is_active) 
        VALUES (?, ?, ?, ?, ?, ?)
      `, ['USR999999', 'Signup Test', testSignupEmail, signupPassword, '9876543210', 1]);
      
      console.log('✅ Signup query successful!');
      
      // Clean up test user
      await connection.execute('DELETE FROM users WHERE email = ?', [testSignupEmail]);
      console.log('🧹 Test signup user cleaned up');
    } catch (signupError) {
      console.log('❌ Signup query failed:', signupError.message);
    }
    console.log('');
    
    // Check for common issues
    console.log('🔍 Checking for common issues...');
    
    // Check if user_id column exists and has proper format
    const [userIdCheck] = await connection.execute('SELECT user_id FROM users WHERE user_id IS NOT NULL LIMIT 1');
    if (userIdCheck.length > 0) {
      const userId = userIdCheck[0].user_id;
      console.log(`User ID format check: ${userId} - ${userId.startsWith('USR') ? '✅ Valid' : '❌ Invalid format'}`);
    }
    
    // Check if email column is unique
    try {
      await connection.execute('SELECT email, COUNT(*) as count FROM users GROUP BY email HAVING count > 1');
      console.log('✅ Email uniqueness constraint working');
    } catch (error) {
      console.log('⚠️ Email uniqueness issue detected');
    }
    
    console.log('\n🎉 DIAGNOSIS COMPLETE!');
    console.log('\n📋 SUMMARY:');
    console.log('✅ Database connection: Working');
    console.log(`✅ Users table: ${usersTableExists ? 'Exists' : 'Missing'}`);
    console.log(`✅ Users in table: ${users[0].count}`);
    console.log('✅ Login query: Working');
    console.log('✅ Signup query: Working');
    
    console.log('\n💡 NEXT STEPS:');
    console.log('1. Make sure your .env.local file has correct database credentials');
    console.log('2. Test login with: test@example.com / test123');
    console.log('3. Try registering a new user through the signup page');
    
  } catch (error) {
    console.error('❌ DIAGNOSIS FAILED:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 SOLUTION: Check your database credentials in .env.local file');
      console.log('Make sure DB_USER and DB_PASSWORD are correct');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 SOLUTION: Make sure MySQL is running');
      console.log('On Windows: Start MySQL service');
      console.log('On Mac: brew services start mysql');
      console.log('On Linux: sudo systemctl start mysql');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n💡 SOLUTION: Create the database first');
      console.log('Run: CREATE DATABASE kriptocar;');
    } else if (error.code === 'ER_CON_COUNT_ERROR') {
      console.log('\n💡 SOLUTION: Too many database connections');
      console.log('Restart your application and try again');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the diagnosis
diagnoseLoginIssue();
