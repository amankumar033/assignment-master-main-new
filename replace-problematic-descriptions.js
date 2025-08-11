const mysql = require('mysql2/promise');

async function replaceProblematicDescriptions() {
  console.log('🔧 Replacing Problematic Descriptions with Proper HTML\n');

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

    // Get all products with the problematic structure
    console.log('🔍 Finding products with problematic HTML structure...');
    const [products] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE description LIKE '%<div style="text-align: left;">%' 
      AND description LIKE '%<ul>%'
      AND description LIKE '%<li>%'
      ORDER BY product_id
    `);

    console.log(`📊 Found ${products.length} products with problematic structure`);

    // Create proper descriptions for each product type
    const properDescriptions = {
      3: {
        name: 'Premium Engine Oil',
        description: `
          <div style="text-align: left;">
            <h3>Premium Engine Oil Features</h3>
            <p>High-quality <strong>synthetic engine oil</strong> designed for optimal engine performance and longevity.</p>
            
            <h4>Key Benefits:</h4>
            <ul>
              <li><span style="color: #2563eb;">🛡️ Superior Protection</span> - Advanced formula protects against wear and tear</li>
              <li><span style="color: #059669;">⚡ Enhanced Performance</span> - Improves engine efficiency and fuel economy</li>
              <li><span style="color: #dc2626;">🔥 Heat Resistance</span> - Maintains viscosity under extreme temperatures</li>
              <li><span style="color: #7c3aed;">🛠️ Extended Life</span> - Longer oil change intervals</li>
            </ul>
            
            <h4>Technical Specifications:</h4>
            <ul>
              <li><strong>Viscosity:</strong> 5W-30</li>
              <li><strong>API Rating:</strong> SN Plus</li>
              <li><strong>Capacity:</strong> 1 Quart</li>
              <li><strong>Compatibility:</strong> Gasoline and diesel engines</li>
            </ul>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0; border-radius: 0.5rem;">
              <p style="margin: 0;"><em>"This premium engine oil exceeds industry standards and provides exceptional engine protection for your vehicle."</em></p>
            </div>
          </div>
        `
      },
      4: {
        name: 'Brake Pad Set',
        description: `
          <div style="text-align: left;">
            <h3>Ceramic Brake Pad Set</h3>
            <p>Premium <strong>ceramic brake pads</strong> for superior stopping power and quiet operation.</p>
            
            <h4>Performance Features:</h4>
            <ul>
              <li><span style="color: #dc2626;">🛑 Excellent Stopping Power</span> - High friction coefficient for reliable braking</li>
              <li><span style="color: #059669;">🔇 Low Noise</span> - Ceramic compound reduces brake squeal</li>
              <li><span style="color: #7c3aed;">🧹 Low Dust</span> - Minimal brake dust for cleaner wheels</li>
              <li><span style="color: #2563eb;">🛡️ Heat Resistant</span> - Maintains performance under high temperatures</li>
            </ul>
            
            <h4>Package Contents:</h4>
            <ul>
              <li>4 Brake Pads (Front or Rear)</li>
              <li>Brake Hardware Kit</li>
              <li>Installation Instructions</li>
              <li>Anti-Squeal Compound</li>
            </ul>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
              <h5 style="color: #0c4a6e; margin-top: 0;">⚠️ Important Note:</h5>
              <p style="margin-bottom: 0;">Always replace brake pads in pairs (both sides) for optimal braking performance and safety.</p>
            </div>
          </div>
        `
      },
      5: {
        name: 'Air Filter',
        description: `
          <div style="text-align: left;">
            <h3>High-Performance Air Filter</h3>
            <p>Advanced <strong>air filtration system</strong> for better engine breathing and performance.</p>
            
            <h4>Technology & Benefits:</h4>
            <ul>
              <li><span style="color: #059669;">🌬️ Improved Airflow</span> - Multi-layer design for optimal air intake</li>
              <li><span style="color: #dc2626;">🛡️ Superior Filtration</span> - Captures 99.5% of airborne particles</li>
              <li><span style="color: #2563eb;">⚡ Enhanced Performance</span> - Better fuel efficiency and power output</li>
              <li><span style="color: #7c3aed;">🛠️ Easy Maintenance</span> - Washable and reusable design</li>
            </ul>
            
            <h4>Filter Specifications:</h4>
            <ul>
              <li><strong>Filtration Efficiency:</strong> 99.5%</li>
              <li><strong>Material:</strong> Cotton Gauze</li>
              <li><strong>Lifespan:</strong> 50,000 miles</li>
              <li><strong>Maintenance:</strong> Clean every 15,000 miles</li>
            </ul>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0;">
              <p style="margin: 0;"><strong>💡 Pro Tip:</strong> Clean your air filter every 15,000 miles for optimal performance and longevity.</p>
            </div>
          </div>
        `
      },
      6: {
        name: 'Car Battery',
        description: `
          <div style="text-align: left;">
            <h3>Long-Lasting Car Battery</h3>
            <p>Premium <strong>automotive battery</strong> with extended lifespan and reliable performance.</p>
            
            <h4>Key Features:</h4>
            <ul>
              <li><span style="color: #059669;">🔋 Extended Life</span> - 3-year warranty with superior durability</li>
              <li><span style="color: #2563eb;">⚡ High Performance</span> - Excellent cold-cranking amps</li>
              <li><span style="color: #dc2626;">🛡️ Maintenance Free</span> - No water refilling required</li>
              <li><span style="color: #7c3aed;">🛠️ Easy Installation</span> - Standard size fits most vehicles</li>
            </ul>
            
            <h4>Specifications:</h4>
            <ul>
              <li><strong>Capacity:</strong> 60 Ah</li>
              <li><strong>Cold Cranking Amps:</strong> 600 CCA</li>
              <li><strong>Warranty:</strong> 3 years</li>
              <li><strong>Type:</strong> Maintenance Free</li>
            </ul>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
              <h5 style="color: #0c4a6e; margin-top: 0;">🔧 Installation Note:</h5>
              <p style="margin-bottom: 0;">Ensure proper terminal connections and secure mounting for optimal performance.</p>
            </div>
          </div>
        `
      },
      7: {
        name: 'Tire Set',
        description: `
          <div style="text-align: left;">
            <h3>All-Season Tire Set (4 Tires)</h3>
            <p>High-quality <strong>all-season tires</strong> for excellent grip and durability in all weather conditions.</p>
            
            <h4>Performance Features:</h4>
            <ul>
              <li><span style="color: #059669;">🌧️ All-Weather Grip</span> - Excellent traction in wet and dry conditions</li>
              <li><span style="color: #2563eb;">🛡️ Long Tread Life</span> - Extended mileage with durable compound</li>
              <li><span style="color: #dc2626;">🔇 Quiet Ride</span> - Advanced tread design reduces road noise</li>
              <li><span style="color: #7c3aed;">⚡ Fuel Efficient</span> - Low rolling resistance for better mileage</li>
            </ul>
            
            <h4>Tire Specifications:</h4>
            <ul>
              <li><strong>Size:</strong> 205/55R16</li>
              <li><strong>Load Rating:</strong> 91V</li>
              <li><strong>Tread Depth:</strong> 10/32"</li>
              <li><strong>Speed Rating:</strong> V (149 mph)</li>
            </ul>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 1rem; margin: 1rem 0;">
              <p style="margin: 0;"><strong>💡 Safety Tip:</strong> Always replace tires in pairs or sets of four for optimal handling and safety.</p>
            </div>
          </div>
        `
      },
      8: {
        name: 'Honda Jazz Seat Covers',
        description: `
          <div style="text-align: left;">
            <h3>Premium Fabric Seat Covers</h3>
            <p>Custom-fit <strong>fabric seat covers</strong> tailored specifically for Honda Jazz for daily comfort and long-term use.</p>
            
            <h4>Product Features:</h4>
            <ul>
              <li><span style="color: #059669;">🎯 Perfect Fit</span> - Tailored specifically for Honda Jazz</li>
              <li><span style="color: #2563eb;">🛡️ Premium Quality</span> - Soft-touch breathable material</li>
              <li><span style="color: #dc2626;">🛠️ Easy Installation</span> - Simple to install and maintain</li>
              <li><span style="color: #7c3aed;">🧼 Easy Maintenance</span> - Removable, washable construction</li>
            </ul>
            
            <h4>Key Benefits:</h4>
            <ul>
              <li>Resistant to shrinking, stretching, and color fading</li>
              <li>Ensures relaxed seating even during long drives</li>
              <li>Ideal for users looking for a practical and comfortable interior upgrade</li>
              <li>Protects original seats from wear and tear</li>
            </ul>
            
            <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 0.5rem; padding: 1rem; margin: 1rem 0;">
              <h5 style="color: #0c4a6e; margin-top: 0;">💡 Installation Tip:</h5>
              <p style="margin-bottom: 0;">Ensure the seat covers are properly aligned before securing for the best fit and appearance.</p>
            </div>
          </div>
        `
      }
    };

    // Replace each product's description
    for (const product of products) {
      const productId = product.product_id;
      const properDesc = properDescriptions[productId];
      
      if (properDesc) {
        console.log(`\n📝 Replacing description for: ${product.name} (ID: ${productId})`);
        
        await connection.execute(`
          UPDATE products 
          SET description = ? 
          WHERE product_id = ?
        `, [properDesc.description, productId]);
        
        console.log(`✅ Updated ${product.name} with proper HTML structure`);
      } else {
        console.log(`\n⚠️ No proper description template found for: ${product.name} (ID: ${productId})`);
      }
    }

    // Verify the replacements
    console.log('\n🔍 Verifying replacements...');
    const [updatedProducts] = await connection.execute(`
      SELECT product_id, name, description 
      FROM products 
      WHERE product_id IN (3, 4, 5, 6, 7, 8)
      ORDER BY product_id
    `);

    updatedProducts.forEach(product => {
      console.log(`\n--- ${product.name} (ID: ${product.product_id}) ---`);
      console.log(`Description Length: ${product.description.length}`);
      const hasProperUl = /<ul[^>]*>.*<\/ul>/s.test(product.description);
      const liCount = (product.description.match(/<li[^>]*>/g) || []).length;
      const hasEmptyDivs = /<div>\s*<\/div>/g.test(product.description);
      const hasProblematicStructure = /<div style="text-align: left;">.*<\/ul><\/ul><\/div>/s.test(product.description);
      
      console.log(`Has proper ul structure: ${hasProperUl ? 'YES' : 'NO'}`);
      console.log(`Number of list items: ${liCount}`);
      console.log(`Has empty divs: ${hasEmptyDivs ? 'YES' : 'NO'}`);
      console.log(`Has problematic structure: ${hasProblematicStructure ? 'YES' : 'NO'}`);
    });

    console.log('\n✅ All problematic descriptions replaced successfully!');
    console.log('🌐 The bullet points should now display correctly on the website.');
    console.log('📋 You can test by visiting product pages and clicking on the description dropdown.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n✅ Database connection closed');
    }
  }
}

// Run the replacement
replaceProblematicDescriptions();