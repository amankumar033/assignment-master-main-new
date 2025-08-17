import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createOrderCancellationNotifications } from '@/lib/notifications';
import { sendOrderCancellationEmail, sendDealerOrderCancellationEmail } from '@/lib/email';
// import { processImageData } from '@/lib/imageUtils';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { new_status, updated_by } = body;

    console.log('=== CANCEL ORDER API CALLED ===');
    console.log('Order ID:', orderId);
    console.log('New Status:', new_status);
    console.log('Updated By:', updated_by);

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: 'Order ID is required' },
        { status: 400 }
      );
    }

    if (new_status !== 'Cancelled') {
      return NextResponse.json(
        { success: false, message: 'Invalid status for cancellation' },
        { status: 400 }
      );
    }

    // First, get the current order details
    const orderResult = await query(
      `SELECT 
        o.*,
        p.name as product_name,
        p.sale_price as product_price,
        p.image_1 as product_image,
        p.description as product_description,
        d.business_name as dealer_name,
        d.email as dealer_email
      FROM kriptocar.orders o
      LEFT JOIN kriptocar.products p ON o.product_id = p.product_id
      LEFT JOIN kriptocar.dealers d ON o.dealer_id = d.dealer_id
      WHERE o.order_id = ?`,
      [orderId]
    ) as any[];

    if (!orderResult || orderResult.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    const order = orderResult[0];

    // Check if order can be cancelled
    if (order.order_status.toLowerCase() !== 'pending' && order.order_status.toLowerCase() !== 'processing') {
      return NextResponse.json(
        { success: false, message: 'Order cannot be cancelled in its current status' },
        { status: 400 }
      );
    }

    // Update the order status
    const updateResult = await query(
      'UPDATE kriptocar.orders SET order_status = ? WHERE order_id = ?',
      [new_status, orderId]
    ) as any;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update order status' },
        { status: 500 }
      );
    }

    console.log('✅ Order status updated successfully');

    // Restore product quantity
    try {
      const currentStockResult = await query(
        'SELECT stock_quantity FROM kriptocar.products WHERE product_id = ?',
        [order.product_id]
      ) as any[];

      if (currentStockResult && currentStockResult.length > 0) {
        const currentStock = currentStockResult[0].stock_quantity || 0;
        const restoredStock = currentStock + Number(order.quantity);
        
        await query(
          'UPDATE kriptocar.products SET stock_quantity = ? WHERE product_id = ?',
          [restoredStock, order.product_id]
        );
        
        console.log(`✅ Restored product quantity: ${order.product_id} - ${currentStock} → ${restoredStock} (+${order.quantity})`);
      }
    } catch (stockError) {
      console.error('❌ Error restoring product quantity:', stockError);
      // Don't fail the cancellation if stock restoration fails
    }

    // Prepare order data for notifications
    const orderData = {
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      customer_phone: order.customer_phone,
      total_amount: Number(order.total_amount),
      order_status: new_status,
      payment_status: order.payment_status,
      shipping_address: order.shipping_address,
      shipping_pincode: order.shipping_pincode,
      items: [{
        product_id: order.product_id,
        name: order.product_name,
        price: Number(order.product_price),
        quantity: Number(order.quantity)
      }],
      order_date: order.order_date
    };

    // Create notifications for order cancellation
    try {
      await createOrderCancellationNotifications(orderData, orderId, order.dealer_id);
      console.log('✅ Order cancellation notifications created successfully');
    } catch (notificationError) {
      console.error('❌ Error creating order cancellation notifications:', notificationError);
      // Don't fail the cancellation if notifications fail
    }

    // Send cancellation email to customer
    try {
      const customerEmailData = {
        order_id: orderId,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        product_name: order.product_name,
        total_amount: Number(order.total_amount),
        order_date: order.order_date,
        cancellation_date: new Date().toISOString()
      };

      const customerEmailSent = await sendOrderCancellationEmail(customerEmailData);
      if (customerEmailSent) {
        console.log('✅ Order cancellation email sent to customer');
      } else {
        console.log('⚠️ Failed to send order cancellation email to customer');
      }
    } catch (emailError) {
      console.error('❌ Error sending order cancellation email to customer:', emailError);
    }

    // Send cancellation email to dealer
    if (order.dealer_email) {
      try {
        const dealerEmailData = {
          order_id: orderId,
          dealer_name: order.dealer_name,
          dealer_email: order.dealer_email,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          product_name: order.product_name,
          total_amount: Number(order.total_amount),
          order_date: order.order_date,
          cancellation_date: new Date().toISOString(),
          items: [{
            product_id: order.product_id,
            name: order.product_name,
            price: Number(order.product_price),
            quantity: Number(order.quantity)
          }]
        };

        const dealerEmailSent = await sendDealerOrderCancellationEmail(dealerEmailData);
        if (dealerEmailSent) {
          console.log('✅ Order cancellation email sent to dealer');
        } else {
          console.log('⚠️ Failed to send order cancellation email to dealer');
        }
      } catch (emailError) {
        console.error('❌ Error sending order cancellation email to dealer:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      order_id: orderId,
      new_status: new_status
    });

  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to cancel order' },
      { status: 500 }
    );
  }
}
