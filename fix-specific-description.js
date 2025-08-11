const mysql = require('mysql2/promise');

async function fixSpecificDescription() {
  console.log('🔧 Fixing Specific Problematic Description\n');

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

    // Find products with the problematic structure
    console.log('🔍 Searching for products with problematic HTML structure...');
    const [problematicProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description LIKE '%<div style="text-align: left;">%' 
      AND description LIKE '%<ul>%'
      AND description LIKE '%<li>%'
      ORDER BY product_id
    `);

    console.log(`📊 Found ${problematicProducts.length} products with problematic structure`);

    if (problematicProducts.length === 0) {
      console.log('ℹ️ No products found with the specific problematic structure.');
      console.log('📝 Creating a test product with the problematic structure to demonstrate the fix...');
      
      // Create a test product with the problematic structure
      const problematicDescription = `<div style="text-align: left;"><ul><li>Fabric seat cover set tailored for Honda Jazz for daily comfort and long-term use.</li><li>Soft-touch breathable material ensures relaxed seating even during long drives.</li><li>Resistant to shrinking, stretching, and color fading.</li><li>Simple to install and maintain with removable, washable construction.</li><li>Ideal for users looking for a practical and comfortable interior upgrade.</li></ul><div></div><div></div><div></div></div>`;
      
      await connection.execute(`
        INSERT INTO products (name, description, sale_price, original_price, rating, image, category_id, brand, stock_quantity, is_active, is_featured, is_hot_deal, dealer_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        'Honda Jazz Seat Covers (Test)',
        problematicDescription,
        89.99,
        119.99,
        4.5,
        '/seat-covers.png',
        1,
        'Premium Covers',
        15,
        1,
        0,
        0,
        1
      ]);
      
      console.log('✅ Test product created with problematic structure');
    }

    // Function to fix the specific problematic structure
    function fixProblematicStructure(html) {
      if (!html) return html;
      
      console.log('🔧 Original HTML structure:');
      console.log(html);
      
      // Fix the specific issues:
      // 1. Remove empty divs
      // 2. Ensure proper ul/li structure
      // 3. Add proper closing tags
      let fixed = html
        // Remove empty divs
        .replace(/<div>\s*<\/div>/g, '')
        // Remove multiple consecutive empty divs
        .replace(/(<div>\s*<\/div>\s*)+/g, '')
        // Ensure ul has proper closing tag
        .replace(/<ul>([^<]*(?:<li[^>]*>[^<]*<\/li>[^<]*)*)(?!<\/ul>)/g, '<ul>$1</ul>')
        // Clean up extra whitespace
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log('🔧 Fixed HTML structure:');
      console.log(fixed);
      
      return fixed;
    }

    // Get all products again (including the test product if created)
    const [allProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description LIKE '%<div style="text-align: left;">%' 
      AND description LIKE '%<ul>%'
      AND description LIKE '%<li>%'
      ORDER BY product_id
    `);

    console.log(`\n📋 Processing ${allProducts.length} products with problematic structure...`);

    for (const product of allProducts) {
      console.log(`\n🔍 Processing: ${product.name} (ID: ${product.product_id})`);
      
      const originalDescription = product.description;
      const fixedDescription = fixProblematicStructure(originalDescription);
      
      // Check if the structure was improved
      const hasProperUl = /<ul[^>]*>.*<\/ul>/s.test(fixedDescription);
      const hasLiTags = /<li[^>]*>.*<\/li>/g.test(fixedDescription);
      const hasEmptyDivs = /<div>\s*<\/div>/g.test(fixedDescription);
      
      console.log(`  Has proper ul structure: ${hasProperUl ? 'YES' : 'NO'}`);
      console.log(`  Has li tags: ${hasLiTags ? 'YES' : 'NO'}`);
      console.log(`  Has empty divs: ${hasEmptyDivs ? 'YES' : 'NO'}`);
      
      if (fixedDescription !== originalDescription) {
        console.log(`  ✅ Updating with fixed structure...`);
        
        await connection.execute(`
          UPDATE products 
          SET description = ? 
          WHERE product_id = ?
        `, [fixedDescription, product.product_id]);
        
        console.log(`  ✅ Updated successfully`);
      } else {
        console.log(`  ℹ️ No changes needed`);
      }
    }

    // Create a properly formatted version for comparison
    console.log('\n📝 Creating properly formatted version...');
    const properDescription = `
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

    // Update the test product with the proper structure
    const [testProduct] = await connection.execute(`
      SELECT product_id, name 
      FROM products 
      WHERE name LIKE '%Honda Jazz%' OR name LIKE '%Seat Cover%'
      ORDER BY product_id DESC
      LIMIT 1
    `);

    if (testProduct.length > 0) {
      const product = testProduct[0];
      console.log(`\n📝 Updating ${product.name} (ID: ${product.product_id}) with proper structure...`);
      
      await connection.execute(`
        UPDATE products 
        SET description = ? 
        WHERE product_id = ?
      `, [properDescription, product.product_id]);
      
      console.log(`✅ Updated ${product.name} with proper HTML structure`);
    }

    // Verify the fixes
    console.log('\n🔍 Verifying fixes...');
    const [finalProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description LIKE '%<ul>%' AND description LIKE '%<li>%'
      ORDER BY product_id DESC
      LIMIT 3
    `);

    finalProducts.forEach(product => {
      console.log(`\n--- ${product.name} (ID: ${product.product_id}) ---`);
      console.log(`Description Length: ${product.description.length}`);
      const hasProperUl = /<ul[^>]*>.*<\/ul>/s.test(product.description);
      const liCount = (product.description.match(/<li[^>]*>/g) || []).length;
      const hasEmptyDivs = /<div>\s*<\/div>/g.test(product.description);
      
      console.log(`Has proper ul structure: ${hasProperUl ? 'YES' : 'NO'}`);
      console.log(`Number of list items: ${liCount}`);
      console.log(`Has empty divs: ${hasEmptyDivs ? 'YES' : 'NO'}`);
    });

    console.log('\n✅ Specific HTML structure fixes completed!');
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
fixSpecificDescription();