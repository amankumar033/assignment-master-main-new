import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category_id');
    
    let sqlQuery = `
      SELECT 
        sub_category_id,
        name,
        slug,
        category_id,
        created_at,
        updated_at
      FROM sub_categories
    `;
    const queryParams: any[] = [];
    
    // If category_id is provided, filter by it
    if (categoryId) {
      sqlQuery += ' WHERE category_id = ?';
      queryParams.push(categoryId);
    }
    
    sqlQuery += ' ORDER BY name ASC';
    
    const rows = await query(sqlQuery, queryParams);
    
    return NextResponse.json({
      success: true,
      subcategories: rows,
      message: categoryId ? `Subcategories for category ${categoryId}` : 'All subcategories'
    });
    
  } catch (error) {
    console.error('Database error:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection limit')) {
      return NextResponse.json({
        success: false,
        message: 'Database temporarily unavailable. Please try again.',
        subcategories: []
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch subcategories',
      subcategories: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

