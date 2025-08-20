const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function showUsersTableStructure() {
  console.log('📋 USERS TABLE STRUCTURE\n');
  
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });
    
    console.log('✅ Database connected');
    
    // Get table structure
    console.log('🏗️ Users table structure:');
    const [columns] = await connection.execute('DESCRIBE users');
    
    console.log('\n┌─────────────────────┬─────────────────────┬─────┬─────┬─────────┬─────────────────┐');
    console.log('│ Field               │ Type                │ Null│ Key │ Default │ Extra           │');
    console.log('├─────────────────────┼─────────────────────┼─────┼─────┼─────────┼─────────────────┤');
    
    columns.forEach(col => {
      const field = col.Field.padEnd(19);
      const type = col.Type.padEnd(19);
      const null_ = col.Null === 'YES' ? 'YES' : 'NO ';
      const key = col.Key || '   ';
      const default_ = (col.Default || '').toString().padEnd(9);
      const extra = col.Extra || '   ';
      
      console.log(`│ ${field}│ ${type}│ ${null_} │ ${key} │ ${default_}│ ${extra}           │`);
    });
    
    console.log('└─────────────────────┴─────────────────────┴─────┴─────┴─────────┴─────────────────┘');
    
    // Get table info
    console.log('\n📊 Table Information:');
    const [tableInfo] = await connection.execute("SHOW TABLE STATUS LIKE 'users'");
    if (tableInfo.length > 0) {
      const info = tableInfo[0];
      console.log(`   Engine: ${info.Engine}`);
      console.log(`   Rows: ${info.Rows}`);
      console.log(`   Data Length: ${info.Data_length} bytes`);
      console.log(`   Index Length: ${info.Index_length} bytes`);
      console.log(`   Auto Increment: ${info.Auto_increment || 'N/A'}`);
      console.log(`   Create Time: ${info.Create_time}`);
      console.log(`   Update Time: ${info.Update_time}`);
    }
    
    // Get indexes
    console.log('\n🔍 Indexes:');
    const [indexes] = await connection.execute("SHOW INDEX FROM users");
    indexes.forEach(index => {
      console.log(`   ${index.Key_name} (${index.Column_name}) - ${index.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'}`);
    });
    
    // Get sample data
    console.log('\n👥 Sample Users (first 5):');
    const [users] = await connection.execute('SELECT user_id, email, full_name, phone, is_active FROM users LIMIT 5');
    
    if (users.length === 0) {
      console.log('   No users found in the table');
    } else {
      console.log('\n┌─────────────┬─────────────────────┬─────────────────────┬─────────────┬─────────┐');
      console.log('│ User ID     │ Email               │ Full Name            │ Phone       │ Active  │');
      console.log('├─────────────┼─────────────────────┼─────────────────────┼─────────────┼─────────┤');
      
      users.forEach(user => {
        const userId = (user.user_id || 'N/A').padEnd(11);
        const email = (user.email || 'N/A').padEnd(19);
        const fullName = (user.full_name || 'N/A').padEnd(19);
        const phone = (user.phone || 'N/A').padEnd(11);
        const active = user.is_active ? 'Yes' : 'No ';
        
        console.log(`│ ${userId}│ ${email}│ ${fullName}│ ${phone}│ ${active}    │`);
      });
      
      console.log('└─────────────┴─────────────────────┴─────────────────────┴─────────────┴─────────┘');
    }
    
    // Get total count
    const [countResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
    console.log(`\n📈 Total users in table: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('\n💡 The users table does not exist. You may need to run the database setup scripts.');
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Database connection closed');
    }
  }
}

// Run the script
showUsersTableStructure().catch(console.error);
