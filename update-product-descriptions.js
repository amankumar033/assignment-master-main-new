const mysql = require('mysql2/promise');

async function updateProductDescriptions() {
  console.log('🔧 Updating Product Descriptions with HTML\n');

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

    // HTML descriptions for different products
    const htmlDescriptions = [
      {
        product_id: 3,
        name: 'Premium Engine Oil',
        description: `
          <h2>Premium Engine Oil Features</h2>
          <p>High-quality <strong>synthetic engine oil</strong> designed for optimal engine performance and longevity.</p>
          
          <h3>Key Benefits:</h3>
          <ul>
            <li><span style="color: #2563eb;">🛡️ Superior Protection</span> - Advanced formula protects against wear and tear</li>
            <li><span style="color: #059669;">⚡ Enhanced Performance</span> - Improves engine efficiency and fuel economy</li>
            <li><span style="color: #dc2626;">🔥 Heat Resistance</span> - Maintains viscosity under extreme temperatures</li>
            <li><span style="color: #7c3aed;">🛠️ Extended Life</span> - Longer oil change intervals</li>
          </ul>
          
          <h3>Technical Specifications:</h3>
          <ul>
            <li><strong>Viscosity:</strong> 5W-30</li>
            <li><strong>API Rating:</strong> SN Plus</li>
            <li><strong>Capacity:</strong> 1 Quart</li>
            <li><strong>Compatibility:</strong> Gasoline and diesel engines</li>
          </ul>
          
          <blockquote style="border-left: 4px solid #f59e0b; padding-left: 1rem; margin: 1rem 0; background-color: #fef3c7; padding: 1rem; border-radius: 0.5rem;">
            <em>"This premium engine oil exceeds industry standards and provides exceptional engine protection for your vehicle."</em>
          </blockquote>
          
          <p><strong>Recommended for:</strong> Modern vehicles requiring synthetic oil, high-performance engines, and extended oil change intervals.</p>
        `
      },
      {
        product_id: 4,
        name: 'Brake Pad Set',
        description: `
          <h2>Ceramic Brake Pad Set</h2>
          <p>Premium <strong>ceramic brake pads</strong> for superior stopping power and quiet operation.</p>
          
          <h3>Performance Features:</h3>
          <ul>
            <li><span style="color: #dc2626;">🛑 Excellent Stopping Power</span> - High friction coefficient for reliable braking</li>
            <li><span style="color: #059669;">🔇 Low Noise</span> - Ceramic compound reduces brake squeal</li>
            <li><span style="color: #7c3aed;">🧹 Low Dust</span> - Minimal brake dust for cleaner wheels</li>
            <li><span style="color: #2563eb;">🛡️ Heat Resistant</span> - Maintains performance under high temperatures</li>
          </ul>
          
          <h3>Package Contents:</h3>
          <ul>
            <li>4 Brake Pads (Front or Rear)</li>
            <li>Brake Hardware Kit</li>
            <li>Installation Instructions</li>
            <li>Anti-Squeal Compound</li>
          </ul>
          
          <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
            <h4 style="color: #0c4a6e; margin-top: 0;">⚠️ Important Note:</h4>
            <p style="margin-bottom: 0;">Always replace brake pads in pairs (both sides) for optimal braking performance and safety.</p>
          </div>
          
          <p><strong>Warranty:</strong> 2-year limited warranty against manufacturing defects.</p>
        `
      },
      {
        product_id: 5,
        name: 'Air Filter',
        description: `
          <h2>High-Performance Air Filter</h2>
          <p>Advanced <strong>air filtration system</strong> for better engine breathing and performance.</p>
          
          <h3>Technology & Benefits:</h3>
          <ul>
            <li><span style="color: #059669;">🌬️ Improved Airflow</span> - Multi-layer design for optimal air intake</li>
            <li><span style="color: #dc2626;">🛡️ Superior Filtration</span> - Captures 99.5% of airborne particles</li>
            <li><span style="color: #2563eb;">⚡ Enhanced Performance</span> - Better fuel efficiency and power output</li>
            <li><span style="color: #7c3aed;">🛠️ Easy Maintenance</span> - Washable and reusable design</li>
          </ul>
          
          <h3>Filter Specifications:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Property</th>
              <th style="border: 1px solid #d1d5db; padding: 0.5rem; text-align: left;">Value</th>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;"><strong>Filtration Efficiency</strong></td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;">99.5%</td>
            </tr>
            <tr style="background-color: #f9fafb;">
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;"><strong>Material</strong></td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;">Cotton Gauze</td>
            </tr>
            <tr>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;"><strong>Lifespan</strong></td>
              <td style="border: 1px solid #d1d5db; padding: 0.5rem;">50,000 miles</td>
            </tr>
          </table>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0;">
            <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Clean your air filter every 15,000 miles for optimal performance and longevity.</p>
          </div>
        `
      }
    ];

    // Update each product
    for (const product of htmlDescriptions) {
      console.log(`\n📝 Updating product: ${product.name} (ID: ${product.product_id})`);
      
      await connection.execute(`
        UPDATE products 
        SET description = ? 
        WHERE product_id = ?
      `, [product.description, product.product_id]);
      
      console.log(`✅ Updated description for ${product.name}`);
    }

    // Verify the updates
    console.log('\n🔍 Verifying updates...');
    const [updatedProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE product_id IN (3, 4, 5)
      ORDER BY product_id
    `);

    updatedProducts.forEach(product => {
      console.log(`\n--- ${product.name} (ID: ${product.product_id}) ---`);
      console.log(`Description Length: ${product.description.length}`);
      const hasHtml = /<[^>]*>/.test(product.description);
      console.log(`Contains HTML: ${hasHtml ? 'YES' : 'NO'}`);
      if (hasHtml) {
        const htmlTags = product.description.match(/<[^>]*>/g);
        console.log(`HTML Tags found: ${htmlTags ? htmlTags.length : 0} tags`);
      }
    });

    console.log('\n✅ All product descriptions updated successfully!');
    console.log('🌐 You can now test the HTML formatting on the website.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the update
updateProductDescriptions();