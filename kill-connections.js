const mysql = require('mysql2/promise');

async function killAllConnections() {
  let connection;
  
  try {
    console.log('🔪 KILLING ALL DATABASE CONNECTIONS...\n');
    
    // Create a direct connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'kriptocar'
    });

    console.log('✅ Connected to database');

    // Get all processes
    const [processList] = await connection.execute('SHOW PROCESSLIST');
    console.log(`📊 Found ${processList.length} total connections`);

    // Kill all user connections except our own
    let killedCount = 0;
    const currentId = connection.threadId;

    for (const process of processList) {
      if (process.User === 'root' && process.Id !== currentId && process.Command !== 'Daemon') {
        try {
          await connection.execute(`KILL ${process.Id}`);
          console.log(`✅ Killed connection ${process.Id}`);
          killedCount++;
        } catch (error) {
          console.log(`⚠️ Could not kill ${process.Id}: ${error.message}`);
        }
      }
    }

    console.log(`\n🎯 Successfully killed ${killedCount} connections`);
    console.log('🔄 Please restart your development server (npm run dev)');
    console.log('💡 The connection pool is now set to only 5 connections max');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

killAllConnections().then(() => {
  console.log('\n🎉 Connection cleanup completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Cleanup failed:', error);
  process.exit(1);
});
