import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    if (!productId) {
      return NextResponse.json({ success: false, message: 'product_id is required' }, { status: 400 });
    }

    const rows = await query(
      `SELECT product_id, stock_quantity, is_active 
       FROM kriptocar.products 
       WHERE product_id = ? 
       LIMIT 1`,
      [productId]
    ) as any[];

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      success: true,
      product_id: row.product_id,
      stock_quantity: Number(row.stock_quantity) || 0,
      is_active: Number(row.is_active) || 0,
    });
  } catch (error) {
    console.error('Error fetching product stock:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection limit')) {
      return NextResponse.json({
        success: true,
        stock_quantity: 0,
        message: 'Database temporarily unavailable. Using default stock value.'
      });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch product stock',
      stock_quantity: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}


