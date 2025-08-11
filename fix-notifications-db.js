const mysql = require('mysql2/promise');

async function fixNotificationsAndVendors() {
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

    // 1. Add description column to notifications table
    console.log('\n📝 Adding description column to notifications table...');
    try {
      await connection.execute(`
        ALTER TABLE notifications 
        ADD COLUMN IF NOT EXISTS description TEXT 
        AFTER message
      `);
      console.log('✅ Description column added to notifications table');
    } catch (error) {
      console.log('ℹ️ Description column already exists or error:', error.message);
    }

    // 2. Fix vendor IDs
    console.log('\n🏪 Fixing vendor IDs...');
    
    // Check current vendors
    const [currentVendors] = await connection.execute(
      'SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id'
    );
    console.log('📋 Current vendors:', currentVendors);

    // Add missing vendor IDs
    const vendorData = [
      ['VND1', 'Quick Fix Auto Services', 'vendor1@kriptocar.com', '+91-9876543220', '123 Service Lane, Auto Hub', 'Mumbai', 'Maharashtra', '400001', '400001,400002,400003'],
      ['VND2', 'Professional Car Care', 'vendor2@kriptocar.com', '+91-9876543221', '456 Service Center, Industrial Area', 'Delhi', 'Delhi', '110001', '110001,110002,110003'],
      ['VND3', 'Elite Auto Maintenance', 'vendor3@kriptocar.com', '+91-9876543222', '789 Service Plaza, Tech Park', 'Bangalore', 'Karnataka', '560001', '560001,560002,560003'],
      ['VND4', 'Express Auto Repair', 'vendor4@kriptocar.com', '+91-9876543223', '321 Service Complex, Business District', 'Hyderabad', 'Telangana', '500001', '500001,500002,500003'],
      ['VND5', 'Reliable Car Services', 'vendor5@kriptocar.com', '+91-9876543224', '654 Service Hub, Commercial Zone', 'Chennai', 'Tamil Nadu', '600001', '600001,600002,600003'],
      ['VND6', 'Noida Auto Services', 'vendor6@kriptocar.com', '+91-9876543225', '789 Noida Service Center, Sector 62', 'Noida', 'Uttar Pradesh', '201301', '201301,201302,201303'],
      ['VND7', 'Gurgaon Car Care', 'vendor7@kriptocar.com', '+91-9876543226', '456 Gurgaon Service Hub, Cyber City', 'Gurgaon', 'Haryana', '122001', '122001,122002,122003'],
      ['VND8', 'Delhi Auto Solutions', 'vendor8@kriptocar.com', '+91-9876543227', '123 Delhi Service Complex, Connaught Place', 'Delhi', 'Delhi', '110001', '110001,110004,110005']
    ];

    for (const vendor of vendorData) {
      try {
        await connection.execute(`
          INSERT INTO vendors (vendor_id, name, email, phone, address, city, state, pincode, service_areas) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            name = VALUES(name),
            email = VALUES(email),
            phone = VALUES(phone),
            address = VALUES(address),
            city = VALUES(city),
            state = VALUES(state),
            pincode = VALUES(pincode),
            service_areas = VALUES(service_areas)
        `, vendor);
        console.log(`✅ Added/updated vendor: ${vendor[0]} - ${vendor[1]}`);
      } catch (error) {
        console.log(`⚠️ Error with vendor ${vendor[0]}:`, error.message);
      }
    }

    // 3. Verify vendor VND1 exists
    console.log('\n🔍 Verifying vendor VND1...');
    const [vendorCheck] = await connection.execute(
      'SELECT vendor_id, name, email FROM vendors WHERE vendor_id = ?',
      ['VND1']
    );
    console.log('Vendor VND1 check:', vendorCheck);

    // 4. Show final vendor list
    console.log('\n📋 Final vendor list:');
    const [finalVendors] = await connection.execute(
      'SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id'
    );
    console.table(finalVendors);

    // 5. Show notifications table structure
    console.log('\n📝 Notifications table structure:');
    const [notificationsStructure] = await connection.execute('DESCRIBE notifications');
    console.table(notificationsStructure);

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
fixNotificationsAndVendors().then(() => {
  console.log('\n🎉 Notifications and vendors database fix completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

