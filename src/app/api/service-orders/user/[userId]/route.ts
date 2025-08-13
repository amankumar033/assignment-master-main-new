import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const user_id = userId; // Use the user ID directly since it's varchar

    if (!user_id || user_id.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get service orders for the user with vendor details
    const orders = await query(
      `SELECT 
        so.*,
        v.vendor_name,
        v.contact_email as vendor_email,
        v.contact_phone as vendor_phone,
        v.business_address as vendor_address
      FROM kriptocar.service_orders so
      LEFT JOIN kriptocar.vendors v ON so.vendor_id = v.vendor_id
      WHERE so.user_id = ?
      ORDER BY so.booking_date DESC`,
      [user_id]
    ) as any[];

    return NextResponse.json({
      success: true,
      orders: orders
    });

  } catch (error) {
    console.error('Error fetching user service orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service orders' },
      { status: 500 }
    );
  }
} 