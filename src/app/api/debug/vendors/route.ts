import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    // Get all vendors
    const vendors = await query(
      'SELECT vendor_id, vendor_name FROM kriptocar.vendors ORDER BY vendor_id'
    ) as any[];

    console.log('📋 Available vendors:', vendors);

    return NextResponse.json({
      success: true,
      vendors: vendors.map(v => ({ vendor_id: v.vendor_id, name: v.vendor_name })),
      count: vendors.length
    });

  } catch (error) {
    console.error('Error fetching vendors:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch vendors' },
      { status: 500 }
    );
  }
} 