import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { processImageData } from '@/lib/imageUtils';

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

    // Get all orders for the user from orders table with product details
    const ordersResult = await query(
      `SELECT 
        o.*,
        p.name as product_name,
        p.sale_price as product_price,
        p.image_1 as product_image,
        p.description as product_description
      FROM kriptocar.orders o
      LEFT JOIN kriptocar.products p ON o.product_id = p.product_id
      WHERE o.user_id = ? 
      ORDER BY o.order_date DESC`,
      [userId]
    ) as any[];

    console.log('Orders query result:', ordersResult);

    const orders = ordersResult.map(order => ({
      order_id: order.order_id,
      user_id: order.user_id,
      product_id: order.product_id,
      product_name: order.product_name || 'Product not found',
      product_price: parseFloat(order.product_price) || 0,
      product_image: processImageData(order.product_image),
      product_description: order.product_description,
      quantity: parseInt(order.qauntity) || 1, // Get quantity from orders table (note: qauntity with typo)
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      shipping_address: order.shipping_address,
      shipping_pincode: order.shipping_pincode,
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