const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kriptocar',
  charset: 'utf8mb4'
};

async function insertAdvertisementImage(id, imagePath, name) {
  let connection;
  
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Connect to database
    connection = await mysql.createConnection(dbConfig);
    
    // Insert or update the advertisement
    const query = `
      INSERT INTO advertisements (id, image, name) 
      VALUES (?, ?, ?) 
      ON DUPLICATE KEY UPDATE 
        image = VALUES(image), 
        name = VALUES(name)
    `;
    
    await connection.execute(query, [id, imageBuffer, name]);
    
    console.log(`✅ Successfully inserted advertisement ${id}: ${name}`);
    
  } catch (error) {
    console.error(`❌ Error inserting advertisement ${id}:`, error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('🚀 Starting advertisement image insertion...');
  
  // Example usage - replace with your actual image paths
  const advertisements = [
    {
      id: 1,
      imagePath: path.join(__dirname, 'public', 'pst1.png'),
      name: 'Advertisement 1'
    },
    {
      id: 2,
      imagePath: path.join(__dirname, 'public', 'pst2.png'),
      name: 'Advertisement 2'
    }
  ];
  
  for (const ad of advertisements) {
    if (fs.existsSync(ad.imagePath)) {
      await insertAdvertisementImage(ad.id, ad.imagePath, ad.name);
    } else {
      console.warn(`⚠️ Image file not found: ${ad.imagePath}`);
    }
  }
  
  console.log('🎉 Advertisement image insertion completed!');
}

// Run the script
main().catch(console.error);
