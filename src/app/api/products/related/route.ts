import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const excludeProductId = searchParams.get('excludeProductId');

    console.log('=== RELATED PRODUCTS API CALLED ===');
    console.log('Category ID:', categoryId);
    console.log('Exclude Product ID:', excludeProductId);

    if (!categoryId) {
      console.log('❌ Category ID is required');
      return NextResponse.json(
        { success: false, message: 'Category ID is required' },
        { status: 400 }
      );
    }

    // Build the query to get related products
    let sql = `
      SELECT 
        product_id,
        name,
        description,
        sale_price,
        original_price,
        rating,
        image_1,
        category_id,
        brand_name,
        sub_brand_name,
        stock_quantity,
        is_active,
        is_featured,
        is_hot_deal,
        created_at,
        updated_at,
        dealer_id
      FROM kriptocar.products 
      WHERE category_id = ?
    `;

    const params: any[] = [categoryId];

    // Add exclusion for current product if provided
    if (excludeProductId) {
      sql += ' AND product_id != ?';
      params.push(excludeProductId);
    }

    // Add limit and order by
    sql += ' ORDER BY is_featured DESC, is_hot_deal DESC, rating DESC, created_at DESC LIMIT 8';

    console.log('Executing query:', sql);
    console.log('Query parameters:', params);

    const products = await query(sql, params) as any[];

    console.log('✅ Related products fetched successfully');
    console.log('Number of related products found:', products.length);

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

  } catch (error) {
    console.error('❌ Error fetching related products:', error);
    
    let errorMessage = 'Failed to fetch related products';
    
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