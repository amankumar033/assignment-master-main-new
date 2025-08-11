const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function resetDatabaseConnections() {
  console.log('🔄 RESETTING DATABASE CONNECTIONS...\n');
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      connectTimeout: 10000,
    });
    console.log('✅ Connected to database');

    console.log('📋 Checking current connections...');
    const [processList] = await connection.execute('SHOW PROCESSLIST');

    const userConnections = processList.filter((conn) =>
      conn.User === (process.env.DB_USER || 'root') && conn.Id !== connection.threadId
    );

    console.log(`Found ${userConnections.length} connections for user ${process.env.DB_USER || 'root'}`);

    for (const conn of userConnections) {
      try {
        console.log(`🔪 Killing connection ${conn.Id} (${conn.Command})`);
        await connection.execute(`KILL ${conn.Id}`);
      } catch (killError) {
        console.log(`⚠️ Could not kill connection ${conn.Id}: ${killError.message}`);
      }
    }

    console.log('✅ Kill commands issued');
    await new Promise((r) => setTimeout(r, 1500));

    const [finalProcessList] = await connection.execute('SHOW PROCESSLIST');
    const finalUserConnections = finalProcessList.filter((conn) =>
      conn.User === (process.env.DB_USER || 'root')
    );
    console.log(`📊 Final connection count for user: ${finalUserConnections.length}`);

    console.log('\n🎉 DATABASE CONNECTIONS RESET COMPLETE!');
    console.log('\n💡 NEXT STEPS:');
    console.log('1) Restart your Next.js dev server (npm run dev)');
    console.log('2) If issue persists, increase MySQL global max_connections and wait_timeout');
  } catch (error) {
    console.error('❌ Error resetting connections:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

resetDatabaseConnections();
