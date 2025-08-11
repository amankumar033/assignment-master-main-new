import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== DESCRIPTION DEBUG API CALLED ===');

    // Get a sample product with description
    const products = await query(
      'SELECT product_id, name, description FROM kriptocar.products WHERE description IS NOT NULL AND description != "" LIMIT 3'
    ) as any[];

    console.log('Products with descriptions found:', products.length);

    // Test with HTML content
    const testHtmlContent = `
      <h2>Test HTML Content</h2>
      <p>This is a <strong>test</strong> with <em>HTML formatting</em>:</p>
      <ul>
        <li>Bullet point 1</li>
        <li>Bullet point 2</li>
        <li>Bullet point 3</li>
      </ul>
      <p style="color: red;">This text should be red</p>
      <blockquote>This is a blockquote</blockquote>
    `;

    return NextResponse.json({
      success: true,
      message: 'Description debug data',
      data: {
        sampleProducts: products,
        testHtmlContent: testHtmlContent,
        descriptionLengths: products.map(p => ({
          product_id: p.product_id,
          name: p.name,
          descriptionLength: p.description ? p.description.length : 0,
          descriptionPreview: p.description ? p.description.substring(0, 100) + '...' : 'No description'
        }))
      }
    });

  } catch (error) {
    console.error('Error in description debug:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to debug descriptions' },
      { status: 500 }
    );
  }
}