import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const rating = searchParams.get('rating');
    const inStockOnly = searchParams.get('inStockOnly');
    const isHotDeal = searchParams.get('isHotDeal');
    const isFeatured = searchParams.get('isFeatured');

    // Debug logging
    console.log('=== PRODUCTS API CALLED ===');
    console.log('Search parameter:', search);
    console.log('Search parameter type:', typeof search);
    console.log('Search parameter length:', search?.length);
    console.log('All search params:', Object.fromEntries(searchParams.entries()));

    // Build the query with filters
    let sqlQuery = `
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
        p.manufacture,
        p.stock_quantity,
        p.is_active,
        p.is_featured,
        p.is_hot_deal,
        p.created_at,
        p.updated_at,
        p.dealer_id,
        COALESCE(c.name, CONCAT('Category ', p.category_id)) as category_name,
        c.slug as category_slug,
        sc.slug as subcategory_slug
      FROM kriptocar.products p
      LEFT JOIN kriptocar.categories c ON p.category_id = c.category_id
      LEFT JOIN kriptocar.sub_categories sc ON p.sub_category_id = sc.sub_category_id
      WHERE 1=1
    `;

    const params: any[] = [];

    // Add search filter for comprehensive search across brands, categories, and product names
    if (search) {
      console.log('Adding search filter for:', search);
      sqlQuery += ` AND (LOWER(p.name) LIKE ? OR LOWER(p.brand_name) LIKE ? OR LOWER(c.name) LIKE ? OR LOWER(sc.name) LIKE ?)`;
      const searchTerm = `%${search.toLowerCase()}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
      console.log('Search term:', searchTerm);
      console.log('Updated query:', sqlQuery);
      console.log('Updated params:', params);
    }

    // Add filters
    if (category) {
      // Support both category name and slug for backwards compatibility
      sqlQuery += ` AND (c.name = ? OR c.slug = ?)`;
      params.push(category, category);
    }

    // Note: Brand filter is handled client-side to allow multiple selections. Only category filtering is done server-side.

    if (minPrice) {
      sqlQuery += ` AND p.sale_price >= ?`;
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      sqlQuery += ` AND p.sale_price <= ?`;
      params.push(parseFloat(maxPrice));
    }

    if (rating) {
      sqlQuery += ` AND p.rating >= ?`;
      params.push(parseFloat(rating));
    }

    if (inStockOnly === 'true') {
      sqlQuery += ` AND p.stock_quantity > 0`;
    }

    if (isHotDeal === 'true') {
      sqlQuery += ` AND p.is_hot_deal = 1`;
    }

    if (isFeatured === 'true') {
      sqlQuery += ` AND p.is_featured = 1`;
    }

    // Do not filter by is_active here so inactive products can be shown as Unavailable on the UI

    // Ordering: available first, then out-of-stock, then unavailable
    sqlQuery += ` ORDER BY 
      CASE 
        WHEN p.is_active = 1 AND p.stock_quantity > 0 THEN 0 
        WHEN p.is_active = 1 AND (p.stock_quantity IS NULL OR p.stock_quantity <= 0) THEN 1 
        ELSE 2 
      END ASC,
      p.rating DESC,
      p.created_at DESC`;

    // Debug logging
    console.log('Final query:', sqlQuery);
    console.log('Final params:', params);

    // Execute query
    const products = await query(sqlQuery, params);

    console.log('Returning products:', (products as any[]).length);
    if (search) {
      console.log('Sample products for search debugging:');
      (products as any[]).slice(0, 5).forEach((product: any) => {
        console.log(`- Name: "${product.name}", Brand: "${product.brand_name}", Category: "${product.category_name}"`);
      });
    }
    
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
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
} 