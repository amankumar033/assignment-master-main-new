import { query } from './db';
import { sendDealerOrderNotificationEmail, sendVendorServiceNotificationEmail } from './email';

export interface NotificationData {
  type: string;
  title: string;
  message: string;
  description: string; // Detailed information (long-form)
  for_admin?: boolean | number;
  for_dealer?: boolean | number;
  for_vendor?: boolean | number;
  dealer_id?: string;
  vendor_id?: string;
  user_id?: string;
  metadata?: any;
}

type RecipientType = 'admin' | 'customer' | 'dealer' | 'vendor';
type RecipientTemplate = { title: string; message: string; description: (data: any) => string };
type NotificationTemplates = Record<string, Partial<Record<RecipientType, RecipientTemplate>>>;

// Notification templates for different types
export const NOTIFICATION_TEMPLATES: NotificationTemplates = {
  // User registration notifications
  user_registered: {
    admin: {
      title: 'New User Registration',
      message: 'New user registered',
      description: (data: any) => `A new user has registered on the platform. User details: ${data.user_name} (${data.user_email}). Registration date: ${data.registration_date}.`
    },
    customer: {
      title: 'Welcome to KriptoCar',
      message: 'Account created successfully',
      description: (data: any) => `Welcome to KriptoCar! Your account has been successfully created. You can now browse products, book services, and manage your automotive needs. Account email: ${data.user_email}.`
    }
  },

  // Order notifications
  order_created: {
    admin: {
      title: 'New Order Placed',
      message: 'New order received',
      description: (data: any) => `A new order has been placed by ${data.customer_name} for $${data.total_amount.toFixed(2)}. Order ID: ${data.order_id}. Items: ${data.items_count} products. Payment method: ${data.payment_method}.`
    },
    customer: {
      title: 'Order Confirmation',
      message: 'Order placed successfully',
      description: (data: any) => `Your order has been successfully placed! Order ID: ${data.order_id}. Total amount: $${data.total_amount.toFixed(2)}. Expected delivery: ${data.expected_delivery}. Payment status: ${data.payment_status}.`
    },
    dealer: {
      title: 'New Order for Your Products',
      message: 'New order received',
      description: (data: any) => `A new order has been placed for your products. Order ID: ${data.order_id}. Customer: ${data.customer_name}. Total amount: $${data.total_amount.toFixed(2)}. Items: ${data.items_count} products.`
    }
  },

  // Service order notifications
  service_order_created: {
    admin: {
      title: 'New Service Order Created',
      message: 'New service order received',
      description: (data: any) => `A new service order has been created by ${data.customer_name} for ${data.service_name} at $${data.final_price.toFixed(2)}. Service order ID: ${data.service_order_id}. Service scheduled for ${data.service_date} at ${data.service_time}. Customer address: ${data.service_address}, ${data.service_pincode}.`
    },
    customer: {
      title: 'Service Booking Confirmation',
      message: 'Service booked successfully',
      description: (data: any) => `Your service has been successfully booked! Service order ID: ${data.service_order_id}. Service: ${data.service_name}. Scheduled for ${data.service_date} at ${data.service_time}. Total amount: $${data.final_price.toFixed(2)}. Service address: ${data.service_address}, ${data.service_pincode}.`
    },
    vendor: {
      title: 'New Service Order for Your Service',
      message: 'New service order received',
      description: (data: any) => `A new service order has been booked for your service "${data.service_name}" by ${data.customer_name} for $${data.final_price.toFixed(2)}. Service order ID: ${data.service_order_id}. Service scheduled for ${data.service_date} at ${data.service_time}. Customer address: ${data.service_address}, ${data.service_pincode}. Additional notes: ${data.additional_notes || 'None'}.`
    }
  },

  // Payment notifications
  payment_successful: {
    admin: {
      title: 'Payment Received',
      message: 'Payment successful',
      description: (data: any) => `Payment of $${data.amount.toFixed(2)} has been received for ${data.order_type} ${data.order_id}. Payment method: ${data.payment_method}. Transaction ID: ${data.transaction_id}.`
    },
    customer: {
      title: 'Payment Confirmation',
      message: 'Payment successful',
      description: (data: any) => `Your payment of $${data.amount.toFixed(2)} has been successfully processed for ${data.order_type} ${data.order_id}. Payment method: ${data.payment_method}. Transaction ID: ${data.transaction_id}.`
    }
  },

  // Status update notifications
  order_status_updated: {
    admin: {
      title: 'Order Status Updated',
      message: 'Order status changed',
      description: (data: any) => `Order ${data.order_id} status has been updated to "${data.new_status}" by ${data.updated_by}. Previous status: ${data.previous_status}.`
    },
    customer: {
      title: 'Order Status Update',
      message: 'Order status updated',
      description: (data: any) => `Your order ${data.order_id} status has been updated to "${data.new_status}". Expected delivery: ${data.expected_delivery}. Track your order for real-time updates.`
    }
  },

  service_status_updated: {
    admin: {
      title: 'Service Status Updated',
      message: 'Service status changed',
      description: (data: any) => `Service order ${data.service_order_id} status has been updated to "${data.new_status}" by ${data.updated_by}. Previous status: ${data.previous_status}.`
    },
    customer: {
      title: 'Service Status Update',
      message: 'Service status updated',
      description: (data: any) => `Your service order ${data.service_order_id} status has been updated to "${data.new_status}". Service: ${data.service_name}. Scheduled for ${data.service_date} at ${data.service_time}.`
    },
    vendor: {
      title: 'Service Status Updated',
      message: 'Service status changed',
      description: (data: any) => `Service order ${data.service_order_id} status has been updated to "${data.new_status}". Customer: ${data.customer_name}. Service: ${data.service_name}.`
    }
  },

  // Review notifications
  review_submitted: {
    admin: {
      title: 'New Review Submitted',
      message: 'New review received',
      description: (data: any) => `A new review has been submitted by ${data.customer_name} for ${data.item_name}. Rating: ${data.rating}/5 stars. Review: ${data.review_text.substring(0, 100)}...`
    },
    dealer: {
      title: 'New Product Review',
      message: 'New review received',
      description: (data: any) => `A new review has been submitted for your product ${data.item_name} by ${data.customer_name}. Rating: ${data.rating}/5 stars. Review: ${data.review_text.substring(0, 100)}...`
    },
    vendor: {
      title: 'New Service Review',
      message: 'New review received',
      description: (data: any) => `A new review has been submitted for your service ${data.service_name} by ${data.customer_name}. Rating: ${data.rating}/5 stars. Review: ${data.review_text.substring(0, 100)}...`
    }
  }
};

