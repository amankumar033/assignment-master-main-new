const mysql = require('mysql2/promise');

async function testSimpleConnection() {
  let connection;
  
  try {
    console.log('🔍 Testing simple database connection...');
    
    // Try to connect without specifying database first
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: ''
    });

    console.log('✅ Connected to MySQL server successfully!');

    // List databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('Available databases:');
    databases.forEach(db => console.log('  -', db.Database));

    // Try to connect to kriptocar database
    await connection.execute('USE kriptocar');
    console.log('✅ Connected to kriptocar database');

    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result);

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

testSimpleConnection();
