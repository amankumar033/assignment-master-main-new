import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all service pincodes
    const servicePincodes = (await query(`
      SELECT * FROM kriptocar.service_pincodes
      LIMIT 20
    `)) as any[];

    // Get count of services per pincode
    const pincodeCounts = (await query(`
      SELECT 
        service_pincodes,
        COUNT(service_id) as service_count
      FROM kriptocar.service_pincodes
      GROUP BY service_pincodes
      ORDER BY service_count DESC
    `)) as any[];

    // Get sample services with their pincodes
    const servicesWithPincodes = (await query(`
      SELECT 
        s.service_id,
        s.name,
        sp.service_pincodes
      FROM kriptocar.services s
      INNER JOIN kriptocar.service_pincodes sp ON s.service_id = sp.service_id
      WHERE s.is_available = 1
      LIMIT 10
    `)) as any[];

    return NextResponse.json({
      success: true,
      servicePincodes,
      pincodeCounts,
      servicesWithPincodes,
      totalPincodes: servicePincodes.length,
      uniquePincodes: pincodeCounts.length
    });
  } catch (error: any) {
    console.error('Error debugging service pincodes:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to debug service pincodes' },
      { status: 500 }
    );
  }
}
