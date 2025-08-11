import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const totalProducts = (await query(`
      SELECT COUNT(*) as total FROM kriptocar.products
    `)) as any[];

    const activeProducts = (await query(`
      SELECT COUNT(*) as active FROM kriptocar.products WHERE is_active = 1
    `)) as any[];

    const featuredProducts = (await query(`
      SELECT COUNT(*) as featured FROM kriptocar.products WHERE is_active = 1 AND is_featured = 1
    `)) as any[];

    const sampleProducts = (await query(`
      SELECT 
        product_id,
        name,
        is_active,
        is_featured,
        is_hot_deal,
        stock_quantity,
        sale_price
      FROM kriptocar.products 
      ORDER BY created_at DESC 
      LIMIT 10
    `)) as any[];

    return NextResponse.json({
      success: true,
      debug: {
        totalProducts: totalProducts?.[0]?.total || 0,
        activeProducts: activeProducts?.[0]?.active || 0,
        featuredProducts: featuredProducts?.[0]?.featured || 0,
        sampleProducts,
      },
    });
  } catch (error: any) {
    console.error('Error in debug products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to debug products' },
      { status: 500 }
    );
  }
} 