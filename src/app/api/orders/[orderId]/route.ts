import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { processImageData } from '@/lib/imageUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    console.log('=== GET ORDER API CALLED ===');
    console.log('Order ID:', orderId);
    console.log('Order ID type:', typeof orderId);
    console.log('Order ID length:', orderId?.length);

    if (!orderId) {
      console.log('❌ Order ID missing');
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Clean the order ID (remove any extra spaces or special characters)
    const cleanOrderId = orderId.trim();
    console.log('Cleaned Order ID:', cleanOrderId);

    // First, try to get order details from Orders table with exact match and product details
    let orderResult = await query(
      `SELECT 
        o.*,
        p.name as product_name,
        p.sale_price as product_price,
        p.image_1 as product_image,
        p.description as product_description
      FROM kriptocar.orders o
      LEFT JOIN kriptocar.products p ON o.product_id = p.product_id
      WHERE o.order_id = ?`,
      [cleanOrderId]
    ) as any[];

    console.log('Exact match query result:', orderResult);

    // If no exact match found, try case-insensitive search
    if (!orderResult || orderResult.length === 0) {
      console.log('No exact match found, trying case-insensitive search...');
      orderResult = await query(
        `SELECT 
          o.*,
          p.name as product_name,
          p.sale_price as product_price,
          p.image_1 as product_image,
          p.description as product_description
        FROM kriptocar.orders o
        LEFT JOIN kriptocar.products p ON o.product_id = p.product_id
        WHERE UPPER(o.order_id) = UPPER(?)`,
        [cleanOrderId]
      ) as any[];
      console.log('Case-insensitive query result:', orderResult);
    }

    // If still no match, try partial match for debugging
    if (!orderResult || orderResult.length === 0) {
      console.log('No case-insensitive match found, checking for partial matches...');
      const partialResult = await query(
        'SELECT order_id FROM kriptocar.orders WHERE order_id LIKE ? LIMIT 5',
        [`%${cleanOrderId}%`]
      ) as any[];
      console.log('Partial match results:', partialResult);
      
      // Also check total orders count for debugging
      const countResult = await query(
        'SELECT COUNT(*) as total FROM kriptocar.orders'
      ) as any[];
      console.log('Total orders in database:', countResult[0]?.total);
      
      // Check recent orders for debugging
      const recentOrders = await query(
        'SELECT order_id, customer_name, order_date FROM kriptocar.orders ORDER BY order_date DESC LIMIT 3'
      ) as any[];
      console.log('Recent orders:', recentOrders);
    }

    if (!orderResult || orderResult.length === 0) {
      console.log('❌ Order not found after all attempts');
      return NextResponse.json(
        { 
          success: false, 
          message: 'Order not found',
          debug: {
            searchedOrderId: cleanOrderId,
            totalOrdersInDB: (await query('SELECT COUNT(*) as total FROM kriptocar.orders') as any[])[0]?.total || 0
          }
        },
        { status: 404 }
      );
    }

    const order = orderResult[0];
    console.log('✅ Order found:', order);
    console.log('🔍 Customer name from order:', order.customer_name);
    console.log('🔍 Customer email from order:', order.customer_email);

    const response = {
      success: true,
      message: 'Order details fetched successfully',
      order: {
        order_id: order.order_id,
        user_id: order.user_id,
        product_id: order.product_id,
        product_name: order.product_name || 'Product not found',
        product_price: parseFloat(order.product_price) || 0,
        product_image: processImageData(order.product_image),
        product_description: order.product_description,
        quantity: parseInt(order.qauntity) || 1, // Get quantity from orders table (DB uses 'qauntity')
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        shipping_address: order.shipping_address,
        shipping_address_line2: '', // Not available in current schema
        shipping_city: 'City', // Default value
        shipping_state: 'State', // Default value
        shipping_pincode: order.shipping_pincode,
        shipping_country: 'India', // Default value
        order_date: order.order_date,
        order_status: order.order_status,
        total_amount: parseFloat(order.total_amount) || 0,
        tax_amount: parseFloat(order.tax_amount) || 0,
        shipping_cost: parseFloat(order.shipping_cost) || 0,
        discount_amount: parseFloat(order.discount_amount) || 0,
        payment_method: order.payment_method,
        payment_status: order.payment_status,
        transaction_id: order.transaction_id
      }
    };

    console.log('✅ Returning success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching order:', error);
    
    let errorMessage = 'Failed to fetch order details';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Database table not found - please run database setup scripts';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied - check credentials';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused - check if database is running';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
} 