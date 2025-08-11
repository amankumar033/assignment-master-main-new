const mysql = require('mysql2/promise');

async function checkVendorsTable() {
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
    const [structure] = await connection.execute('DESCRIBE vendors');
    console.table(structure);

    // 2. Check if vendors table exists and has data
    console.log('\n📋 Checking vendors table data...');
    try {
      const [vendors] = await connection.execute('SELECT * FROM vendors LIMIT 5');
      console.log('Vendors found:', vendors.length);
      console.table(vendors);
    } catch (error) {
      console.log('❌ Error reading vendors table:', error.message);
    }

    // 3. Try to create vendors table if it doesn't exist
    console.log('\n🏗️ Creating vendors table if it doesn\'t exist...');
    try {
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS vendors (
          vendor_id varchar(20) NOT NULL,
          name varchar(255) NOT NULL,
          email varchar(255) NOT NULL,
          phone varchar(20) DEFAULT NULL,
          address text,
          city varchar(100) DEFAULT NULL,
          state varchar(100) DEFAULT NULL,
          pincode varchar(10) DEFAULT NULL,
          service_areas text,
          is_active tinyint(1) DEFAULT 1,
          created_at timestamp DEFAULT CURRENT_TIMESTAMP,
          updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (vendor_id),
          UNIQUE KEY unique_vendor_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('✅ Vendors table created/verified');
    } catch (error) {
      console.log('⚠️ Error creating vendors table:', error.message);
    }

    // 4. Insert vendor data
    console.log('\n📝 Inserting vendor data...');
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
        console.log(`❌ Error with vendor ${vendor[0]}:`, error.message);
      }
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

    // 6. Show final vendor list
    console.log('\n📋 Final vendor list:');
    try {
      const [finalVendors] = await connection.execute(
        'SELECT vendor_id, name, email FROM vendors ORDER BY vendor_id'
      );
      console.table(finalVendors);
    } catch (error) {
      console.log('❌ Error showing final vendor list:', error.message);
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

// Run the check
checkVendorsTable().then(() => {
  console.log('\n🎉 Vendors table check completed!');
  process.exit(0);
}).catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});

