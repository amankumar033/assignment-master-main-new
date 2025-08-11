const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kriptocar',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

async function testLoginFunctionality() {
  let connection;
  
  try {
    console.log('🔍 Testing login functionality...');
    
    // Test database connection
    console.log('📡 Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database connection successful');
    
    // Check if users table exists
    console.log('📋 Checking if users table exists...');
    const [tables] = await connection.execute('SHOW TABLES LIKE "users"');
    
    if (tables.length === 0) {
      console.log('❌ Users table does not exist!');
      console.log('💡 Please run the create-users-table.sql script first');
      return;
    }
    
    console.log('✅ Users table exists');
    
    // Check if there are any users in the table
    console.log('👥 Checking for users in the table...');
    const [users] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`📊 Found ${users[0].count} users in the table`);
    
    if (users[0].count === 0) {
      console.log('⚠️ No users found in the table');
      console.log('💡 Please run the create-users-table.sql script to add a test user');
      return;
    }
    
    // Test login query (same as in the login API)
    console.log('🔐 Testing login query...');
    const testEmail = 'test@example.com';
    const [loginResult] = await connection.execute(
      'SELECT user_id, email, password, full_name, phone, address, city, state, pincode, created_at, updated_at, is_active, last_login FROM users WHERE email = ? LIMIT 1',
      [testEmail]
    );
    
    if (loginResult.length === 0) {
      console.log('❌ Test user not found in database');
      console.log('💡 Please run the create-users-table.sql script to add a test user');
      return;
    }
    
    console.log('✅ Login query successful');
    console.log('📋 User found:', {
      user_id: loginResult[0].user_id,
      email: loginResult[0].email,
      full_name: loginResult[0].full_name,
      has_password: !!loginResult[0].password
    });
    
    console.log('🎉 Login functionality test completed successfully!');
    console.log('💡 You can now test login with:');
    console.log('   Email: test@example.com');
    console.log('   Password: test123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Check your database credentials in .env.local file');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure MySQL is running');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database "kriptocar" does not exist. Please create it first');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the test
testLoginFunctionality();