// Helpers to standardize content
const truncateMessage = (text: string, maxLength: number = 120): string => {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
};

const toTwoDecimals = (value: any): string => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(2) : String(value ?? '');
};

const buildDescriptionFromMetadata = (
  title: string,
  message: string,
  metadata?: any
): string => {
  try {
    const parts: string[] = [];

    if (metadata && typeof metadata === 'object') {
      if (metadata.order_id) parts.push(`Order ID: ${metadata.order_id}.`);
      if (metadata.service_order_id) parts.push(`Service Order ID: ${metadata.service_order_id}.`);
      if (metadata.customer_name) parts.push(`Customer: ${metadata.customer_name}.`);
      if (metadata.customer_email) parts.push(`Email: ${metadata.customer_email}.`);
      if (metadata.total_amount) parts.push(`Total: $${toTwoDecimals(metadata.total_amount)}.`);
      if (metadata.final_price) parts.push(`Amount: $${toTwoDecimals(metadata.final_price)}.`);
      if (metadata.order_status) parts.push(`Status: ${metadata.order_status}.`);
      if (metadata.payment_status) parts.push(`Payment: ${metadata.payment_status}.`);
      if (metadata.service_name) parts.push(`Service: ${metadata.service_name}.`);
      if (metadata.items && Array.isArray(metadata.items)) parts.push(`Items: ${metadata.items.length}.`);
      if (metadata.shipping_address || metadata.service_address) {
        const addr = metadata.shipping_address || metadata.service_address;
        const pin = metadata.shipping_pincode || metadata.service_pincode;
        parts.push(`Address: ${addr}${pin ? `, ${pin}` : ''}.`);
      }
      if (metadata.order_date) parts.push(`Date: ${metadata.order_date}.`);
      if (metadata.booking_date) parts.push(`Booked: ${metadata.booking_date}.`);
    }

    const summary = parts.join(' ');
    return summary || `${title}. ${message}`;
  } catch {
    return `${title}. ${message}`;
  }
};

