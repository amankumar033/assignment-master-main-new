import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {

    // Fetch hot deal products (is_hot_deal = 1)
    const products = await query(`
      SELECT 
        p.product_id,
        p.name,
        p.slug,
        p.description,
        p.sale_price,
        p.original_price,
        p.rating,
        p.image_1,
        p.category_id,
        p.brand_name,
        p.sub_brand_name,
        p.stock_quantity,
        p.is_active,
        p.is_featured,
        p.is_hot_deal,
        p.created_at,
        p.updated_at,
        p.dealer_id,
        COALESCE(c.name, CONCAT('Category ', p.category_id)) as category_name,
        c.slug as category_slug
      FROM kriptocar.products p
      LEFT JOIN kriptocar.categories c ON p.category_id = c.category_id
      WHERE p.is_hot_deal = 1
      ORDER BY 
        CASE 
          WHEN p.is_active = 1 AND p.stock_quantity > 0 THEN 0 
          WHEN p.is_active = 1 AND (p.stock_quantity IS NULL OR p.stock_quantity <= 0) THEN 1 
          ELSE 2 
        END ASC,
        p.rating DESC,
        p.created_at DESC
    `) as any[];

    // Convert Buffer images to base64 strings
    const processedProducts = (products as any[]).map(product => ({
      ...product,
      image_1: product.image_1 ? (Buffer.isBuffer(product.image_1) ? product.image_1.toString('base64') : product.image_1) : null,
      image_2: product.image_2 ? (Buffer.isBuffer(product.image_2) ? product.image_2.toString('base64') : product.image_2) : null,
      image_3: product.image_3 ? (Buffer.isBuffer(product.image_3) ? product.image_3.toString('base64') : product.image_3) : null,
      image_4: product.image_4 ? (Buffer.isBuffer(product.image_4) ? product.image_4.toString('base64') : product.image_4) : null,
    }));

    return NextResponse.json({
      success: true,
      products: processedProducts
    });

  } catch (error: any) {
    console.error('Error fetching hot deal products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch hot deal products' },
      { status: 500 }
    );
  }
} 