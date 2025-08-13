import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendServiceAcceptanceEmail, sendVendorAcceptanceConfirmationEmail } from '@/lib/email';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ serviceOrderId: string }> }
) {
  try {
    const { serviceOrderId } = await params;
    const orderId = serviceOrderId; // Use the service order ID directly since it's varchar

    if (!orderId || orderId.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid service order ID' },
        { status: 400 }
      );
    }

    // Get service order details with vendor information
    const orders = await query(
      `SELECT 
        so.*,
        v.vendor_name,
        v.contact_email as vendor_email,
        v.contact_phone as vendor_phone,
        v.business_address as vendor_address
      FROM kriptocar.service_orders so
      LEFT JOIN kriptocar.vendors v ON so.vendor_id = v.vendor_id
      WHERE so.service_order_id = ?`,
      [orderId]
    ) as any[];

    if (!orders || orders.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service order not found' },
        { status: 404 }
      );
    }

    const order = orders[0];

    return NextResponse.json({
      success: true,
      order: order
    });

  } catch (error) {
    console.error('Error fetching service order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch service order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ serviceOrderId: string }> }
) {
  try {
    const { serviceOrderId } = await params;
    const body = await request.json();
    const { new_status, updated_by, vendor_id } = body;

    if (!serviceOrderId || serviceOrderId.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'Invalid service order ID' },
        { status: 400 }
      );
    }

    if (!new_status) {
      return NextResponse.json(
        { success: false, message: 'New status is required' },
        { status: 400 }
      );
    }

    // Get current service order details
    const currentOrder = await query(
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
      WHERE service_order_id = ?`,
      [serviceOrderId]
    ) as any[];

    if (!currentOrder || currentOrder.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Service order not found' },
        { status: 404 }
      );
    }

    const order = currentOrder[0];
    const previousStatus = order.service_status;

    // Update service status
    const updateResult = await query(
      `UPDATE kriptocar.service_orders 
       SET service_status = ?, updated_at = NOW() 
       WHERE service_order_id = ?`,
      [new_status, serviceOrderId]
    ) as any;

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update service status' },
        { status: 500 }
      );
    }

    console.log(`✅ Service order ${serviceOrderId} status updated from "${previousStatus}" to "${new_status}"`);

    // Handle email notifications for specific status changes
    if (new_status.toLowerCase() === 'accepted' && previousStatus.toLowerCase() === 'pending') {
      try {
        // Get user details
        const userDetails = await query(
          'SELECT full_name, email, phone FROM kriptocar.users WHERE user_id = ?',
          [order.user_id]
        ) as any[];

        const customerName = userDetails.length > 0 ? userDetails[0].full_name : 'Customer';
        const customerEmail = userDetails.length > 0 ? userDetails[0].email : '';
        const customerPhone = userDetails.length > 0 ? userDetails[0].phone || 'Not provided' : 'Not provided';

        // Get vendor details
        const vendorDetails = await query(
          'SELECT vendor_name, contact_email FROM kriptocar.vendors WHERE vendor_id = ?',
          [order.vendor_id]
        ) as any[];

        const vendorName = vendorDetails.length > 0 ? vendorDetails[0].vendor_name : `Vendor ${order.vendor_id}`;
        const vendorEmail = vendorDetails.length > 0 ? vendorDetails[0].contact_email : '';

        // Send email to customer
        if (customerEmail) {
          const customerEmailData = {
            service_order_id: serviceOrderId,
            customer_name: customerName,
            customer_email: customerEmail,
            service_name: order.service_name,
            service_category: order.service_category,
            service_type: order.service_type,
            final_price: Number(order.final_price),
            service_date: order.service_date,
            service_time: order.service_time,
            service_address: order.service_address,
            service_pincode: order.service_pincode,
            vendor_name: vendorName,
            additional_notes: order.additional_notes
          };

          const customerEmailSent = await sendServiceAcceptanceEmail(customerEmailData);
          if (customerEmailSent) {
            console.log('✅ Service acceptance email sent to customer:', customerEmail);
          } else {
            console.log('❌ Failed to send service acceptance email to customer:', customerEmail);
          }
        }

        // Send confirmation email to vendor
        if (vendorEmail) {
          const vendorEmailData = {
            service_order_id: serviceOrderId,
            vendor_name: vendorName,
            vendor_email: vendorEmail,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            service_name: order.service_name,
            service_category: order.service_category,
            service_type: order.service_type,
            final_price: Number(order.final_price),
            service_date: order.service_date,
            service_time: order.service_time,
            service_address: order.service_address,
            service_pincode: order.service_pincode,
            additional_notes: order.additional_notes
          };

          const vendorEmailSent = await sendVendorAcceptanceConfirmationEmail(vendorEmailData);
          if (vendorEmailSent) {
            console.log('✅ Service acceptance confirmation email sent to vendor:', vendorEmail);
          } else {
            console.log('❌ Failed to send service acceptance confirmation email to vendor:', vendorEmail);
          }
        }

      } catch (emailError) {
        console.error('❌ Error sending acceptance emails:', emailError);
        // Don't fail the status update if emails fail
      }
    }

    return NextResponse.json({
      success: true,
      message: `Service status updated successfully from "${previousStatus}" to "${new_status}"`,
      previous_status: previousStatus,
      new_status: new_status
    });

  } catch (error) {
    console.error('Error updating service order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update service status' },
      { status: 500 }
    );
  }
} 