export const createNotification = async (notificationData: NotificationData): Promise<boolean> => {
  try {
    const {
      type,
      title,
      message,
      description,
      for_admin = false,
      for_dealer = false,
      for_vendor = false,
      dealer_id,
      vendor_id,
      user_id,
      metadata
    } = notificationData;

    // Ensure small message and always-present description
    const finalMessage = truncateMessage(message || title || 'Notification');
    const finalDescription = description && description.trim().length > 0
      ? description
      : buildDescriptionFromMetadata(title, message, metadata);

    console.log('🔔 Creating notification:', {
      type,
      title,
      message: finalMessage.substring(0, 50) + '...', // Log first 50 chars
      description: finalDescription ? finalDescription.substring(0, 50) + '...' : 'No description',
      for_admin,
      for_dealer,
      for_vendor,
      dealer_id,
      vendor_id,
      user_id
    });

    const result = await query(
      `INSERT INTO kriptocar.notifications (
        type, title, message, description, for_admin, for_dealer, for_vendor,
        dealer_id, vendor_id, user_id, metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        type,
        title,
        finalMessage,
        finalDescription || null,
        for_admin ? 1 : 0,
        for_dealer ? 1 : 0,
        for_vendor ? 1 : 0,
        dealer_id || null,
        vendor_id || null,
        user_id || null,
        metadata ? JSON.stringify(metadata) : null
      ]
    ) as any;

    console.log('✅ Notification created successfully:', title);
    console.log('📝 Notification result:', result);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    return false;
  }
};

// Helper function to create notifications using templates
export const createNotificationWithTemplate = async (
  notificationType: keyof typeof NOTIFICATION_TEMPLATES,
  recipientType: 'admin' | 'customer' | 'dealer' | 'vendor',
  data: any,
  additionalOptions: {
    user_id?: string;
    dealer_id?: string;
    vendor_id?: string;
    metadata?: any;
  } = {}
): Promise<boolean> => {
  try {
    const template = NOTIFICATION_TEMPLATES[notificationType][recipientType];
    if (!template) {
      console.error(`❌ No template found for ${notificationType}.${recipientType}`);
      return false;
    }

    const notificationData: NotificationData = {
      type: notificationType,
      title: template.title,
      message: template.message,
      description: template.description(data),
      for_admin: recipientType === 'admin' ? 1 : 0,
      for_dealer: recipientType === 'dealer' ? 1 : 0,
      for_vendor: recipientType === 'vendor' ? 1 : 0,
      user_id: recipientType === 'customer' ? additionalOptions.user_id : undefined,
      dealer_id: recipientType === 'dealer' ? additionalOptions.dealer_id : undefined,
      vendor_id: recipientType === 'vendor' ? additionalOptions.vendor_id : undefined,
      metadata: additionalOptions.metadata
    };

    return await createNotification(notificationData);
  } catch (error) {
    console.error('❌ Error creating notification with template:', error);
    return false;
  }
};

// Helper function to create multiple notifications for different recipients
export const createMultiRecipientNotifications = async (
  notificationType: keyof typeof NOTIFICATION_TEMPLATES,
  recipients: Array<'admin' | 'customer' | 'dealer' | 'vendor'>,
  data: any,
  additionalOptions: {
    user_id?: string;
    dealer_id?: string;
    vendor_id?: string;
    metadata?: any;
  } = {}
): Promise<{ [key: string]: boolean }> => {
  const results: { [key: string]: boolean } = {};

  for (const recipient of recipients) {
    results[recipient] = await createNotificationWithTemplate(
      notificationType,
      recipient,
      data,
      additionalOptions
    );
  }

  return results;
};

export const createOrderNotifications = async (
  orderData: any,
  orderId: string,
  dealerId: string | null
): Promise<void> => {
  console.log('🔔 Creating order notifications for:', {
    orderId,
    dealerId,
    customerName: orderData.customer_name,
    totalAmount: orderData.total_amount
  });

  const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Prepare order metadata
  const orderMetadata = {
    order_id: orderId,
    customer_name: orderData.customer_name,
    customer_email: orderData.customer_email,
    total_amount: orderData.total_amount,
    order_status: orderData.order_status,
    payment_status: orderData.payment_status,
    order_date: currentTime,
    items: orderData.items || [],
    shipping_address: orderData.shipping_address,
    shipping_pincode: orderData.shipping_pincode
  };

  console.log('📋 Order metadata prepared:', orderMetadata);

  // Create admin notification
  console.log('👨‍💼 Creating admin notification...');
  const adminDescription = `A new order #${orderId} has been created by ${orderData.customer_name} for $${toTwoDecimals(orderData.total_amount)}. ` +
    `Status: ${orderData.order_status}. Payment: ${orderData.payment_status}. ` +
    `Ship to: ${orderData.shipping_address}, ${orderData.shipping_pincode}.`;

  const adminSuccess = await createNotification({
    type: 'order_placed',
    title: 'New Order Created',
    message: 'New order received',
    description: adminDescription,
    for_admin: true,
    for_dealer: false,
    for_vendor: false,
    metadata: orderMetadata
  });

  if (adminSuccess) {
    console.log('✅ Admin notification created successfully');
  } else {
    console.log('❌ Failed to create admin notification');
  }

  // Create dealer notification and send email (if dealer exists and is valid)
  if (dealerId) {
    console.log('🏪 Creating dealer notification for dealer:', dealerId);
    
    // First check if the dealer exists and get their details
    try {
      const dealerCheck = await query(
        'SELECT dealer_id, name, email FROM kriptocar.dealers WHERE dealer_id = ?',
        [dealerId]
      ) as any[];
      
      if (dealerCheck.length === 0) {
        console.log('⚠️ Dealer ID does not exist in dealers table, skipping dealer notification');
        return;
      }
      
      const dealer = dealerCheck[0];
      console.log('📧 Dealer details found:', { name: dealer.name, email: dealer.email });
      
      // Create dealer notification
      const dealerDescription = `Order #${orderId} placed for your products by ${orderData.customer_name} for $${toTwoDecimals(orderData.total_amount)}. ` +
        `Status: ${orderData.order_status}. Payment: ${orderData.payment_status}. ` +
        `Ship to: ${orderData.shipping_address}, ${orderData.shipping_pincode}.`;

      const dealerSuccess = await createNotification({
        type: 'order_placed',
        title: 'New Order for Your Products',
        message: 'New order for your products',
        description: dealerDescription,
        for_admin: false,
        for_dealer: true,
        for_vendor: false,
        dealer_id: dealerId,
        metadata: orderMetadata
      });

      if (dealerSuccess) {
        console.log('✅ Dealer notification created successfully');
      } else {
        console.log('❌ Failed to create dealer notification');
      }

      // Send email to dealer if email exists
      if (dealer.email) {
        console.log('📧 Sending order notification email to dealer:', dealer.email);
        try {
          const dealerEmailData = {
            order_id: orderId,
            dealer_name: dealer.name,
            dealer_email: dealer.email,
            customer_name: orderData.customer_name,
            customer_email: orderData.customer_email,
            customer_phone: orderData.customer_phone,
            total_amount: orderData.total_amount,
            order_date: orderData.order_date || currentTime,
            order_status: orderData.order_status,
            payment_status: orderData.payment_status,
            shipping_address: orderData.shipping_address,
            shipping_pincode: orderData.shipping_pincode,
            items: orderData.items || []
          };

          console.log('📧 Attempting to send dealer order notification email to:', dealer.email);
          const emailSent = await sendDealerOrderNotificationEmail(dealerEmailData);
          if (emailSent) {
            console.log('✅ Dealer order notification email sent successfully to:', dealer.email);
          } else {
            console.log('❌ Failed to send dealer order notification email to:', dealer.email);
          }
        } catch (emailError) {
          console.error('❌ Error sending dealer order notification email:', emailError);
          console.error('❌ Email error details:', {
            message: emailError instanceof Error ? emailError.message : 'Unknown error',
            stack: emailError instanceof Error ? emailError.stack : undefined
          });
        }
      } else {
        console.log('⚠️ Dealer email not found, skipping email notification');
      }
    } catch (error) {
      console.error('❌ Error checking dealer or creating dealer notification:', error);
      console.log('⚠️ Skipping dealer notification due to error');
    }
  } else {
    console.log('ℹ️ No dealer ID provided, skipping dealer notification');
  }

  console.log('🏁 Order notification creation completed');
};

export const createServiceOrderNotifications = async (
  serviceOrderData: any,
  serviceOrderId: string,
  vendorId: string | null,
  vendorDetails?: { name?: string; email?: string }
): Promise<void> => {
  console.log('🔔 Creating service order notifications for:', {
    serviceOrderId,
    vendorId,
    customerName: serviceOrderData.customer_name,
    serviceName: serviceOrderData.service_name,
    finalPrice: serviceOrderData.final_price
  });

  const currentTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  // Prepare service order metadata
  const serviceOrderMetadata = {
    service_order_id: serviceOrderId,
    customer_name: serviceOrderData.customer_name,
    customer_email: serviceOrderData.customer_email,
    service_name: serviceOrderData.service_name,
    service_category: serviceOrderData.service_category,
    service_type: serviceOrderData.service_type,
    final_price: serviceOrderData.final_price,
    service_date: serviceOrderData.service_date,
    service_time: serviceOrderData.service_time,
    service_status: serviceOrderData.service_status,
    payment_status: serviceOrderData.payment_status,
    booking_date: currentTime,
    service_address: serviceOrderData.service_address,
    service_pincode: serviceOrderData.service_pincode,
    additional_notes: serviceOrderData.additional_notes
  };

  console.log('📋 Service order metadata prepared:', serviceOrderMetadata);

  // Create admin notification
  console.log('👨‍💼 Creating admin notification for service order...');
  const finalPrice = Number(serviceOrderData.final_price);
  const adminTemplate: RecipientTemplate = NOTIFICATION_TEMPLATES.service_order_created?.admin || {
    title: 'New Service Order Created',
    message: 'New service order received',
    description: (data: any) =>
      `A new service order has been created by ${data.customer_name} for ${data.service_name} at $${toTwoDecimals(data.final_price)}. ` +
      `Service order ID: ${data.service_order_id}. Service scheduled for ${data.service_date} at ${data.service_time}. ` +
      `Customer address: ${data.service_address}, ${data.service_pincode}.`
  };
  const adminSuccess = await createNotification({
    type: 'service_order_created',
    title: adminTemplate.title,
    message: adminTemplate.message,
    description: adminTemplate.description({
      customer_name: serviceOrderData.customer_name,
      service_name: serviceOrderData.service_name,
      final_price: finalPrice,
      service_order_id: serviceOrderId,
      service_date: serviceOrderData.service_date,
      service_time: serviceOrderData.service_time,
      service_address: serviceOrderData.service_address,
      service_pincode: serviceOrderData.service_pincode
    }),
    for_admin: 1,
    for_dealer: 0,
    for_vendor: 0,
    metadata: serviceOrderMetadata
  });

  if (adminSuccess) {
    console.log('✅ Admin notification created successfully');
  } else {
    console.log('❌ Failed to create admin notification');
  }

  // Create vendor notification and send email (if vendor exists and is valid)
  if (vendorId) {
    console.log('🏪 Creating vendor notification for vendor:', vendorId);
    
    // Try to use provided vendor details first
    let vendor: any = null;
    if (vendorDetails?.email || vendorDetails?.name) {
      vendor = {
        vendor_id: vendorId,
        name: vendorDetails.name || `Vendor ${vendorId}`,
        email: vendorDetails.email || null
      };
      console.log('📧 Using vendor details provided by caller:', { vendor_id: vendor.vendor_id, name: vendor.name, email: vendor.email });
    }
    // If not provided, fetch vendor details, but do not fail if lookup fails
    if (!vendor) {
      try {
        console.log('🔍 Checking for vendor ID:', vendorId);
        const vendorCheck = await query(
          'SELECT vendor_id, vendor_name, contact_email FROM kriptocar.vendors WHERE vendor_id = ?',
          [vendorId]
        ) as any[];
        if (Array.isArray(vendorCheck) && vendorCheck.length > 0) {
          vendor = {
            vendor_id: vendorCheck[0].vendor_id,
            name: vendorCheck[0].vendor_name,
            email: vendorCheck[0].contact_email,
          };
        }
      } catch (primaryLookupError) {
        console.warn('⚠️ Vendor lookup with name failed, attempting minimal lookup:', primaryLookupError);
        try {
          const fallbackVendorCheck = await query(
            'SELECT vendor_id, contact_email FROM kriptocar.vendors WHERE vendor_id = ?',
            [vendorId]
          ) as any[];
          if (Array.isArray(fallbackVendorCheck) && fallbackVendorCheck.length > 0) {
            vendor = { vendor_id: fallbackVendorCheck[0].vendor_id, email: fallbackVendorCheck[0].contact_email, name: `Vendor ${vendorId}` };
          }
        } catch (fallbackLookupError) {
          console.error('❌ Vendor minimal lookup failed:', fallbackLookupError);
        }
      }
    }

    if (!vendor) {
      console.log('ℹ️ Proceeding without vendor details (will still create vendor notification)');
    } else {
      console.log('📧 Vendor details resolved (for email check):', { vendor_id: vendor.vendor_id, name: vendor.name, email: vendor.email });
    }
    
    // Create vendor notification regardless of vendor lookup outcome
  const vendorTemplate: RecipientTemplate = NOTIFICATION_TEMPLATES.service_order_created?.vendor || {
    title: 'New Service Order for Your Service',
    message: 'New service order received',
    description: (data: any) =>
      `A new service order has been booked for your service "${data.service_name}" by ${data.customer_name} for $${toTwoDecimals(data.final_price)}. ` +
      `Service order ID: ${data.service_order_id}. Service scheduled for ${data.service_date} at ${data.service_time}. ` +
      `Customer address: ${data.service_address}, ${data.service_pincode}. Additional notes: ${data.additional_notes || 'None'}.`
  };
    const vendorSuccess = await createNotification({
      type: 'service_order_created',
      title: vendorTemplate.title,
      message: vendorTemplate.message,
      description: vendorTemplate.description({
        service_name: serviceOrderData.service_name,
        customer_name: serviceOrderData.customer_name,
        final_price: finalPrice,
        service_order_id: serviceOrderId,
        service_date: serviceOrderData.service_date,
        service_time: serviceOrderData.service_time,
        service_address: serviceOrderData.service_address,
        service_pincode: serviceOrderData.service_pincode,
        additional_notes: serviceOrderData.additional_notes
      }),
      for_admin: 0,
      for_dealer: 0,
      for_vendor: 1,
      vendor_id: vendorId,
      metadata: serviceOrderMetadata
    });

    if (vendorSuccess) {
      console.log('✅ Vendor notification created successfully');
    } else {
      console.log('❌ Failed to create vendor notification');
    }

    // Send email to vendor only if we have an email address
    if (vendor && vendor.email) {
      console.log('📧 Sending service notification email to vendor:', vendor.email);
      try {
        const vendorEmailData = {
          service_order_id: serviceOrderId,
          vendor_name: vendor.name || `Vendor ${vendorId}`,
          vendor_email: vendor.email,
          customer_name: serviceOrderData.customer_name,
          customer_email: serviceOrderData.customer_email,
          customer_phone: serviceOrderData.customer_phone || 'Not provided',
          service_name: serviceOrderData.service_name,
          service_category: serviceOrderData.service_category,
          service_type: serviceOrderData.service_type,
          final_price: finalPrice,
          service_date: serviceOrderData.service_date,
          service_time: serviceOrderData.service_time,
          service_status: serviceOrderData.service_status,
          payment_status: serviceOrderData.payment_status,
          service_address: serviceOrderData.service_address,
          service_pincode: serviceOrderData.service_pincode,
          additional_notes: serviceOrderData.additional_notes
        };

        const emailSent = await sendVendorServiceNotificationEmail(vendorEmailData);
        if (emailSent) {
          console.log('✅ Vendor service notification email sent successfully to:', vendor.email);
        } else {
          console.log('❌ Failed to send vendor service notification email to:', vendor.email);
        }
      } catch (emailError) {
        console.error('❌ Error sending vendor service notification email:', emailError);
        console.error('❌ Email error details:', {
          message: emailError instanceof Error ? emailError.message : 'Unknown error',
          stack: emailError instanceof Error ? emailError.stack : undefined
        });
      }
    } else {
      console.log('⚠️ Vendor email not available; skipped email sending');
    }
  } else {
    console.log('ℹ️ No vendor ID provided, skipping vendor notification');
  }

  console.log('🏁 Service order notification creation completed');
};
