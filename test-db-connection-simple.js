const mysql = require('mysql2/promise');

async function testConnection() {
  let connection;
  
  try {
    console.log('🔍 Attempting to connect to database...');
    console.log('Host:', process.env.DB_HOST || 'localhost');
    console.log('User:', process.env.DB_USER || 'root');
    console.log('Database:', process.env.DB_NAME || 'kriptocar');
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('✅ Connected to database successfully!');

    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result);

    // Check if vendors table exists
    try {
      const [vendors] = await connection.execute('SELECT COUNT(*) as count FROM vendors');
      console.log('✅ Vendors table exists, count:', vendors[0].count);
    } catch (error) {
      console.log('❌ Vendors table error:', error.message);
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
