import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createOrderNotifications } from '@/lib/notifications';
import { DatabaseOrderIdGenerator } from '@/lib/orderIdGenerator';

export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json();
    const { user_id } = orderData;

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get cart items
    const users = await query(
      'SELECT cart_items FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    let cartItems: any[] = [];
    if (users[0].cart_items) {
      if (typeof users[0].cart_items === 'string') {
        try {
          const trimmed = users[0].cart_items.trim();
          if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
            cartItems = JSON.parse(trimmed);
          } else {
            // Not valid JSON, treat as empty
            cartItems = [];
          }
        } catch (error) {
          console.error('Error parsing cart items:', error, users[0].cart_items);
          cartItems = [];
        }
      } else if (Array.isArray(users[0].cart_items)) {
        cartItems = users[0].cart_items;
      }
    }
    
    if (cartItems.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Validate stock and get product details
    const productIds = cartItems.map((item: any) => item.product_id);
    const productPlaceholders = productIds.map(() => '?').join(',');
    
    const products = await query(
      `SELECT product_id, name, stock_quantity, dealer_id, image_1 FROM kriptocar.products WHERE product_id IN (${productPlaceholders})`,
      productIds
    ) as any[];

    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.product_id, product);
    });

    // Validate stock for each item
    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      
      if (!product) {
        return NextResponse.json(
          { success: false, message: `Product ${item.product_id} not found` },
          { status: 400 }
        );
      }
      if (product.stock_quantity < item.quantity) {
        return NextResponse.json(
          { success: false, message: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Get the highest order ID once, then increment for each order
    const rows = await query(
      'SELECT COALESCE(MAX(CAST(SUBSTRING(order_id, 4) AS UNSIGNED)), 0) AS max_number FROM kriptocar.orders WHERE order_id LIKE "ORD%"'
    );
    
    const maxNumber = (rows as any[])[0]?.max_number ?? 0;
    console.log(`Current highest order ID: ORD${maxNumber}`);
    
    // Generate order IDs by incrementing from the highest
    const orderIds: string[] = [];
    for (let i = 0; i < cartItems.length; i++) {
      const nextNumber = maxNumber + i + 1;
      const orderId = `ORD${nextNumber}`;
      orderIds.push(orderId);
      console.log(`Generated order ID ${i + 1}: ${orderId}`);
    }
    
    console.log('🔄 Starting batch order creation process...');
    console.log('Cart items to process:', cartItems.length);
    
    // Validate all dealers exist
    for (const item of cartItems) {
      const product = productMap.get(item.product_id);
      if (!product?.dealer_id) {
        console.log(`❌ No dealer found for product ${item.product_id}`);
        return NextResponse.json(
          { success: false, message: `No dealer found for product ${item.product_id}` },
          { status: 400 }
        );
      }
    }
    
    // Prepare batch insertion data
    const orderValues = cartItems.map((item, index) => {
      const product = productMap.get(item.product_id);
      const uniqueOrderId = orderIds[index];
      
      return [
        uniqueOrderId,
        user_id,
        product.dealer_id,
        item.product_id,
        orderData.customer_name,
        orderData.customer_email,
        orderData.customer_phone,
        orderData.shipping_address,
        orderData.shipping_pincode,
        new Date().toISOString().slice(0, 19).replace('T', ' '),
        orderData.order_status,
        (Number(item.price) * item.quantity) + orderData.tax_amount + orderData.shipping_cost - orderData.discount_amount,
        orderData.tax_amount,
        orderData.shipping_cost,
        orderData.discount_amount,
        orderData.payment_method,
        orderData.payment_status,
        orderData.transaction_id
      ];
    });

    // Batch insert all orders
    const orderPlaceholders = orderValues.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
    const flatValues = orderValues.flat();
    
    // Declare variables at function level
    let insertedOrderIds: string[] = [];
    let orderItems: any[] = [];
    
    try {
      const result = await query(
        `INSERT INTO kriptocar.orders (
          order_id, user_id, dealer_id, product_id, customer_name, customer_email, 
          customer_phone, shipping_address, shipping_pincode, order_date, 
          order_status, total_amount, tax_amount, shipping_cost, 
          discount_amount, payment_method, payment_status, transaction_id
        ) VALUES ${orderPlaceholders}`,
        flatValues
      ) as any;

      console.log(`📊 Batch insert result:`, result);
      
      if (result && result.affectedRows > 0) {
        insertedOrderIds = orderIds;
        orderItems = cartItems.map((item, index) => {
          const product = productMap.get(item.product_id);
          return {
            product_id: item.product_id,
            name: item.name,
            price: Number(item.price),
            quantity: item.quantity,
            image: product?.image_1 || item.image
          };
        });
        
        console.log(`✅ All orders inserted successfully:`, insertedOrderIds);
      } else {
        console.log(`❌ Failed to insert orders - no rows affected`);
        return NextResponse.json(
          { success: false, message: 'Failed to create orders' },
          { status: 500 }
        );
      }
    } catch (insertError: any) {
      console.error(`❌ Error inserting orders:`, insertError);
      return NextResponse.json(
        { success: false, message: `Database error: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log(`📋 Final insertedOrderIds array:`, insertedOrderIds);
    console.log(`📋 Final orderItems array:`, orderItems);

    // Update stock quantities using CASE statement for better performance
    if (cartItems.length > 0) {
      const productIds = cartItems.map(item => item.product_id);
      const stockPlaceholders = productIds.map(() => '?').join(',');
      const quantities = cartItems.map(item => item.quantity);
      
      const caseStatement = cartItems.map((item, index) => 
        `WHEN product_id = ? THEN stock_quantity - ?`
      ).join(' ');
      
      await query(
        `UPDATE kriptocar.products SET stock_quantity = CASE ${caseStatement} ELSE stock_quantity END WHERE product_id IN (${stockPlaceholders})`,
        [...cartItems.flatMap(item => [item.product_id, item.quantity]), ...productIds]
      );
    }

    // Clear cart AFTER successful order insertion and stock update
    await query(
      'UPDATE kriptocar.users SET cart_items = ? WHERE user_id = ?',
      [null, user_id]
    );

    // Prepare response data first
    const responseData = {
      success: true,
      message: 'Order placed successfully',
      order_id: insertedOrderIds[0], // For backward compatibility
      order_ids: insertedOrderIds,
      items: cartItems.length
    };

    console.log('📤 Returning response:', responseData);
    
    // Send response immediately
    const response = NextResponse.json(responseData);

    // Handle email and notifications AFTER sending response (completely non-blocking)
    if (insertedOrderIds.length > 0) {
      // Use Promise.resolve().then() to run email and notifications after response is sent
      Promise.resolve().then(async () => {
        try {
          console.log('📧 Starting background email and notification tasks...');
          console.log('📧 Email configuration check:');
          console.log('  - EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
          console.log('  - EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
          
          const orderEmailData = {
            order_id: insertedOrderIds[0], // Use the first order ID for email
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            shipping_address: orderData.shipping_address,
            shipping_pincode: orderData.shipping_pincode,
            order_date: new Date().toISOString(),
            order_status: orderData.order_status,
            total_amount: orderData.total_amount,
            tax_amount: orderData.tax_amount,
            shipping_cost: orderData.shipping_cost,
            discount_amount: orderData.discount_amount,
            payment_method: orderData.payment_method,
            payment_status: orderData.payment_status,
            transaction_id: orderData.transaction_id,
            items: orderItems
          };

          // Send email asynchronously
          console.log('📧 Sending order confirmation email to:', orderData.customer_email);
          console.log('📧 Order email data:', {
            order_id: orderEmailData.order_id,
            customer_name: orderEmailData.customer_name,
            total_amount: orderEmailData.total_amount,
            items_count: orderEmailData.items.length
          });
          
          const emailSent = await sendOrderConfirmationEmail(orderEmailData);
          if (emailSent) {
            console.log('✅ Order confirmation email sent successfully to:', orderData.customer_email);
          } else {
            console.error('❌ Failed to send order confirmation email to:', orderData.customer_email);
            console.error('❌ This might be due to missing email configuration (EMAIL_USER, EMAIL_PASSWORD)');
          }
        } catch (emailError) {
          console.error('❌ Error sending order confirmation email:', emailError);
          console.error('❌ Email error details:', {
            message: emailError instanceof Error ? emailError.message : 'Unknown error',
            stack: emailError instanceof Error ? emailError.stack : undefined
          });
        }

        // Create notifications asynchronously
        try {
          console.log('🔔 Creating order notifications...');
          const primaryDealerId = products[0]?.dealer_id || null;
          const notificationOrderData = { ...orderData, items: orderItems };
          await createOrderNotifications(notificationOrderData, insertedOrderIds[0], primaryDealerId);
          console.log('✅ Order notifications created successfully');
        } catch (notificationError) {
          console.error('❌ Error creating order notifications:', notificationError);
          console.error('❌ Notification error details:', {
            message: notificationError instanceof Error ? notificationError.message : 'Unknown error',
            stack: notificationError instanceof Error ? notificationError.stack : undefined
          });
        }
      }).catch(error => {
        console.error('❌ Background task error:', error);
        console.error('❌ Background task error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
      });
    }

    return response;

  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process checkout' },
      { status: 500 }
    );
  }
} 