import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { sendOrderConfirmationEmail, sendCustomerOrderConfirmationEmail, sendDealerOrderNotificationEmail } from '@/lib/email';
import { notificationIdGenerator } from '@/lib/notificationIdGenerator';
import { createOrderNotifications, createMultipleOrderNotifications } from '@/lib/notifications';

// Track processed requests to prevent duplicates
const processedRequests = new Set();

export async function POST(request: NextRequest) {
  const requestId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  
  // Check if this request has already been processed
  if (processedRequests.has(requestId)) {
    return NextResponse.json(
      { success: false, message: 'Duplicate request detected' },
      { status: 409 }
    );
  }
  
  processedRequests.add(requestId);
  
  let connection;
  
  try {
    const body = await request.json();
    const { cartItems, orderData } = body;
    
    // Validate request structure
    if (!orderData || !orderData.user_id || !cartItems || !Array.isArray(cartItems)) {
      return NextResponse.json(
        { success: false, message: 'Invalid request structure' },
        { status: 400 }
      );
    }
    
    const { user_id } = orderData;
    
    // Validate user_id format
    if (!user_id.match(/^USR\d{3}$/)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user_id format. Expected format: USR001 to USR999' },
        { status: 400 }
      );
    }
    
    // Extract user number (e.g., USR001 -> 001)
    const userNumber = user_id.replace(/\D/g, '');
    
    // Database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });
    
    // Start transaction for atomic operations
    await connection.beginTransaction();
    
    try {
      // Step 1: Validate all products exist and get dealer information
      const productIds = cartItems.map(item => item.product_id);
      const [products] = await connection.execute(
        `SELECT 
          p.product_id,
          p.name,
          p.sale_price,
          p.stock_quantity,
          p.is_active,
          p.dealer_id,
          p.image_1,
          d.business_name as dealer_name,
          d.email as dealer_email
        FROM kriptocar.products p
        LEFT JOIN kriptocar.dealers d ON p.dealer_id = d.dealer_id
        WHERE p.product_id IN (${productIds.map(() => '?').join(',')})`,
        productIds
      ) as [any[], any];
      
      if ((products as any[]).length !== cartItems.length) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'One or more products not found' },
          { status: 404 }
        );
      }
      
      // Check if all products are active and available
      const inactiveProducts = (products as any[]).filter(p => !p.is_active || p.stock_quantity <= 0);
      if (inactiveProducts.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { 
            success: false, 
            message: 'Some products are not available for purchase',
            products: inactiveProducts.map(p => ({ id: p.product_id, name: p.name, reason: !p.is_active ? 'Inactive' : 'Out of stock' }))
          },
          { status: 400 }
        );
      }
      
      // Create product map for easy lookup
      const productMap = new Map((products as any[]).map((p: any) => [p.product_id, p]));
      
      // Step 1.5: Validate stock availability
      console.log('📦 Validating stock availability...');
      const stockValidationErrors: string[] = [];
      
      for (const item of cartItems) {
        const product = productMap.get(item.product_id);
        const availableStock = product.stock_quantity || 0;
        
        if (availableStock < item.quantity) {
          stockValidationErrors.push(
            `Product "${product.name}" (ID: ${item.product_id}) - Requested: ${item.quantity}, Available: ${availableStock}`
          );
        }
      }
      
      if (stockValidationErrors.length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { 
            success: false, 
            message: 'Insufficient stock for some products',
            errors: stockValidationErrors
          },
          { status: 400 }
        );
      }
      
      console.log('✅ Stock validation passed for all products');
      
      // Step 2: Generate unique order IDs for each product line
      const orderIds: string[] = [];
      
      // Get existing order IDs for this user with proper locking
      const [existingUserOrders] = await connection.execute(
        'SELECT order_id FROM kriptocar.orders WHERE user_id = ? ORDER BY order_id FOR UPDATE',
        [user_id]
      );
      
      // Extract existing order numbers for this user
      const existingOrderNumbers = (existingUserOrders as any[])
        .map((row: any) => row.order_id)
        .filter((id: any) => id.startsWith(`ORD${userNumber}`))
        .map((id: any) => {
          const match = id.match(new RegExp(`ORD${userNumber}(\\d+)`));
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a: any, b: any) => a - b);
      
      // Find the next available order number using range-based approach
      let nextOrderNumber = 1;
      const rangeSize = 10;
      
      if (existingOrderNumbers.length > 0) {
        for (let i = 1; i <= Math.max(...existingOrderNumbers) + rangeSize; i++) {
          if (!existingOrderNumbers.includes(i)) {
            nextOrderNumber = i;
            break;
          }
        }
      }
      
      // Generate unique order IDs for each cart item
      for (let i = 0; i < cartItems.length; i++) {
        const orderNumber = nextOrderNumber + i;
        const proposedId = `ORD${userNumber}${orderNumber}`;
        
        // Double-check this ID doesn't exist
        const [existingOrder] = await connection.execute(
          'SELECT order_id FROM kriptocar.orders WHERE order_id = ?',
          [proposedId]
        );
        
        if ((existingOrder as any[]).length > 0) {
          // Find next available ID
          let attemptNumber = orderNumber + 1;
          let maxAttempts = 100;
          
          while (attemptNumber < orderNumber + maxAttempts) {
            const alternativeId = `ORD${userNumber}${attemptNumber}`;
            const [checkExisting] = await connection.execute(
              'SELECT order_id FROM kriptocar.orders WHERE order_id = ?',
              [alternativeId]
            );
            
            if ((checkExisting as any[]).length === 0) {
              orderIds.push(alternativeId);
              console.log(`Generated order ID ${i + 1}: ${alternativeId} (alternative)`);
              break;
            }
            attemptNumber++;
          }
          
          if (attemptNumber >= orderNumber + maxAttempts) {
            await connection.rollback();
            return NextResponse.json(
              { success: false, message: 'Failed to generate unique order ID' },
              { status: 500 }
            );
          }
        } else {
          orderIds.push(proposedId);
          console.log(`Generated order ID ${i + 1}: ${proposedId}`);
        }
      }
      
      // Step 3: Create parent order record for relationship tracking
      const parentOrderId = `PORD${userNumber}${nextOrderNumber}`;
      
      // Check if parent order ID exists
      const [existingParentOrder] = await connection.execute(
        'SELECT order_id FROM kriptocar.orders WHERE order_id = ?',
        [parentOrderId]
      );
      
      if ((existingParentOrder as any[]).length > 0) {
        await connection.rollback();
        return NextResponse.json(
          { success: false, message: 'Parent order ID conflict' },
          { status: 500 }
        );
      }
      
      // Step 4: Prepare order data for insertion
      const orderPlaceholders = cartItems.map(() => 
        '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
      ).join(', ');
      
      const flatValues: any[] = [];
      
      cartItems.forEach((item, index) => {
        const product = productMap.get(item.product_id);
        const orderId = orderIds[index];
        
        flatValues.push(
          orderId,                    // order_id
          user_id,                    // user_id
          product.dealer_id,          // dealer_id
          item.product_id,            // product_id
          item.quantity,              // quantity
          orderData.customer_name,    // customer_name
          orderData.customer_email,   // customer_email
          orderData.customer_phone,   // customer_phone
          orderData.shipping_address, // shipping_address
          orderData.shipping_pincode, // shipping_pincode
          new Date(),                 // order_date
          'Pending',                  // order_status
          Number(productMap.get(item.product_id).sale_price) * item.quantity, // total_amount
          orderData.tax_amount || 0,  // tax_amount
          orderData.shipping_cost || 0, // shipping_cost
          orderData.discount_amount || 0, // discount_amount
          orderData.payment_method,   // payment_method
          'Pending',                  // payment_status
          orderData.transaction_id || null // transaction_id
        );
      });
      
      // Step 5: Insert all orders in a single transaction
      const [result] = await connection.execute(
        `INSERT INTO kriptocar.orders (
          order_id, user_id, dealer_id, product_id, qauntity, customer_name, customer_email, 
          customer_phone, shipping_address, shipping_pincode, order_date, 
          order_status, total_amount, tax_amount, shipping_cost, 
          discount_amount, payment_method, payment_status, transaction_id
        ) VALUES ${orderPlaceholders}`,
        flatValues
      );

      // Step 5.5: Update product quantities (reduce stock)
      console.log('📦 Updating product quantities...');
      for (const item of cartItems) {
        const product = productMap.get(item.product_id);
        const currentQuantity = product.stock_quantity || 0;
        const newQuantity = Math.max(0, currentQuantity - item.quantity);
        
        try {
          await connection.execute(
            'UPDATE kriptocar.products SET stock_quantity = ? WHERE product_id = ?',
            [newQuantity, item.product_id]
          );
          console.log(`✅ Updated product ${item.product_id}: ${currentQuantity} → ${newQuantity} (reduced by ${item.quantity})`);
        } catch (updateError) {
          console.error(`❌ Failed to update quantity for product ${item.product_id}:`, updateError);
          // Don't rollback the entire transaction for quantity update failures
          // The order is still valid even if quantity update fails
        }
      }
      
      // Step 6: Group orders by dealer for separate processing
      const ordersByDealer = new Map();
      const allOrdersForCustomer: any[] = [];
      
      cartItems.forEach((item, index) => {
        const product = productMap.get(item.product_id);
        const dealerId = (product as any).dealer_id;
        const orderId = orderIds[index];
        
        if (!ordersByDealer.has(dealerId)) {
          ordersByDealer.set(dealerId, []);
        }
        
        const orderData = {
          order_id: orderId,
          product_id: item.product_id,
          product_name: (product as any).name,
          product_price: Number((product as any).sale_price),
          quantity: item.quantity,
          total_price: Number((product as any).sale_price) * item.quantity,
          dealer_name: (product as any).dealer_name
        };
        
        ordersByDealer.get(dealerId).push(orderData);
        allOrdersForCustomer.push({
          ...orderData,
          dealer_name: (product as any).dealer_name
        });
      });
      
      // Step 7: Commit transaction first for faster UI response
      await connection.commit();
      
      // Step 8: Handle emails and notifications asynchronously (non-blocking)
      setTimeout(async () => {
        try {
          // Create separate notifications for each product/order
          console.log('🔔 Creating separate notifications for each product...');
          
          for (let i = 0; i < cartItems.length; i++) {
            const item = cartItems[i];
            const orderId = orderIds[i];
            const product = productMap.get(item.product_id);
            const dealerId = product.dealer_id;
            const dealerEmail = product.dealer_email;
            
            if (dealerEmail) {
              // Prepare individual order data for each product
              const individualOrderData = {
                customer_name: orderData.customer_name || orderData.customer_email?.split('@')[0] || 'Customer',
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                total_amount: Number(product.sale_price) * item.quantity,
                order_status: 'Pending',
                payment_status: 'Pending',
                shipping_address: orderData.shipping_address,
                shipping_pincode: orderData.shipping_pincode,
                items: [{
                  product_id: item.product_id,
                  name: item.name,
                  price: Number(product.sale_price),
                  quantity: item.quantity
                }],
                order_date: new Date().toISOString(),
                // Single order data
                order_ids: [orderId],
                total_orders: 1,
                total_items: item.quantity,
                product_details: [{
                  product_id: item.product_id,
                  product_name: item.name,
                  quantity: item.quantity,
                  unit_price: Number(product.sale_price),
                  total_price: Number(product.sale_price) * item.quantity
                }],
                dealer_name: product.dealer_name,
                dealer_id: dealerId
              };

              // Send individual email to dealer for this specific product
              
              // Send individual email to dealer for this specific product
              const dealerEmailData = {
                order_id: orderId,
                dealer_name: product.dealer_name,
                dealer_email: dealerEmail,
                customer_name: orderData.customer_name || orderData.customer_email?.split('@')[0] || 'Customer',
                customer_email: orderData.customer_email,
                customer_phone: orderData.customer_phone,
                total_amount: Number(product.sale_price) * item.quantity,
                order_date: new Date().toISOString(),
                order_status: 'Pending',
                payment_status: 'Pending',
                shipping_address: orderData.shipping_address,
                shipping_pincode: orderData.shipping_pincode,
                items: [{
                  product_id: item.product_id,
                  name: item.name,
                  price: Number(product.sale_price),
                  quantity: item.quantity
                }],
                // Single order data
                orders: [{
                  order_id: orderId,
                  product_id: item.product_id,
                  product_name: item.name,
                  product_price: Number(product.sale_price),
                  quantity: item.quantity,
                  total_price: Number(product.sale_price) * item.quantity,
                  dealer_name: product.dealer_name
                }],
                total_orders: 1,
                total_items: item.quantity,
                order_ids: [orderId],
                product_details: [{
                  product_id: item.product_id,
                  product_name: item.name,
                  quantity: item.quantity,
                  unit_price: Number(product.sale_price),
                  total_price: Number(product.sale_price) * item.quantity
                }],
                is_multiple_orders: false,
                is_multiple_products: false
              };
              
              try {
                console.log(`📧 Sending individual notification email to dealer for order ${orderId}:`, dealerEmail);
                const emailResult = await sendDealerOrderNotificationEmail(dealerEmailData);
                console.log(`✅ Individual notification email sent to dealer ${product.dealer_name} for order ${orderId}:`, emailResult);
              } catch (emailError) {
                console.error(`❌ Failed to send individual notification email to dealer ${product.dealer_name} for order ${orderId}:`, emailError);
              }
            }
          }
          
          // Send comprehensive email to customer
          const customerEmailData = {
            customer_name: orderData.customer_name || orderData.customer_email?.split('@')[0] || 'Customer',
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            shipping_address: orderData.shipping_address,
            shipping_pincode: orderData.shipping_pincode,
            orders: allOrdersForCustomer,
            total_amount: allOrdersForCustomer.reduce((sum: any, o: any) => sum + o.total_price, 0),
            tax_amount: orderData.tax_amount || 0,
            shipping_cost: orderData.shipping_cost || 0,
            discount_amount: orderData.discount_amount || 0,
            payment_method: orderData.payment_method,
            payment_status: 'Pending'
          };
          
          try {
            console.log('📧 Attempting to send customer confirmation email to:', customerEmailData.customer_email);
            const emailResult = await sendCustomerOrderConfirmationEmail(customerEmailData);
            if (emailResult) {
              console.log('✅ Customer confirmation email sent successfully');
            } else {
              console.log('❌ Customer confirmation email failed to send');
            }
          } catch (emailError) {
            console.error('❌ Failed to send email to customer:', emailError);
          }
          
          // Create notification for customer
          try {
            await notificationIdGenerator.createNotification({
              user_id: user_id,
              notification_type: 'order_placed',
              title: 'Order Placed Successfully',
              message: `Your order with ${cartItems.length} item(s) has been placed successfully`
            });
          } catch (notificationError) {
            console.error('Failed to create notification for customer:', notificationError);
          }

                      // Create separate notifications for each product/order (admin and dealer)
                      try {
                        console.log('🔔 Creating separate notifications for each product...');
                        
                        for (let i = 0; i < cartItems.length; i++) {
                          const item = cartItems[i];
                          const orderId = orderIds[i];
                          const product = productMap.get(item.product_id);
                          
                          const individualOrderData = {
                            customer_name: orderData.customer_name || orderData.customer_email?.split('@')[0] || 'Customer',
                            customer_email: orderData.customer_email,
                            customer_phone: orderData.customer_phone,
                            user_id: orderData.user_id, // Add user ID for admin notifications
                            total_amount: Number(product.sale_price) * item.quantity,
                            order_status: 'Pending',
                            payment_status: 'Pending',
                            shipping_address: orderData.shipping_address,
                            shipping_pincode: orderData.shipping_pincode,
                            items: [{
                              product_id: item.product_id,
                              name: item.name,
                              price: Number(product.sale_price),
                              quantity: item.quantity
                            }],
                            order_date: new Date().toISOString(),
                            // Single order data
                            order_ids: [orderId],
                            total_orders: 1,
                            total_items: item.quantity,
                            product_details: [{
                              product_id: item.product_id,
                              product_name: item.name,
                              quantity: item.quantity,
                              unit_price: Number(product.sale_price),
                              total_price: Number(product.sale_price) * item.quantity
                            }],
                            dealer_name: product.dealer_name,
                            dealer_id: product.dealer_id
                          };

                          // Create individual notification for each product (admin + dealer)
                          await createOrderNotifications(individualOrderData, orderId, product.dealer_id);
                          console.log(`✅ Individual notification created for order ${orderId} - ${item.name}`);
                        }
                        
                        console.log(`✅ Created ${cartItems.length} separate notifications`);
                      } catch (notificationError) {
                        console.error('❌ Failed to create individual notifications:', notificationError);
                      }
        } catch (error) {
          console.error('Error in async email/notification processing:', error);
        }
             }, 100); // Small delay to ensure order is committed first
      
      // Prepare response data
      const orderItems = cartItems.map((item, index) => {
        const product = productMap.get(item.product_id);
        return {
          order_id: orderIds[index],
          product_id: item.product_id,
          name: item.name,
          price: Number(product.sale_price),
          quantity: item.quantity,
          image: product?.image_1 || item.image,
          dealer_name: product?.dealer_name
        };
      });
      
      const responseData = {
        success: true,
        message: 'Orders placed successfully',
        orders: orderItems,
        total_items: cartItems.length,
        total_amount: cartItems.reduce((sum, item) => sum + (Number(productMap.get(item.product_id).sale_price) * item.quantity), 0),
        order_ids: orderIds,
        parent_order_id: parentOrderId
      };
      
      console.log('Checkout completed successfully:', responseData);
      
      return NextResponse.json(responseData);
      
    } catch (error) {
      await connection.rollback();
      console.error('Transaction error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to process orders' },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.end();
    }
    // Clean up processed request after a delay
    setTimeout(() => {
      processedRequests.delete(requestId);
    }, 5000);
  }
} 