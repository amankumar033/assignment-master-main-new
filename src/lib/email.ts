import nodemailer from 'nodemailer';

// Create transporter function to avoid module-level environment variable issues
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD, // Use app password for Gmail
    },
  });
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    // Check if email configuration is available
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log('⚠️ Email configuration not found, skipping email send');
      console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
      console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'Set' : 'Not set');
      return false;
    }

    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (userEmail: string, userName: string): Promise<boolean> => {
  const subject = 'Welcome to KriptoCar - Your Account Has Been Created!';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #034c8c 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #034c8c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 Welcome to KriptoCar!</h1>
          <p>Your automotive journey starts here</p>
        </div>
        
        <div class="content">
          <h2>Hello ${userName},</h2>
          
          <p>Welcome to KriptoCar! We're excited to have you as part of our automotive community. Your account has been successfully created and you're now ready to explore our comprehensive range of automotive products and services.</p>
          
          <h3>What you can do with your KriptoCar account:</h3>
          <ul>
            <li>🛒 Shop for automotive parts and accessories</li>
            <li>🔧 Book professional car services</li>
            <li>📦 Track your orders and service bookings</li>
            <li>💳 Manage your payment methods</li>
            <li>📍 Find nearby service providers</li>
            <li>⭐ Read and write product reviews</li>
          </ul>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" class="button">
              Start Shopping Now
            </a>
          </div>
          
          <p><strong>Need help?</strong> Our customer support team is here to assist you. Feel free to reach out to us anytime.</p>
          
          <p>Thank you for choosing KriptoCar!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${userEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: userEmail,
    subject,
    html,
  });
};

export interface OrderItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface OrderData {
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_pincode: string;
  order_date: string;
  order_status: string;
  total_amount: number;
  tax_amount: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  items: OrderItem[];
}

