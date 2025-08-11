const mysql = require('mysql2/promise');

async function testVendorEmail() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '', // Add your password if needed
      database: 'kriptocar'
    });

    console.log('🔍 Connected to database');

    // 1. Check vendors table structure
    console.log('\n📋 Checking vendors table structure...');
    try {
      const [structure] = await connection.execute('DESCRIBE vendors');
      console.table(structure);
    } catch (error) {
      console.log('❌ Error checking vendors table structure:', error.message);
    }

    // 2. Check vendor VND1 data
    console.log('\n🔍 Checking vendor VND1 data...');
    try {
      const [vendors] = await connection.execute(
        'SELECT vendor_id, name, email FROM vendors WHERE vendor_id = ?',
        ['VND1']
      );
      console.log('Vendor VND1 data:', vendors);
      
      if (vendors.length > 0) {
        const vendor = vendors[0];
        console.log('✅ Vendor VND1 found:');
        console.log('  - Vendor ID:', vendor.vendor_id);
        console.log('  - Name:', vendor.name);
        console.log('  - Email:', vendor.email);
        
        // Test if email is valid
        if (vendor.email && vendor.email.includes('@')) {
          console.log('✅ Vendor email appears valid');
        } else {
          console.log('❌ Vendor email appears invalid');
        }
      } else {
        console.log('❌ Vendor VND1 not found');
      }
    } catch (error) {
      console.log('❌ Error checking vendor data:', error.message);
    }

    // 3. Check email configuration
    console.log('\n📧 Checking email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');

    // 4. Show all vendors
    console.log('\n📋 All vendors in database:');
    try {
      const [allVendors] = await connection.execute('SELECT vendor_id, name, email FROM vendors');
      console.table(allVendors);
    } catch (error) {
      console.log('❌ Error showing all vendors:', error.message);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the test
testVendorEmail().then(() => {
  console.log('\n🎉 Vendor email test completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});

