import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createServiceOrderNotifications } from '@/lib/notifications';
import { serviceOrderIdGenerator } from '@/lib/serviceOrderIdGenerator';
import { sendServiceOrderConfirmationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
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
      service_date,
      service_time,
      service_address,
      service_pincode,
      payment_method,
      additional_notes
    } = body;

    console.log('=== SERVICE BOOKING API CALLED ===');
    console.log('Booking data:', body);

    // Validate required fields
    console.log('🔍 Validating required fields:');
    console.log('  user_id:', user_id);
    console.log('  service_id:', service_id);
    console.log('  vendor_id:', vendor_id, '(type:', typeof vendor_id, ')');
    console.log('  service_name:', service_name);
    console.log('  service_date:', service_date);
    console.log('  service_time:', service_time);
    console.log('  service_address:', service_address);
    console.log('  service_pincode:', service_pincode);
    
    if (!user_id || !service_id || !vendor_id || !service_name || !service_date || !service_time || !service_address || !service_pincode) {
      console.log('❌ Missing required fields');
      const missingFields = [];
      if (!user_id) missingFields.push('user_id');
      if (!service_id) missingFields.push('service_id');
      if (!vendor_id) missingFields.push('vendor_id');
      if (!service_name) missingFields.push('service_name');
      if (!service_date) missingFields.push('service_date');
      if (!service_time) missingFields.push('service_time');
      if (!service_address) missingFields.push('service_address');
      if (!service_pincode) missingFields.push('service_pincode');
      
      console.log('❌ Missing fields:', missingFields);
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate date and time
    const selectedDateTime = new Date(`${service_date} ${service_time}`);
    const now = new Date();
    if (selectedDateTime <= now) {
      console.log('❌ Service date must be in the future');
      return NextResponse.json(
        { success: false, message: 'Service date and time must be in the future' },
        { status: 400 }
      );
    }

    // Generate unique service order ID using the improved generator
    const uniqueServiceOrderId = await serviceOrderIdGenerator.generateServiceOrderId();

    // Check if vendor_id exists in vendors table
    const vendorCheck = await query(
      'SELECT vendor_id, vendor_name, contact_email FROM kriptocar.vendors WHERE vendor_id = ?',
      [vendor_id]
    ) as any[];
    
    console.log('🔍 Vendor check result:', vendorCheck);
    console.log('🔍 Vendor ID being used:', vendor_id);
    
    if (!vendorCheck || vendorCheck.length === 0) {
      console.log('❌ Vendor ID not found in vendors table');
      return NextResponse.json(
        { success: false, message: `Vendor ID ${vendor_id} not found in vendors table` },
        { status: 400 }
      );
    }

    // Get user details for notifications
    const userDetails = await query(
      'SELECT full_name, email FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    const customerName = userDetails.length > 0 ? userDetails[0].full_name : 'Customer';
    const customerEmail = userDetails.length > 0 ? userDetails[0].email : '';

    // Insert service order into service_orders table
    const result = await query(
      `INSERT INTO kriptocar.service_orders (
        service_order_id, user_id, service_id, vendor_id, service_name,
        service_description, service_category, service_type, base_price,
        final_price, duration_minutes, booking_date, service_date,
        service_time, service_status, service_pincode, service_address,
        additional_notes, payment_method, payment_status, transaction_id,
        was_available
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, 'Pending', ?, ?, ?, ?, 'Pending', NULL, 1)`,
      [
        uniqueServiceOrderId,
        user_id,
        service_id,
        vendor_id,
        service_name,
        service_description || null,
        service_category,
        service_type,
        base_price,
        final_price,
        duration_minutes,
        service_date,
        service_time,
        service_pincode,
        service_address,
        additional_notes || null,
        payment_method || null
      ]
    ) as any;

    const serviceOrderId = result.insertId;

    console.log('✅ Service order created successfully with ID:', serviceOrderId);

    // Create notifications for admin and vendor
    try {
      const serviceOrderData = {
        customer_name: customerName,
        customer_email: customerEmail,
        service_name: service_name,
                  service_category: service_category,
          service_type: service_type,
          final_price: Number(final_price), // Convert to number to fix toFixed() error
          service_date: service_date,
        service_time: service_time,
        service_status: 'Pending',
        payment_status: 'Pending',
        service_address: service_address,
        service_pincode: service_pincode,
        additional_notes: additional_notes || null
      };

      // Pass vendor details (if available) into notification flow to ensure email sending
      const vendorDetails = (vendorCheck && vendorCheck[0]) ? { name: vendorCheck[0].vendor_name, email: vendorCheck[0].contact_email } : undefined;
      await createServiceOrderNotifications(serviceOrderData, uniqueServiceOrderId, vendor_id, vendorDetails);
      console.log('✅ Service order notifications created successfully');
    } catch (notificationError) {
      console.error('❌ Error creating service order notifications:', notificationError);
      // Don't fail the service booking if notifications fail
    }

    // Send confirmation email to customer
    try {
      const emailData = {
        service_order_id: uniqueServiceOrderId,
        customer_name: customerName,
        customer_email: customerEmail,
        service_name: service_name,
        service_category: service_category,
        service_type: service_type,
        final_price: Number(final_price),
        service_date: service_date,
        service_time: service_time,
        service_status: 'Pending',
        payment_status: 'Pending',
        service_address: service_address,
        service_pincode: service_pincode,
        additional_notes: additional_notes || null,
        payment_method: payment_method || 'cod'
      };

      const emailSent = await sendServiceOrderConfirmationEmail(emailData);
      if (emailSent) {
        console.log('✅ Service order confirmation email sent successfully');
      } else {
        console.log('⚠️ Failed to send service order confirmation email');
      }
    } catch (emailError) {
      console.error('❌ Error sending service order confirmation email:', emailError);
      // Don't fail the service booking if email fails
    }

    return NextResponse.json({
      success: true,
      message: 'Service booked successfully',
      service_order_id: uniqueServiceOrderId // Return the unique SRVD ID
    });

  } catch (error) {
    console.error('❌ Error creating service order:', error);
    
    let errorMessage = 'Failed to book service';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_DUP_ENTRY')) {
        console.log('🔄 Duplicate service order ID detected');
        errorMessage = 'Service order ID conflict. Please try again.';
      } else if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Service orders table not found';
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