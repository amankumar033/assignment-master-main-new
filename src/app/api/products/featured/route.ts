import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {

    // First, let's check if there are any products at all
    const allProducts = await query(
      `SELECT COUNT(*) as total_products FROM kriptocar.products`
    ) as any[];
    console.log('Total products in database:', allProducts[0]?.total_products);
    
    // Check what values exist for is_featured and is_hot_deal
    const featuredStats = await query(
      `SELECT 
        is_featured,
        is_hot_deal,
        COUNT(*) as count
      FROM kriptocar.products 
      GROUP BY is_featured, is_hot_deal`
    ) as any[];
    
    console.log('Product stats:', featuredStats);
    
    // Fetch featured products (is_featured = 1 and is_hot_deal = 0)
    const products = await query(
      `SELECT 
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
      WHERE p.is_featured = 1 AND p.is_hot_deal = 0
      ORDER BY 
        CASE 
          WHEN p.is_active = 1 AND p.stock_quantity > 0 THEN 0 
          WHEN p.is_active = 1 AND (p.stock_quantity IS NULL OR p.stock_quantity <= 0) THEN 1 
          ELSE 2 
        END ASC,
        p.rating DESC,
        p.created_at DESC`
    );

    // If no featured products found, get all products as fallback
    let productsToReturn = products;
    if ((products as any[]).length === 0) {
      console.log('No featured products found, getting all products as fallback');
      const allProducts = await query(
        `SELECT 
          p.product_id,
          p.name,
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
        ORDER BY 
          CASE 
            WHEN p.is_active = 1 AND p.stock_quantity > 0 THEN 0 
            WHEN p.is_active = 1 AND (p.stock_quantity IS NULL OR p.stock_quantity <= 0) THEN 1 
            ELSE 2 
          END ASC,
          p.rating DESC,
          p.created_at DESC
        LIMIT 20`
      ) as any[];
      productsToReturn = allProducts;
    }
    
    // Convert Buffer images to base64 strings
    const processedProducts = (productsToReturn as any[]).map(product => ({
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
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
} 