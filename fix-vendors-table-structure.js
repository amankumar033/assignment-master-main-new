const mysql = require('mysql2/promise');

async function fixVendorsTableStructure() {
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

    // 1. Check current vendors table structure
    console.log('\n📋 Checking current vendors table structure...');
    try {
      const [structure] = await connection.execute('DESCRIBE vendors');
      console.table(structure);
    } catch (error) {
      console.log('❌ Error checking vendors table structure:', error.message);
    }

    // 2. Check if name column exists
    console.log('\n🔍 Checking if name column exists...');
    try {
      const [columns] = await connection.execute("SHOW COLUMNS FROM vendors LIKE 'name'");
      if (columns.length === 0) {
        console.log('❌ Name column does not exist, adding it...');
        
        // Add name column
        await connection.execute(`
          ALTER TABLE vendors 
          ADD COLUMN name varchar(255) NOT NULL DEFAULT 'Vendor' 
          AFTER vendor_id
        `);
        console.log('✅ Name column added successfully');
        
        // Update existing vendors with proper names
        const vendorNames = {
          'VND1': 'Quick Fix Auto Services',
          'VND2': 'Professional Car Care',
          'VND3': 'Elite Auto Maintenance',
          'VND4': 'Express Auto Repair',
          'VND5': 'Reliable Car Services',
          'VND6': 'Noida Auto Services',
          'VND7': 'Gurgaon Car Care',
          'VND8': 'Delhi Auto Solutions'
        };
        
        for (const [vendorId, name] of Object.entries(vendorNames)) {
          try {
            await connection.execute(
              'UPDATE vendors SET name = ? WHERE vendor_id = ?',
              [name, vendorId]
            );
            console.log(`✅ Updated vendor ${vendorId} with name: ${name}`);
          } catch (error) {
            console.log(`⚠️ Error updating vendor ${vendorId}:`, error.message);
          }
        }
      } else {
        console.log('✅ Name column already exists');
      }
    } catch (error) {
      console.log('❌ Error checking/adding name column:', error.message);
    }

    // 3. Show final vendors table structure
    console.log('\n📋 Final vendors table structure:');
    try {
      const [finalStructure] = await connection.execute('DESCRIBE vendors');
      console.table(finalStructure);
    } catch (error) {
      console.log('❌ Error showing final structure:', error.message);
    }

    // 4. Show sample vendor data
    console.log('\n📋 Sample vendor data:');
    try {
      const [vendors] = await connection.execute('SELECT vendor_id, name, email FROM vendors LIMIT 5');
      console.table(vendors);
    } catch (error) {
      console.log('❌ Error showing vendor data:', error.message);
    }

    // 5. Test vendor lookup
    console.log('\n🧪 Testing vendor lookup for VND1...');
    try {
      const [vendorCheck] = await connection.execute(
        'SELECT vendor_id, name, email FROM vendors WHERE vendor_id = ?',
        ['VND1']
      );
      console.log('Vendor VND1 lookup result:', vendorCheck);
      
      if (vendorCheck.length > 0) {
        console.log('✅ Vendor VND1 found successfully!');
        console.log('Vendor details:', vendorCheck[0]);
      } else {
        console.log('❌ Vendor VND1 not found!');
      }
    } catch (error) {
      console.log('❌ Error testing vendor lookup:', error.message);
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

// Run the fix
fixVendorsTableStructure().then(() => {
  console.log('\n🎉 Vendors table structure fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

