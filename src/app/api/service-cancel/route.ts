import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { notificationIdGenerator } from '@/lib/notificationIdGenerator';
import { sendServiceCancellationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service_order_id, user_id } = body;

    console.log('=== SERVICE CANCELLATION API CALLED ===');
    console.log('Cancellation data:', { service_order_id, user_id });

    if (!service_order_id || !user_id) {
      return NextResponse.json(
        { success: false, message: 'Service order ID and user ID are required' },
        { status: 400 }
      );
    }

    // Get service order details
    const serviceOrder = await query(
      `SELECT 
        so.*,
        v.vendor_name,
        v.contact_email as vendor_email,
        v.contact_phone as vendor_phone,
        u.full_name as customer_name,
        u.email as customer_email
      FROM kriptocar.service_orders so
      LEFT JOIN kriptocar.vendors v ON so.vendor_id = v.vendor_id
      LEFT JOIN kriptocar.users u ON so.user_id = u.user_id
      WHERE so.service_order_id = ? AND so.user_id = ?`,
      [service_order_id, user_id]
    ) as any[];

    if (!serviceOrder || serviceOrder.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service order not found' },
        { status: 404 }
      );
    }

    const order = serviceOrder[0];

    // Check if service can be cancelled (only pending or scheduled services)
    if (!['pending', 'scheduled'].includes(order.service_status.toLowerCase())) {
      return NextResponse.json(
        { success: false, message: 'Service cannot be cancelled at this stage' },
        { status: 400 }
      );
    }

    // Update service status to cancelled
    const updateResult = await query(
      `UPDATE kriptocar.service_orders 
       SET service_status = 'Cancelled'
       WHERE service_order_id = ? AND user_id = ?`,
      [service_order_id, user_id]
    ) as any;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to cancel service' },
        { status: 500 }
      );
    }

    // Kick off notifications and emails asynchronously so the response returns fast
    setTimeout(async () => {
      try {
        await notificationIdGenerator.createNotification({
          user_id: user_id,
          notification_type: 'service_cancelled',
          title: `Service Cancelled - ${order.service_name}`,
          message: `Your service booking #${order.service_order_id} has been cancelled successfully. Refund will be processed.`
        });
        console.log('✅ Customer notification created for service cancellation');
      } catch (notificationError) {
        console.error('❌ Error creating customer notification:', notificationError);
      }

      if (order.vendor_id) {
        try {
          await notificationIdGenerator.createNotification({
            user_id: order.vendor_id,
            notification_type: 'service_cancelled',
            title: `Service Cancelled #${order.service_order_id} - ${order.customer_name}`,
            message: `Service booking "${order.service_name}" has been cancelled by ${order.customer_name}. Scheduled for ${order.service_date} at ${order.service_time}.`
          });
          console.log('✅ Vendor notification created for service cancellation');
        } catch (notificationError) {
          console.error('❌ Error creating vendor notification:', notificationError);
        }
      }

      if (order.vendor_email) {
        try {
          const vendorEmailData = {
            vendor_name: order.vendor_name,
            vendor_email: order.vendor_email,
            service_name: order.service_name,
            service_order_id: order.service_order_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            service_date: order.service_date,
            service_time: order.service_time,
            cancellation_date: new Date().toISOString()
          };
          await sendServiceCancellationEmail(vendorEmailData, 'vendor');
          console.log('✅ Cancellation email sent to vendor');
        } catch (emailError) {
          console.error('❌ Error sending cancellation email to vendor:', emailError);
        }
      }

      if (order.customer_email) {
        try {
          const customerEmailData = {
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            service_name: order.service_name,
            service_order_id: order.service_order_id,
            vendor_name: order.vendor_name,
            service_date: order.service_date,
            service_time: order.service_time,
            final_price: order.final_price,
            cancellation_date: new Date().toISOString()
          };
          await sendServiceCancellationEmail(customerEmailData, 'customer');
          console.log('✅ Cancellation email sent to customer');
        } catch (emailError) {
          console.error('❌ Error sending cancellation email to customer:', emailError);
        }
      }
    }, 0);

    return NextResponse.json({
      success: true,
      message: 'Service cancelled successfully',
      service_order_id: service_order_id
    });

  } catch (error) {
    console.error('❌ Error cancelling service:', error);
    
    let errorMessage = 'Failed to cancel service';
    
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