export const sendOrderConfirmationEmail = async (orderData: OrderData): Promise<boolean> => {
  const subject = `Order Confirmation #${orderData.order_id} - KriptoCar`;
  
  const itemsHtml = orderData.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">
        <div style="display: flex; align-items: center;">
          <img src="${item.image || '/engine/engine1.png'}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px; margin-right: 15px;">
          <div>
            <div style="font-weight: bold; color: #333;">${item.name}</div>
            <div style="color: #666; font-size: 14px;">Quantity: ${item.quantity}</div>
          </div>
        </div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">
        $${(item.price * item.quantity).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const subtotal = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #034c8c 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .order-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .order-table th { background: #f5f5f5; padding: 12px; text-align: left; font-weight: bold; }
        .order-table td { padding: 12px; border-bottom: 1px solid #eee; }
        .total-row { font-weight: bold; background: #f8f9fa; }
        .button { display: inline-block; background: #034c8c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 Order Confirmed!</h1>
          <p>Thank you for your purchase</p>
        </div>
        
        <div class="content">
          <h2>Hello ${orderData.customer_name},</h2>
          
          <p>Thank you for your order! We're excited to process your purchase and get your automotive parts to you as soon as possible.</p>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${orderData.order_id}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.order_date).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-badge">${orderData.order_status}</span></p>
            <p><strong>Payment Method:</strong> ${orderData.payment_method}</p>
            <p><strong>Payment Status:</strong> <span class="status-badge">${orderData.payment_status}</span></p>
            ${orderData.transaction_id ? `<p><strong>Transaction ID:</strong> ${orderData.transaction_id}</p>` : ''}
          </div>
          
          <div class="order-info">
            <h3>Shipping Information</h3>
            <p><strong>Address:</strong> ${orderData.shipping_address}</p>
            <p><strong>Pincode:</strong> ${orderData.shipping_pincode}</p>
            <p><strong>Phone:</strong> ${orderData.customer_phone}</p>
          </div>
          
          <h3>Order Items</h3>
          <table class="order-table">
            <thead>
              <tr>
                <th>Product</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td style="padding: 10px; text-align: right;"><strong>Subtotal:</strong></td>
                <td style="padding: 10px; text-align: right;"><strong>$${subtotal.toFixed(2)}</strong></td>
              </tr>
              ${orderData.tax_amount > 0 ? `
                <tr>
                  <td style="padding: 10px; text-align: right;">Tax:</td>
                  <td style="padding: 10px; text-align: right;">$${orderData.tax_amount.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${orderData.shipping_cost > 0 ? `
                <tr>
                  <td style="padding: 10px; text-align: right;">Shipping:</td>
                  <td style="padding: 10px; text-align: right;">$${orderData.shipping_cost.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${orderData.discount_amount > 0 ? `
                <tr>
                  <td style="padding: 10px; text-align: right;">Discount:</td>
                  <td style="padding: 10px; text-align: right;">-$${orderData.discount_amount.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr class="total-row">
                <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                <td style="padding: 15px; text-align: right; font-size: 18px;"><strong>$${orderData.total_amount.toFixed(2)}</strong></td>
              </tr>
            </tfoot>
          </table>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/orders" class="button">
              View Order Details
            </a>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>We'll process your order within 24 hours</li>
            <li>You'll receive shipping confirmation once your order is dispatched</li>
            <li>Track your order status in your account dashboard</li>
            <li>Contact our support team if you have any questions</li>
          </ul>
          
          <p>Thank you for choosing KriptoCar!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${orderData.customer_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: orderData.customer_email,
    subject,
    html,
  });
};

export interface ServiceOrderData {
  service_order_id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  service_category: string;
  service_type: string;
  final_price: number;
  service_date: string;
  service_time: string;
  service_status: string;
  payment_status: string;
  service_address: string;
  service_pincode: string;
  additional_notes?: string;
  payment_method: string;
}

export const sendServiceOrderConfirmationEmail = async (serviceOrderData: ServiceOrderData): Promise<boolean> => {
  const subject = `Service Booking Confirmation #${serviceOrderData.service_order_id} - KriptoCar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Booking Confirmation - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #034c8c 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .service-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #034c8c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 Service Booked!</h1>
          <p>Your service has been successfully scheduled</p>
        </div>
        
        <div class="content">
          <h2>Hello ${serviceOrderData.customer_name},</h2>
          
          <p>Thank you for booking a service with KriptoCar! Your service has been successfully scheduled and we're looking forward to providing you with excellent automotive care.</p>
          
          <div class="service-info">
            <h3>Service Details</h3>
            <p><strong>Service Order ID:</strong> #${serviceOrderData.service_order_id}</p>
            <p><strong>Service Name:</strong> ${serviceOrderData.service_name}</p>
            <p><strong>Category:</strong> ${serviceOrderData.service_category}</p>
            <p><strong>Type:</strong> ${serviceOrderData.service_type}</p>
            <p><strong>Status:</strong> <span class="status-badge">${serviceOrderData.service_status}</span></p>
            <p><strong>Payment Method:</strong> ${serviceOrderData.payment_method}</p>
            <p><strong>Payment Status:</strong> <span class="status-badge">${serviceOrderData.payment_status}</span></p>
            <p><strong>Total Amount:</strong> $${serviceOrderData.final_price.toFixed(2)}</p>
          </div>
          
          <div class="service-info">
            <h3>Service Schedule</h3>
            <p><strong>Date:</strong> ${new Date(serviceOrderData.service_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${serviceOrderData.service_time}</p>
            <p><strong>Address:</strong> ${serviceOrderData.service_address}</p>
            <p><strong>Pincode:</strong> ${serviceOrderData.service_pincode}</p>
            ${serviceOrderData.additional_notes ? `<p><strong>Additional Notes:</strong> ${serviceOrderData.additional_notes}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/service-bookings" class="button">
              View Service Details
            </a>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Our service provider will contact you to confirm the appointment</li>
            <li>Please ensure your vehicle is available at the scheduled time</li>
            <li>Have your service order ID ready for reference</li>
            <li>Contact our support team if you need to reschedule</li>
          </ul>
          
          <p>Thank you for choosing KriptoCar for your automotive service needs!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${serviceOrderData.customer_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: serviceOrderData.customer_email,
    subject,
    html,
  });
};

// New interface for dealer order notification
export interface DealerOrderData {
  order_id: string;
  dealer_name: string;
  dealer_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  total_amount: number;
  order_date: string;
  order_status: string;
  payment_status: string;
  shipping_address: string;
  shipping_pincode: string;
  items: OrderItem[];
}

// New interface for vendor service notification
export interface VendorServiceData {
  service_order_id: string;
  vendor_name: string;
  vendor_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  service_category: string;
  service_type: string;
  final_price: number;
  service_date: string;
  service_time: string;
  service_status: string;
  payment_status: string;
  service_address: string;
  service_pincode: string;
  additional_notes?: string;
}

// Send order notification email to dealer
export const sendDealerOrderNotificationEmail = async (dealerOrderData: DealerOrderData): Promise<boolean> => {
  const subject = `New Order #${dealerOrderData.order_id} - KriptoCar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Notification - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .items-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        .items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .items-table th { background-color: #f8f9fa; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #007bff; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .amount-highlight { font-size: 24px; font-weight: bold; color: #28a745; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛒 New Order Received!</h1>
          <p>A customer has placed an order for your products</p>
        </div>
        
        <div class="content">
          <h2>Hello ${dealerOrderData.dealer_name},</h2>
          
          <p>Great news! A new order has been placed for your products on KriptoCar. Please review the details below and prepare the order for fulfillment.</p>
          
          <div class="order-info">
            <h3>Order Details</h3>
            <p><strong>Order ID:</strong> #${dealerOrderData.order_id}</p>
            <p><strong>Order Date:</strong> ${new Date(dealerOrderData.order_date).toLocaleDateString()}</p>
            <p><strong>Order Status:</strong> <span class="status-badge">${dealerOrderData.order_status}</span></p>
            <p><strong>Payment Status:</strong> <span class="status-badge">${dealerOrderData.payment_status}</span></p>
            <p><strong>Total Amount:</strong> <span class="amount-highlight">$${dealerOrderData.total_amount.toFixed(2)}</span></p>
          </div>
          
          <div class="order-info">
            <h3>Customer Information</h3>
            <p><strong>Customer Name:</strong> ${dealerOrderData.customer_name}</p>
            <p><strong>Customer Email:</strong> ${dealerOrderData.customer_email}</p>
            <p><strong>Customer Phone:</strong> ${dealerOrderData.customer_phone}</p>
            <p><strong>Shipping Address:</strong> ${dealerOrderData.shipping_address}</p>
            <p><strong>Shipping Pincode:</strong> ${dealerOrderData.shipping_pincode}</p>
          </div>
          
          <div class="order-info">
            <h3>Order Items</h3>
            <table class="items-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${dealerOrderData.items.map(item => `
                  <tr>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>$${(item.price * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the order details and customer information</li>
            <li>Prepare the products for shipping</li>
            <li>Update the order status in your dashboard</li>
            <li>Contact the customer if any clarification is needed</li>
            <li>Ensure timely delivery to maintain customer satisfaction</li>
          </ul>
          
          <p>Thank you for being a valued partner with KriptoCar!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${dealerOrderData.dealer_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: dealerOrderData.dealer_email,
    subject,
    html,
  });
};

// Send service booking notification email to vendor
export const sendVendorServiceNotificationEmail = async (vendorServiceData: VendorServiceData): Promise<boolean> => {
  const subject = `New Service Booking #${vendorServiceData.service_order_id} - KriptoCar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Service Booking - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #6f42c1 0%, #8e44ad 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .service-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #007bff; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .amount-highlight { font-size: 24px; font-weight: bold; color: #28a745; }
        .schedule-highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔧 New Service Booking!</h1>
          <p>A customer has booked your service</p>
        </div>
        
        <div class="content">
          <h2>Hello ${vendorServiceData.vendor_name},</h2>
          
          <p>Excellent! A new service booking has been made for your service on KriptoCar. Please review the details below and prepare for the scheduled service.</p>
          
          <div class="service-info">
            <h3>Service Booking Details</h3>
            <p><strong>Service Order ID:</strong> #${vendorServiceData.service_order_id}</p>
            <p><strong>Service Name:</strong> ${vendorServiceData.service_name}</p>
            <p><strong>Category:</strong> ${vendorServiceData.service_category}</p>
            <p><strong>Type:</strong> ${vendorServiceData.service_type}</p>
            <p><strong>Service Status:</strong> <span class="status-badge">${vendorServiceData.service_status}</span></p>
            <p><strong>Payment Status:</strong> <span class="status-badge">${vendorServiceData.payment_status}</span></p>
            <p><strong>Service Amount:</strong> <span class="amount-highlight">$${vendorServiceData.final_price.toFixed(2)}</span></p>
          </div>
          
          <div class="service-info">
            <h3>Service Schedule</h3>
            <div class="schedule-highlight">
              <p><strong>Date:</strong> ${new Date(vendorServiceData.service_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${vendorServiceData.service_time}</p>
              <p><strong>Service Address:</strong> ${vendorServiceData.service_address}</p>
              <p><strong>Pincode:</strong> ${vendorServiceData.service_pincode}</p>
              ${vendorServiceData.additional_notes ? `<p><strong>Additional Notes:</strong> ${vendorServiceData.additional_notes}</p>` : ''}
            </div>
          </div>
          
          <div class="service-info">
            <h3>Customer Information</h3>
            <p><strong>Customer Name:</strong> ${vendorServiceData.customer_name}</p>
            <p><strong>Customer Email:</strong> ${vendorServiceData.customer_email}</p>
            <p><strong>Customer Phone:</strong> ${vendorServiceData.customer_phone}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Review the service booking details and customer information</li>
            <li>Prepare your service team and equipment</li>
            <li>Contact the customer to confirm the appointment</li>
            <li>Update the service status in your dashboard</li>
            <li>Ensure excellent service delivery to maintain customer satisfaction</li>
          </ul>
          
          <p>Thank you for being a trusted service provider with KriptoCar!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${vendorServiceData.vendor_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: vendorServiceData.vendor_email,
    subject,
    html,
  });
}; 

// Send service acceptance notification email to customer
export const sendServiceAcceptanceEmail = async (serviceData: {
  service_order_id: string;
  customer_name: string;
  customer_email: string;
  service_name: string;
  service_category: string;
  service_type: string;
  final_price: number;
  service_date: string;
  service_time: string;
  service_address: string;
  service_pincode: string;
  vendor_name: string;
  additional_notes?: string;
}): Promise<boolean> => {
  const subject = `Service Accepted #${serviceData.service_order_id} - KriptoCar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Accepted - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .service-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .accepted-highlight { background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Service Accepted!</h1>
          <p>Your service booking has been confirmed</p>
        </div>
        
        <div class="content">
          <h2>Hello ${serviceData.customer_name},</h2>
          
          <div class="accepted-highlight">
            <h3>🎉 Great News!</h3>
            <p><strong>${serviceData.vendor_name}</strong> has accepted your service booking and is looking forward to providing you with excellent service!</p>
          </div>
          
          <div class="service-info">
            <h3>Service Details</h3>
            <p><strong>Service Order ID:</strong> #${serviceData.service_order_id}</p>
            <p><strong>Service Name:</strong> ${serviceData.service_name}</p>
            <p><strong>Category:</strong> ${serviceData.service_category}</p>
            <p><strong>Type:</strong> ${serviceData.service_type}</p>
            <p><strong>Status:</strong> <span class="status-badge">Accepted</span></p>
            <p><strong>Total Amount:</strong> $${serviceData.final_price.toFixed(2)}</p>
          </div>
          
          <div class="service-info">
            <h3>Service Schedule</h3>
            <p><strong>Date:</strong> ${new Date(serviceData.service_date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${serviceData.service_time}</p>
            <p><strong>Address:</strong> ${serviceData.service_address}</p>
            <p><strong>Pincode:</strong> ${serviceData.service_pincode}</p>
            ${serviceData.additional_notes ? `<p><strong>Additional Notes:</strong> ${serviceData.additional_notes}</p>` : ''}
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/service-bookings" class="button">
              View Service Details
            </a>
          </div>
          
          <p><strong>What's Next?</strong></p>
          <ul>
            <li>Your service provider will contact you shortly to confirm the appointment</li>
            <li>Please ensure your vehicle is available at the scheduled time</li>
            <li>Have your service order ID ready for reference</li>
            <li>Contact our support team if you need to reschedule</li>
          </ul>
          
          <p>Thank you for choosing KriptoCar for your automotive service needs!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${serviceData.customer_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: serviceData.customer_email,
    subject,
    html,
  });
};

// Send service acceptance confirmation email to vendor
export const sendVendorAcceptanceConfirmationEmail = async (vendorData: {
  service_order_id: string;
  vendor_name: string;
  vendor_email: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  service_name: string;
  service_category: string;
  service_type: string;
  final_price: number;
  service_date: string;
  service_time: string;
  service_address: string;
  service_pincode: string;
  additional_notes?: string;
}): Promise<boolean> => {
  const subject = `Service Acceptance Confirmed #${vendorData.service_order_id} - KriptoCar`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Service Acceptance Confirmed - KriptoCar</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .service-info { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
        .status-badge { display: inline-block; background: #28a745; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .amount-highlight { font-size: 24px; font-weight: bold; color: #28a745; }
        .schedule-highlight { background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3; }
        .confirmation-highlight { background: #d4edda; padding: 15px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Service Acceptance Confirmed!</h1>
          <p>You have successfully accepted the service booking</p>
        </div>
        
        <div class="content">
          <h2>Hello ${vendorData.vendor_name},</h2>
          
          <div class="confirmation-highlight">
            <h3>🎉 Service Accepted Successfully!</h3>
            <p>You have successfully accepted the service booking. The customer has been notified and is looking forward to your service.</p>
          </div>
          
          <div class="service-info">
            <h3>Service Booking Details</h3>
            <p><strong>Service Order ID:</strong> #${vendorData.service_order_id}</p>
            <p><strong>Service Name:</strong> ${vendorData.service_name}</p>
            <p><strong>Category:</strong> ${vendorData.service_category}</p>
            <p><strong>Type:</strong> ${vendorData.service_type}</p>
            <p><strong>Service Status:</strong> <span class="status-badge">Accepted</span></p>
            <p><strong>Service Amount:</strong> <span class="amount-highlight">$${vendorData.final_price.toFixed(2)}</span></p>
          </div>
          
          <div class="service-info">
            <h3>Service Schedule</h3>
            <div class="schedule-highlight">
              <p><strong>Date:</strong> ${new Date(vendorData.service_date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${vendorData.service_time}</p>
              <p><strong>Service Address:</strong> ${vendorData.service_address}</p>
              <p><strong>Pincode:</strong> ${vendorData.service_pincode}</p>
              ${vendorData.additional_notes ? `<p><strong>Additional Notes:</strong> ${vendorData.additional_notes}</p>` : ''}
            </div>
          </div>
          
          <div class="service-info">
            <h3>Customer Information</h3>
            <p><strong>Customer Name:</strong> ${vendorData.customer_name}</p>
            <p><strong>Customer Email:</strong> ${vendorData.customer_email}</p>
            <p><strong>Customer Phone:</strong> ${vendorData.customer_phone}</p>
          </div>
          
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Contact the customer to confirm the appointment details</li>
            <li>Prepare your service team and equipment</li>
            <li>Ensure you arrive on time for the scheduled service</li>
            <li>Update the service status in your dashboard as you progress</li>
            <li>Provide excellent service to maintain customer satisfaction</li>
          </ul>
          
          <p>Thank you for being a trusted service provider with KriptoCar!</p>
          
          <p>Best regards,<br>The KriptoCar Team</p>
        </div>
        
        <div class="footer">
          <p>© 2024 KriptoCar. All rights reserved.</p>
          <p>This email was sent to ${vendorData.vendor_email}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: vendorData.vendor_email,
    subject,
    html,
  });
}; 