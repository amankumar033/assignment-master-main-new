import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { createServiceOrderNotifications } from '@/lib/notifications';
// import { serviceOrderIdGenerator } from '@/lib/serviceOrderIdGenerator';
import { sendServiceOrderConfirmationEmail } from '@/lib/email';
import mysql from 'mysql2/promise';

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

    // Generate unique service order ID using user-based logic
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    // Start transaction for service order ID generation
    await connection.beginTransaction();
    
    let uniqueServiceOrderId: string;
    
    try {
      // Extract user number from user_id (e.g., USR003 -> 003)
      const userNumber = user_id.replace(/\D/g, '');
      if (!userNumber) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'Invalid user_id format' },
          { status: 400 }
        );
      }

      // Get existing service orders for this user
      const [existingUserServiceOrders] = await connection.execute(
        'SELECT service_order_id FROM kriptocar.service_orders WHERE user_id = ? ORDER BY service_order_id FOR UPDATE',
        [user_id]
      );

      // Extract existing service order numbers for this user
      const existingServiceOrderNumbers = (existingUserServiceOrders as any[])
        .map((row: any) => row.service_order_id)
        .filter((id: string) => id.startsWith(`SRVD${userNumber}`))
        .map((id: string) => {
          const match = id.match(new RegExp(`SRVD${userNumber}(\\d+)`));
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a: number, b: number) => a - b);

      // Find the next available service order number using range-based approach
      let nextServiceOrderNumber = 1;
      const rangeSize = 10; // Each range has 10 numbers (1-10, 11-20, etc.)
      
      if (existingServiceOrderNumbers.length > 0) {
        // Find the first available number in the sequence
        for (let i = 1; i <= Math.max(...existingServiceOrderNumbers) + rangeSize; i++) {
          if (!existingServiceOrderNumbers.includes(i)) {
            nextServiceOrderNumber = i;
            break;
          }
        }
      }

      // Generate unique service order ID
      const proposedServiceOrderId = `SRVD${userNumber}${nextServiceOrderNumber}`;
      
      // Double-check this ID doesn't exist (in case of race conditions)
      const [existingServiceOrder] = await connection.execute(
        'SELECT service_order_id FROM kriptocar.service_orders WHERE service_order_id = ?',
        [proposedServiceOrderId]
      );
      
      uniqueServiceOrderId = proposedServiceOrderId;
      
      if ((existingServiceOrder as any[]).length > 0) {
        // If ID exists, find the next available one in the sequence
        let attemptNumber = nextServiceOrderNumber + 1;
        const maxAttempts = 100;
        
        while (attemptNumber < nextServiceOrderNumber + maxAttempts) {
          const alternativeId = `SRVD${userNumber}${attemptNumber}`;
          const [checkExisting] = await connection.execute(
            'SELECT service_order_id FROM kriptocar.service_orders WHERE service_order_id = ?',
            [alternativeId]
          );
          
          if ((checkExisting as any[]).length === 0) {
            uniqueServiceOrderId = alternativeId;
            console.log(`Generated service order ID: ${alternativeId} (alternative)`);
            break;
          }
          attemptNumber++;
        }
        
        if (attemptNumber >= nextServiceOrderNumber + maxAttempts) {
          await connection.rollback();
          return NextResponse.json(
            { success: false, message: 'Failed to generate unique service order ID' },
            { status: 500 }
          );
        }
      } else {
        console.log(`Generated service order ID: ${proposedServiceOrderId}`);
      }

      await connection.commit();
      await connection.end();
    } catch (error) {
      await connection.rollback();
      await connection.end();
      throw error;
    }

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

    // Handle notifications and emails asynchronously (non-blocking)
    setTimeout(async () => {
      try {
        // Create notifications for admin and vendor
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
    }, 100); // Small delay to ensure order is committed first

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
