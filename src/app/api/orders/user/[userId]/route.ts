import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    console.log('=== GET USER ORDERS API CALLED ===');
    console.log('User ID:', userId);

    if (!userId) {
      console.log('❌ User ID missing');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get all orders for the user from orders table
    const ordersResult = await query(
      'SELECT * FROM kriptocar.orders WHERE user_id = ? ORDER BY order_date DESC',
      [userId]
    ) as any[];

    console.log('Orders query result:', ordersResult);

    const orders = ordersResult.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address_line1: order.shipping_address_line1,
      shipping_address_line2: order.shipping_address_line2,
      shipping_city: order.shipping_city,
      shipping_state: order.shipping_state,
      shipping_postal_code: order.shipping_postal_code,
      shipping_country: order.shipping_country,
      order_date: order.order_date,
      order_status: order.order_status,
      total_amount: parseFloat(order.total_amount) || 0,
      tax_amount: parseFloat(order.tax_amount) || 0,
      shipping_cost: parseFloat(order.shipping_cost) || 0,
      discount_amount: parseFloat(order.discount_amount) || 0,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      transaction_id: order.transaction_id
    }));

    const response = {
      success: true,
      message: 'User orders fetched successfully',
      orders: orders
    };

    console.log('✅ Returning success response with', orders.length, 'orders');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    
    let errorMessage = 'Failed to fetch user orders';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Database table not found';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 