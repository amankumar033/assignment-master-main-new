require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Attempting to connect to database...');
    console.log('Host:', process.env.DB_HOST);
    console.log('User:', process.env.DB_USER);
    console.log('Database:', process.env.DB_NAME);
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
      acquireTimeout: 10000,
      timeout: 10000,
    });

    console.log('✅ Connected to database successfully!');

    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result);

    // Check if categories table exists
    try {
      const [categories] = await connection.execute('SELECT COUNT(*) as count FROM categories');
      console.log('✅ Categories table exists, count:', categories[0].count);
    } catch (error) {
      console.log('❌ Categories table error:', error.message);
    }

    // Check if products table exists
    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM products');
      console.log('✅ Products table exists, count:', products[0].count);
    } catch (error) {
      console.log('❌ Products table error:', error.message);
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Connection closed');
    }
  }
}

testConnection();
