import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    console.log('=== PRODUCT DETAIL API CALLED ===');
    console.log('Product slug:', slug);

    if (!slug) {
      console.log('❌ Invalid product slug');
      return NextResponse.json(
        { success: false, message: 'Invalid product slug' },
        { status: 400 }
      );
    }

    const queryString = `SELECT 
      p.product_id,
      p.name,
      p.slug,
      p.description,
      p.short_description,
      p.sale_price,
      p.original_price,
      p.rating,
      p.image_1,
      p.image_2,
      p.image_3,
      p.image_4,
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
      c.slug as category_slug,
      sc.name as subcategory_name,
      sc.slug as subcategory_slug
     FROM kriptocar.products p
     LEFT JOIN kriptocar.categories c ON p.category_id = c.category_id
     LEFT JOIN kriptocar.sub_categories sc ON p.sub_category_id = sc.sub_category_id
     WHERE p.slug = ?`;

    const products = await query(queryString, [slug]) as any[];

    if (!products || products.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[0];

    const processedProduct = {
      ...product,
      image_1: product.image_1 ? (Buffer.isBuffer(product.image_1) ? product.image_1.toString('base64') : product.image_1) : null,
      image_2: product.image_2 ? (Buffer.isBuffer(product.image_2) ? product.image_2.toString('base64') : product.image_2) : null,
      image_3: product.image_3 ? (Buffer.isBuffer(product.image_3) ? product.image_3.toString('base64') : product.image_3) : null,
      image_4: product.image_4 ? (Buffer.isBuffer(product.image_4) ? product.image_4.toString('base64') : product.image_4) : null,
    };

    return NextResponse.json(processedProduct);

  } catch (error) {
    console.error('❌ Error fetching product:', error);

    let errorMessage = 'Failed to fetch product';

    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Database table not found';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused';
      } else {
        errorMessage = error.message;
      }
    }

    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 