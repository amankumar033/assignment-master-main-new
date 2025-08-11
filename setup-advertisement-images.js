const mysql = require('mysql2/promise');

async function setupAdvertisementImages() {
  let connection;
  
  try {
    // Create connection using same config as main app
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar',
      charset: 'utf8mb4'
    });

    console.log('🔗 Connected to database');

    // Create advertisement_images table
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS \`kriptocar\`.\`advertisement_images\` (
        \`id\` int(11) NOT NULL AUTO_INCREMENT,
        \`image\` varchar(255) NOT NULL,
        \`name\` varchar(255) NOT NULL,
        \`created_at\` datetime DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `;

    await connection.execute(createTableSQL);
    console.log('✅ Advertisement images table created/verified');

    // Insert sample data
    const insertDataSQL = `
      INSERT INTO \`kriptocar\`.\`advertisement_images\` (\`id\`, \`image\`, \`name\`) VALUES
      (1, '/pst1.png', 'Advertisement 1'),
      (2, '/pst2.png', 'Advertisement 2')
      ON DUPLICATE KEY UPDATE 
        \`image\` = VALUES(\`image\`),
        \`name\` = VALUES(\`name\`);
    `;

    await connection.execute(insertDataSQL);
    console.log('✅ Sample advertisement data inserted');

    // Verify the data
    const [rows] = await connection.execute('SELECT * FROM kriptocar.advertisement_images ORDER BY id');
    console.log('📋 Current advertisement images:');
    rows.forEach(row => {
      console.log(`  ID: ${row.id}, Image: ${row.image}, Name: ${row.name}`);
    });

  } catch (error) {
    console.error('❌ Error setting up advertisement images:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

setupAdvertisementImages();
