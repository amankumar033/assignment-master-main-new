require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function diagnoseDatabaseConnection() {
  console.log('🔍 Database Connection Diagnostics');
  console.log('=====================================');
  
  // Check environment variables
  console.log('\n📋 Environment Variables:');
  console.log('DB_HOST:', process.env.DB_HOST);
  console.log('DB_USER:', process.env.DB_USER);
  console.log('DB_NAME:', process.env.DB_NAME);
  console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***SET***' : 'NOT SET');
  
  // Test network connectivity
  console.log('\n🌐 Network Connectivity Test:');
  const { exec } = require('child_process');
  
  try {
    const pingResult = await new Promise((resolve, reject) => {
      exec(`ping -n 1 ${process.env.DB_HOST}`, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
    console.log('✅ Ping successful');
  } catch (error) {
    console.log('❌ Ping failed:', error.message);
  }
  
  // Test MySQL port
  console.log('\n🔌 MySQL Port Test:');
  try {
    const net = require('net');
    const socket = new net.Socket();
    
    const portTest = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timeout'));
      }, 5000);
      
      socket.connect(3306, process.env.DB_HOST, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
    
    console.log('✅ MySQL port 3306 is accessible');
  } catch (error) {
    console.log('❌ MySQL port 3306 is not accessible:', error.message);
  }
  
  // Test database connection
  console.log('\n🗄️ Database Connection Test:');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      connectTimeout: 10000,
    });
    
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    console.log('✅ Test query successful:', result);
    
    // Check tables
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('✅ Available tables:', tables.map(t => Object.values(t)[0]));
    
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('Error code:', error.code);
    
    // Provide suggestions based on error
    if (error.code === 'ETIMEDOUT') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check if the database server is running');
      console.log('2. Verify the database host and port');
      console.log('3. Check firewall settings');
      console.log('4. Ensure the database server allows remote connections');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Suggestions:');
      console.log('1. The database server is not running');
      console.log('2. MySQL service is not started');
      console.log('3. Wrong port number');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n💡 Suggestions:');
      console.log('1. Check username and password');
      console.log('2. Verify user permissions');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Connection closed');
    }
  }
  
  console.log('\n=====================================');
  console.log('🔍 Diagnostics complete');
}

diagnoseDatabaseConnection().catch(console.error);
