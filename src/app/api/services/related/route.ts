import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const excludeServiceId = searchParams.get('excludeServiceId');

    if (!category) {
      return NextResponse.json(
        { success: false, message: 'Category is required' },
        { status: 400 }
      );
    }

    // Build the query to get related services
    let sql = `
      SELECT 
        s.service_id,
        s.vendor_id,
        s.name,
        s.description,
        s.service_category_id,
        sc.name as category_name,
        s.type,
        s.base_price,
        s.duration_minutes,
        s.is_available,
        s.service_pincodes,
        s.created_at,
        s.updated_at
      FROM kriptocar.services s
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE sc.name = ? AND s.is_available = 1
    `;

    const params: any[] = [category];

    // Add exclusion for current service if provided
    if (excludeServiceId) {
      sql += ' AND s.service_id != ?';
      params.push(excludeServiceId);
    }

    // Add limit and order by
    sql += ' ORDER BY s.created_at DESC LIMIT 6';

    const services = await query(sql, params) as any[];

    // Add category field for backward compatibility
    const servicesWithCategory = services.map(service => ({
      ...service,
      category: service.category_name
    }));

    return NextResponse.json({
      success: true,
      services: servicesWithCategory
    });

  } catch (error) {
    console.error('Error fetching related services:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch related services' },
      { status: 500 }
    );
  }
} 