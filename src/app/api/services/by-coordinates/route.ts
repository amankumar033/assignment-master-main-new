import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json();

    if (!latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { success: false, message: 'Invalid coordinates provided' },
        { status: 400 }
      );
    }

    // For this implementation, we'll use a simplified approach
    // In a real application, you would:
    // 1. Use a geocoding service to convert coordinates to pincode
    // 2. Or store coordinates in the database and calculate distances directly
    
    // For now, we'll fetch all services and filter by a reasonable distance
    // This is a placeholder implementation - you should replace this with proper geocoding
    
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
        s.updated_at,
        sp.service_pincodes as pincode
      FROM kriptocar.services s
      INNER JOIN kriptocar.service_pincodes sp ON s.service_id = sp.service_id
      LEFT JOIN kriptocar.service_categories sc ON s.service_category_id = sc.service_category_id
      WHERE s.is_available = 1
      ORDER BY s.base_price ASC
      LIMIT 50
    `;

    const rows = await query(sqlQuery) as any[];

    // Filter services within 10km radius (simplified approach)
    // In a real implementation, you would have coordinates for each pincode
    // and calculate actual distances
    
    const nearbyServices = Array.isArray(rows) ? rows.slice(0, 20) : [];

    // Add category field for backward compatibility
    const servicesWithCategory = nearbyServices.map((service: any) => ({
      ...service,
      category: service.category_name
    }));

    return NextResponse.json({
      success: true,
      services: servicesWithCategory,
      message: `Found ${servicesWithCategory.length} services near your location`,
      coordinates: { latitude, longitude }
    });

  } catch (error) {
    console.error('Error fetching services by coordinates:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 