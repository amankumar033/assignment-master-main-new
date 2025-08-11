const mysql = require('mysql2/promise');

async function fixDatabaseConnections() {
  let connection;
  
  try {
    // Create a direct connection to kill other connections
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your password if needed
      database: 'kriptocar'
    });

    console.log('🔍 Connected to database');

    // 1. Show current process list
    console.log('\n📋 Current database connections:');
    try {
      const [processList] = await connection.execute('SHOW PROCESSLIST');
      console.table(processList);
    } catch (error) {
      console.log('❌ Error showing process list:', error.message);
    }

    // 2. Kill all connections for the current user (except this one)
    console.log('\n🔪 Killing existing connections...');
    try {
      const [processList] = await connection.execute('SHOW PROCESSLIST');
      const currentUser = 'root'; // Change if using different user
      const currentConnectionId = connection.threadId;
      
      let killedCount = 0;
      for (const process of processList) {
        if (process.User === currentUser && process.Id !== currentConnectionId && process.Command !== 'Daemon') {
          try {
            await connection.execute(`KILL ${process.Id}`);
            console.log(`✅ Killed connection ${process.Id} (${process.Info || 'No query'})`);
            killedCount++;
          } catch (killError) {
            console.log(`⚠️ Could not kill connection ${process.Id}:`, killError.message);
          }
        }
      }
      console.log(`🎯 Killed ${killedCount} connections`);
    } catch (error) {
      console.log('❌ Error killing connections:', error.message);
    }

    // 3. Show remaining connections
    console.log('\n📋 Remaining connections after cleanup:');
    try {
      const [remainingProcesses] = await connection.execute('SHOW PROCESSLIST');
      console.table(remainingProcesses);
    } catch (error) {
      console.log('❌ Error showing remaining processes:', error.message);
    }

    // 4. Check MySQL variables
    console.log('\n⚙️ MySQL connection settings:');
    try {
      const [variables] = await connection.execute("SHOW VARIABLES LIKE '%max_connections%'");
      console.table(variables);
      
      const [status] = await connection.execute("SHOW STATUS LIKE '%connections%'");
      console.table(status);
    } catch (error) {
      console.log('❌ Error checking MySQL variables:', error.message);
    }

    console.log('\n✅ Database connection cleanup completed!');
    console.log('🔄 Please restart your development server (npm run dev) to use the new connection pool settings.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the fix
fixDatabaseConnections().then(() => {
  console.log('\n🎉 Database connection fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});
