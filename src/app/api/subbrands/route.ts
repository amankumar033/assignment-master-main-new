import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const brandName = searchParams.get('brand_name');

    // Assuming tables: sub_brands(sub_brand_name, brand_name, created_at, updated_at)
    // and brands(brand_name, product_id, created_at, updated_at)
    let sqlQuery = `
      SELECT 
        sb.sub_brand_name,
        sb.brand_name
      FROM sub_brands sb
    `;
    const params: any[] = [];
    if (brandName) {
      sqlQuery += ' WHERE sb.brand_name = ?';
      params.push(brandName);
    }
    sqlQuery += ' ORDER BY sb.sub_brand_name ASC';

    const rows = await query(sqlQuery, params);

    return NextResponse.json({ success: true, subbrands: rows });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch sub-brands' }, { status: 500 });
  }
}


