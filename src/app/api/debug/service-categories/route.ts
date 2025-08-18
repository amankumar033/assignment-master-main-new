import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all service categories
    const serviceCategories = (await query(`
      SELECT * FROM kriptocar.service_categories
    `)) as any[];

    // Get all services with their categories
    const services = (await query(`
      SELECT 
        s.service_id,
        s.name,
        s.service_category_id,
        sc.name as category_name
      FROM kriptocar.services s
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE s.is_available = 1
      LIMIT 20
    `)) as any[];

    // Count services per category
    const categoryCounts = (await query(`
      SELECT 
        sc.name as category_name,
        COUNT(s.service_id) as service_count
      FROM kriptocar.service_categories sc
      LEFT JOIN kriptocar.services s ON sc.service_category_id = s.service_category_id AND s.is_available = 1
      GROUP BY sc.service_category_id, sc.name
      ORDER BY sc.name
    `)) as any[];

    return NextResponse.json({
      success: true,
      serviceCategories,
      services,
      categoryCounts,
      totalCategories: serviceCategories.length,
      totalServices: services.length
    });
  } catch (error: any) {
    console.error('Error debugging service categories:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to debug service categories' },
      { status: 500 }
    );
  }
}
