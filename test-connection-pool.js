const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function testConnectionPool() {
  console.log('🔧 TESTING CONNECTION POOL SETTINGS...\n');
  
  try {
    // Create a pool with the same settings as our app
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      waitForConnections: true,
      connectionLimit: 3, // Same as our app
      queueLimit: 0,
      charset: 'utf8mb4',
      multipleStatements: false,
      idleTimeout: 20000,
    });
    
    console.log('✅ Connection pool created');
    console.log('📊 Pool configuration:');
    console.log(`  Connection limit: ${pool.config.connectionLimit}`);
    console.log(`  Queue limit: ${pool.config.queueLimit}`);
    console.log(`  Idle timeout: ${pool.config.idleTimeout}ms`);
    
    // Test multiple concurrent connections
    console.log('\n🧪 Testing concurrent connections...');
    const promises = [];
    
    for (let i = 1; i <= 5; i++) {
      promises.push(
        (async () => {
          const connection = await pool.getConnection();
          console.log(`  Connection ${i} acquired`);
          
          // Simulate some work
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const [result] = await connection.execute('SELECT 1 as test');
          console.log(`  Connection ${i} executed query:`, result[0]);
          
          connection.release();
          console.log(`  Connection ${i} released`);
          return i;
        })()
      );
    }
    
    const results = await Promise.all(promises);
    console.log(`✅ All ${results.length} connections completed successfully`);
    
    // Check current connections
    console.log('\n📊 Checking current connections...');
    const connection = await pool.getConnection();
    const [processList] = await connection.execute('SHOW PROCESSLIST');
    connection.release();
    
    const userConnections = processList.filter((conn: any) => 
      conn.User === (process.env.DB_USER || 'root') && 
      conn.Command !== 'Sleep'
    );
    
    console.log(`Active user connections: ${userConnections.length}`);
    
    // Close the pool
    await pool.end();
    console.log('✅ Pool closed successfully');
    
    console.log('\n🎉 CONNECTION POOL TEST COMPLETE!');
    console.log('✅ The pool configuration is working correctly');
    console.log('✅ No connection limit errors occurred');
    console.log('✅ All connections were properly managed');
    
  } catch (error) {
    console.error('❌ Connection pool test failed:', error.message);
  }
}

testConnectionPool();
