import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== BRANDS API CALLED ===');

    const brands = await query(`
      SELECT DISTINCT 
        brand_name,
        COUNT(*) as product_count
      FROM kriptocar.products 
      WHERE brand_name IS NOT NULL AND brand_name != ''
      GROUP BY brand_name
      ORDER BY product_count DESC, brand_name ASC
    `) as any[];

    console.log(`✅ Found ${brands.length} brands`);

    return NextResponse.json({
      success: true,
      brands: brands.map(brand => ({
        name: brand.brand_name,
        productCount: brand.product_count
      }))
    });

  } catch (error: any) {
    console.error('Error fetching brands:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch brands' },
      { status: 500 }
    );
  }
}
