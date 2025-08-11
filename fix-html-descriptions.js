const mysql = require('mysql2/promise');

async function fixHtmlDescriptions() {
  console.log('🔧 Fixing HTML Descriptions in Database\n');

  let connection;
  
  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '82.29.162.35',
      user: process.env.DB_USER || 'kriptocar',
      password: process.env.DB_PASSWORD || 'kriptocar',
      database: process.env.DB_NAME || 'kriptocar',
      charset: 'utf8mb4'
    });

    console.log('✅ Database connection successful');

    // Function to clean HTML structure
    function cleanHtmlStructure(html) {
      if (!html) return html;
      
      // Remove empty divs and fix malformed structure
      let cleaned = html
        // Remove empty divs
        .replace(/<div>\s*<\/div>/g, '')
        // Remove multiple consecutive empty divs
        .replace(/(<div>\s*<\/div>\s*)+/g, '')
        // Fix unclosed ul tags
        .replace(/<ul>([^<]*(?:<li[^>]*>[^<]*<\/li>[^<]*)*)/g, '<ul>$1</ul>')
        // Remove extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      return cleaned;
    }

    // Get all products with descriptions
    console.log('📋 Fetching products with descriptions...');
    const [products] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description IS NOT NULL AND description != '' 
      ORDER BY product_id
    `);

    console.log(`📊 Found ${products.length} products with descriptions`);

    // Process each product
    for (const product of products) {
      console.log(`\n🔍 Processing: ${product.name} (ID: ${product.product_id})`);
      
      const originalDescription = product.description;
      const cleanedDescription = cleanHtmlStructure(originalDescription);
      
      // Check if HTML structure was improved
      const hasHtml = /<[^>]*>/.test(cleanedDescription);
      const hasBulletPoints = /<ul[^>]*>.*<\/ul>/s.test(cleanedDescription);
      
      console.log(`  Original length: ${originalDescription.length}`);
      console.log(`  Cleaned length: ${cleanedDescription.length}`);
      console.log(`  Contains HTML: ${hasHtml ? 'YES' : 'NO'}`);
      console.log(`  Has bullet points: ${hasBulletPoints ? 'YES' : 'NO'}`);
      
      // If the description was cleaned and improved, update it
      if (cleanedDescription !== originalDescription && cleanedDescription.length > 0) {
        console.log(`  ✅ Updating with cleaned HTML...`);
        
        await connection.execute(`
          UPDATE products 
          SET description = ? 
          WHERE product_id = ?
        `, [cleanedDescription, product.product_id]);
        
        console.log(`  ✅ Updated successfully`);
      } else {
        console.log(`  ℹ️ No changes needed`);
      }
    }

    // Create a properly formatted example for the problematic description
    console.log('\n📝 Creating properly formatted example...');
    const properHtmlDescription = `
      <div style="text-align: left;">
        <h3>Product Features:</h3>
        <ul>
          <li>Fabric seat cover set tailored for Honda Jazz for daily comfort and long-term use.</li>
          <li>Soft-touch breathable material ensures relaxed seating even during long drives.</li>
          <li>Resistant to shrinking, stretching, and color fading.</li>
          <li>Simple to install and maintain with removable, washable construction.</li>
          <li>Ideal for users looking for a practical and comfortable interior upgrade.</li>
        </ul>
        
        <h3>Key Benefits:</h3>
        <ul>
          <li><span style="color: #059669;">🛡️ Premium Quality</span> - High-grade fabric material</li>
          <li><span style="color: #2563eb;">🛠️ Easy Installation</span> - Simple to fit and remove</li>
          <li><span style="color: #dc2626;">🧼 Easy Maintenance</span> - Machine washable</li>
          <li><span style="color: #7c3aed;">🎯 Perfect Fit</span> - Tailored specifically for Honda Jazz</li>
        </ul>
        
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
          <p style="margin: 0;"><strong>💡 Installation Tip:</strong> Ensure the seat covers are properly aligned before securing for the best fit and appearance.</p>
        </div>
      </div>
    `;

    // Find a product to update with the proper example
    const [sampleProduct] = await connection.execute(`
      SELECT product_id, name 
      FROM products 
      WHERE name LIKE '%seat%' OR name LIKE '%cover%' OR name LIKE '%fabric%'
      LIMIT 1
    `);

    if (sampleProduct.length > 0) {
      const product = sampleProduct[0];
      console.log(`\n📝 Updating ${product.name} (ID: ${product.product_id}) with proper HTML structure...`);
      
      await connection.execute(`
        UPDATE products 
        SET description = ? 
        WHERE product_id = ?
      `, [properHtmlDescription, product.product_id]);
      
      console.log(`✅ Updated ${product.name} with proper HTML structure`);
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const [updatedProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description LIKE '%<ul>%' OR description LIKE '%<li>%'
      ORDER BY product_id
      LIMIT 5
    `);

    updatedProducts.forEach(product => {
      console.log(`\n--- ${product.name} (ID: ${product.product_id}) ---`);
      console.log(`Description Length: ${product.description.length}`);
      const hasHtml = /<[^>]*>/.test(product.description);
      const hasBulletPoints = /<ul[^>]*>.*<\/ul>/s.test(product.description);
      console.log(`Contains HTML: ${hasHtml ? 'YES' : 'NO'}`);
      console.log(`Has bullet points: ${hasBulletPoints ? 'YES' : 'NO'}`);
      
      if (hasBulletPoints) {
        const liCount = (product.description.match(/<li[^>]*>/g) || []).length;
        console.log(`Number of list items: ${liCount}`);
      }
    });

    console.log('\n✅ HTML descriptions fixed successfully!');
    console.log('🌐 The bullet points should now display correctly on the website.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the fix
fixHtmlDescriptions();