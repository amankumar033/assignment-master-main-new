import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const serviceId = slug; // Use the slug directly since service_id is varchar

    if (!serviceId || serviceId.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid service ID' },
        { status: 400 }
      );
    }

    // Get service details from services table with category information
    const services = await query(
      `SELECT 
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
      WHERE s.service_id = ?`,
      [serviceId]
    ) as any[];

    if (!services || services.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service not found' },
        { status: 404 }
      );
    }

    const service = services[0];
    
    // Add category field for backward compatibility
    service.category = service.category_name;
    
    console.log('🔍 Service data from database:', service);
    console.log('🔍 Service vendor_id:', service.vendor_id);

    return NextResponse.json({
      success: true,
      service: service
    });

  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service' },
      { status: 500 }
    );
  }
} 