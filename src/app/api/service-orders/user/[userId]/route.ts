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

    // Get service orders for the user
    const orders = await query(
      `SELECT 
        service_order_id,
        user_id,
        service_id,
        vendor_id,
        service_name,
        service_description,
        service_category,
        service_type,
        base_price,
        final_price,
        duration_minutes,
        booking_date,
        service_date,
        service_time,
        service_status,
        service_pincode,
        service_address,
        additional_notes,
        payment_method,
        payment_status,
        transaction_id,
        was_available
      FROM kriptocar.service_orders 
      WHERE user_id = ?
      ORDER BY booking_date DESC`,
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