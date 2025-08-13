const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function createTestUser() {
  console.log('👤 CREATING TEST USER...\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });
    
    console.log('✅ Database connected');
    
    // Check existing users
    const [existingUsers] = await connection.execute('SELECT user_id, email, full_name FROM users LIMIT 10');
    console.log('📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  ${user.user_id} - ${user.email} (${user.full_name})`);
    });
    
    // Create test user
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Generate next user ID using dynamic padding (max two zeros)
    const [allIds] = await connection.execute('SELECT user_id FROM users ORDER BY user_id');
    const numbers = (allIds as any[])
      .map((row: any) => row.user_id)
      .filter((id: string) => /^USR\d+$/.test(id))
      .map((id: string) => parseInt(id.slice(3).replace(/^0+/, '') || '0'))
      .filter((n: number) => n > 0)
      .sort((a: number, b: number) => a - b);
    let nextNum = 1;
    for (let i = 1; i <= Math.max(...numbers, 0) + 10; i++) {
      if (!numbers.includes(i)) { nextNum = i; break; }
    }
    const pad = nextNum >= 100 ? 0 : nextNum >= 10 ? 1 : 2;
    const newUserId = `USR${nextNum.toString().padStart(pad, '0')}`;
    
    await connection.execute(`
      INSERT INTO users (user_id, full_name, email, password, phone, is_active) 
      VALUES (?, ?, ?, ?, ?, ?)
    `, [newUserId, 'Test User', 'test@example.com', hashedPassword, '1234567890', 1]);
    
    console.log('\n✅ Test user created successfully!');
    console.log(`📧 Email: test@example.com`);
    console.log(`🔑 Password: test123`);
    console.log(`🆔 User ID: ${newUserId}`);
    
    // Verify the user was created
    const [verifyUser] = await connection.execute(
      'SELECT user_id, email, full_name FROM users WHERE email = ?',
      ['test@example.com']
    );
    
    if (verifyUser.length > 0) {
      console.log('\n✅ User verification successful!');
      console.log('You can now test login with:');
      console.log('  Email: test@example.com');
      console.log('  Password: test123');
    }
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('⚠️ User with email test@example.com already exists');
      console.log('You can use these credentials to test login:');
      console.log('  Email: test@example.com');
      console.log('  Password: test123');
    } else {
      console.error('❌ Error creating test user:', error.message);
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTestUser();
