// Database connection test script
require('dotenv').config({ path: '.env.local' });
const mysql = require('mysql2/promise');

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  
  try {
    // Create connection using environment variables
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connection successful!');

    // Test query to check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 Available tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });

    // Test products table
    try {
      const [products] = await connection.execute('SELECT COUNT(*) as count FROM kriptocar.products');
      console.log(`📦 Products count: ${products[0].count}`);
    } catch (error) {
      console.log('❌ Products table error:', error.message);
    }

    // Test services table
    try {
      const [services] = await connection.execute('SELECT COUNT(*) as count FROM kriptocar.services');
      console.log(`🔧 Services count: ${services[0].count}`);
    } catch (error) {
      console.log('❌ Services table error:', error.message);
    }

    // Test vendors table
    try {
      const [vendors] = await connection.execute('SELECT COUNT(*) as count FROM kriptocar.vendors');
      console.log(`🏪 Vendors count: ${vendors[0].count}`);
    } catch (error) {
      console.log('❌ Vendors table error:', error.message);
    }

    // Test users table
    try {
      const [users] = await connection.execute('SELECT COUNT(*) as count FROM kriptocar.users');
      console.log(`👥 Users count: ${users[0].count}`);
    } catch (error) {
      console.log('❌ Users table error:', error.message);
    }

    await connection.end();
    console.log('✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.log('\n💡 Please check your .env.local file has the correct database credentials:');
    console.log('   DB_HOST=localhost');
    console.log('   DB_USER=your_username');
    console.log('   DB_PASSWORD=your_password');
    console.log('   DB_NAME=kriptocar');
    console.log('   DB_PORT=3306');
  }
}

testDatabaseConnection(); 