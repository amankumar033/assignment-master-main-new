import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode');
    const distance = searchParams.get('distance') || '10';

    if (!pincode) {
      return NextResponse.json(
        { success: false, message: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Validate pincode format (6 digits for Indian pincodes)
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      );
    }

    // Query to get services within specified distance of the given pincode
    const sqlQuery = `
      SELECT DISTINCT 
        s.service_id,
        s.vendor_id as dealer_id,
        s.name,
        s.description,
        s.service_category_id,
        sc.name as category,
        s.type,
        s.base_price,
        s.duration_minutes,
        s.is_available,
        s.service_pincodes,
        s.created_at,
        s.updated_at
      FROM kriptocar.services s
      INNER JOIN kriptocar.service_pincodes sp ON s.service_id = sp.service_id
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE sp.pincode = ?
      AND s.is_available = 1
      ORDER BY s.base_price ASC
    `;

    const rows = await query(sqlQuery, [pincode]) as any[];

    // Transform the data to match the expected format
    const services = Array.isArray(rows) ? rows.map((service: any) => ({
      service_id: service.service_id,
      dealer_id: service.dealer_id,
      name: service.name,
      description: service.description,
      category: service.category,
      type: service.type,
      base_price: service.base_price,
      duration_minutes: service.duration_minutes,
      is_available: Boolean(service.is_available),
      service_pincodes: service.service_pincodes,
      created_at: service.created_at,
      updated_at: service.updated_at
    })) : [];

    return NextResponse.json({
      success: true,
      services: services,
      message: `Found ${services.length} services near pincode ${pincode}`
    });

  } catch (error) {
    console.error('Error fetching services by pincode:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { pincode } = await request.json();

    if (!pincode) {
      return NextResponse.json(
        { success: false, message: 'Pincode is required' },
        { status: 400 }
      );
    }

    // Validate pincode format (6 digits for Indian pincodes)
    if (!/^\d{6}$/.test(pincode)) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid 6-digit pincode' },
        { status: 400 }
      );
    }

    // Query to get services within 10km radius of the given pincode
    // This is a simplified approach - in a real application, you'd need a proper geocoding service
    // to convert pincodes to coordinates and calculate distances accurately
    
    const sqlQuery = `
      SELECT DISTINCT 
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
      INNER JOIN kriptocar.service_pincodes sp ON s.service_id = sp.service_id
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE sp.pincode = ?
      AND s.is_available = 1
      ORDER BY s.base_price ASC
    `;

    const rows = await query(sqlQuery, [pincode]) as any[];

    // Add category field for backward compatibility
    const servicesWithCategory = Array.isArray(rows) ? rows.map((service: any) => ({
      ...service,
      category: service.category_name
    })) : [];

    return NextResponse.json({
      success: true,
      services: servicesWithCategory,
      message: `Found ${servicesWithCategory.length} services near pincode ${pincode}`
    });

  } catch (error) {
    console.error('Error fetching services by pincode:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 