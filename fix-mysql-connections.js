const mysql = require('mysql2/promise');

async function fixMySQLConnections() {
  let connection;
  
  try {
    // Create a direct connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your password if needed
      database: 'kriptocar'
    });

    console.log('🔍 Connected to database');

    // 1. Check current MySQL settings
    console.log('\n📋 Current MySQL connection settings:');
    try {
      const [variables] = await connection.execute("SHOW VARIABLES LIKE '%max_connections%'");
      console.table(variables);
      
      const [status] = await connection.execute("SHOW STATUS LIKE '%connections%'");
      console.table(status);
      
      const [waitTimeout] = await connection.execute("SHOW VARIABLES LIKE 'wait_timeout'");
      console.table(waitTimeout);
      
      const [interactiveTimeout] = await connection.execute("SHOW VARIABLES LIKE 'interactive_timeout'");
      console.table(interactiveTimeout);
    } catch (error) {
      console.log('❌ Error checking MySQL settings:', error.message);
    }

    // 2. Show current process list
    console.log('\n📋 Current database connections:');
    try {
      const [processList] = await connection.execute('SHOW PROCESSLIST');
      const userConnections = processList.filter(conn => 
        conn.User === 'root' && conn.Command !== 'Daemon'
      );
      console.log(`Total connections: ${processList.length}`);
      console.log(`User connections: ${userConnections.length}`);
      console.table(userConnections);
    } catch (error) {
      console.log('❌ Error showing process list:', error.message);
    }

    // 3. Kill idle connections
    console.log('\n🔪 Killing idle connections...');
    try {
      const [processList] = await connection.execute('SHOW PROCESSLIST');
      const currentConnectionId = connection.threadId;
      
      let killedCount = 0;
      for (const process of processList) {
        if (process.User === 'root' && 
            process.Id !== currentConnectionId && 
            process.Command !== 'Daemon' &&
            process.Command === 'Sleep' &&
            process.Time > 30) { // Kill connections sleeping for more than 30 seconds
          try {
            await connection.execute(`KILL ${process.Id}`);
            console.log(`✅ Killed idle connection ${process.Id} (sleeping for ${process.Time}s)`);
            killedCount++;
          } catch (killError) {
            console.log(`⚠️ Could not kill connection ${process.Id}:`, killError.message);
          }
        }
      }
      console.log(`🎯 Killed ${killedCount} idle connections`);
    } catch (error) {
      console.log('❌ Error killing idle connections:', error.message);
    }

    // 4. Try to increase max_connections (if we have privileges)
    console.log('\n⚙️ Attempting to increase max_connections...');
    try {
      await connection.execute('SET GLOBAL max_connections = 50');
      console.log('✅ Successfully set max_connections to 50');
      
      // Verify the change
      const [newMaxConn] = await connection.execute("SHOW VARIABLES LIKE 'max_connections'");
      console.log('New max_connections value:', newMaxConn[0].Value);
    } catch (error) {
      console.log('⚠️ Could not increase max_connections (insufficient privileges):', error.message);
      console.log('💡 You may need to edit MySQL configuration file (my.ini/my.cnf) manually');
    }

    // 5. Show final status
    console.log('\n📋 Final connection status:');
    try {
      const [finalProcessList] = await connection.execute('SHOW PROCESSLIST');
      const finalUserConnections = finalProcessList.filter(conn => 
        conn.User === 'root' && conn.Command !== 'Daemon'
      );
      console.log(`Total connections: ${finalProcessList.length}`);
      console.log(`User connections: ${finalUserConnections.length}`);
    } catch (error) {
      console.log('❌ Error showing final status:', error.message);
    }

    console.log('\n✅ MySQL connection optimization completed!');
    console.log('🔄 Please restart your development server (npm run dev) to use the new settings.');

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
fixMySQLConnections().then(() => {
  console.log('\n🎉 MySQL connection fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Fix failed:', error);
  process.exit(1);
});

