import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const categories = (await query(`
      SELECT * FROM kriptocar.categories
    `)) as any[];

    const products = (await query(`
      SELECT product_id, name, category_id 
      FROM kriptocar.products 
      WHERE is_featured = 1 AND is_hot_deal = 0
    `)) as any[];

    return NextResponse.json({
      success: true,
      categories,
      products,
    });
  } catch (error: any) {
    console.error('Error debugging categories:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to debug categories' },
      { status: 500 }
    );
  }
} 