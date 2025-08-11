import { query } from './db';

export interface ServiceOrderIdGenerator {
  generateServiceOrderId(): Promise<string>;
}

export class DatabaseServiceOrderIdGenerator implements ServiceOrderIdGenerator {
  async generateServiceOrderId(): Promise<string> {
    try {
      console.log('🔍 Starting service order ID generation...');
      
      // Get all existing service order IDs to check for duplicates
      const result = await query(
        'SELECT service_order_id FROM kriptocar.service_orders WHERE service_order_id LIKE "SRV%" ORDER BY service_order_id'
      );

      // Handle different possible return formats
      let existingRows: any[] = [];
      if (Array.isArray(result)) {
        existingRows = result;
      } else if (result && Array.isArray(result[0])) {
        existingRows = result[0];
      } else if (result && typeof result === 'object') {
        existingRows = [result];
      }

      console.log('🔍 Existing service order IDs:', existingRows.map(row => row.service_order_id));

      // Find the next available number
      let nextNumber = 1;
      
      if (existingRows.length > 0) {
        // Extract numbers from existing IDs and find the maximum
        const numbers = existingRows.map(row => {
          const match = row.service_order_id.match(/^SRV(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }).filter(num => num > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      }

      const serviceOrderId = `SRV${nextNumber}`;
      console.log(`✅ Generated service order ID: ${serviceOrderId}`);
      
      return serviceOrderId;
    } catch (error) {
      console.error('❌ Error generating service order ID:', error);
      
      // Fallback to timestamp-based ID if database fails
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const fallbackId = `SRV${timestamp}${randomSuffix}`;
      console.log(`🔄 Using fallback ID: ${fallbackId}`);
      
      return fallbackId;
    }
  }
}

export class FallbackServiceOrderIdGenerator implements ServiceOrderIdGenerator {
  private static counter = 0;
  
  async generateServiceOrderId(): Promise<string> {
    try {
      console.log('🔍 Starting fallback service order ID generation...');
      
      // Try to get existing IDs from database first
      const result = await query(
        'SELECT service_order_id FROM kriptocar.service_orders WHERE service_order_id LIKE "SRV%" ORDER BY service_order_id'
      );

      // Handle different possible return formats
      let existingRows: any[] = [];
      if (Array.isArray(result)) {
        existingRows = result;
      } else if (result && Array.isArray(result[0])) {
        existingRows = result[0];
      } else if (result && typeof result === 'object') {
        existingRows = [result];
      }

      let nextNumber = 1;
      
      if (existingRows.length > 0) {
        // Extract numbers from existing IDs and find the maximum
        const numbers = existingRows.map(row => {
          const match = row.service_order_id.match(/^SRV(\d+)$/);
          return match ? parseInt(match[1]) : 0;
        }).filter(num => num > 0);
        
        if (numbers.length > 0) {
          nextNumber = Math.max(...numbers) + 1;
        }
      } else {
        // Fallback to static counter if database query fails
        FallbackServiceOrderIdGenerator.counter++;
        nextNumber = FallbackServiceOrderIdGenerator.counter;
      }

      const serviceOrderId = `SRV${nextNumber}`;
      console.log(`✅ Generated fallback service order ID: ${serviceOrderId}`);

      return serviceOrderId;
    } catch (error) {
      console.error('❌ Error in fallback service order ID generator:', error);
      // Ultimate fallback with timestamp
      const timestamp = Date.now();
      const randomSuffix = Math.floor(Math.random() * 1000);
      const fallbackId = `SRV${timestamp}${randomSuffix}`;
      console.log(`🔄 Using ultimate fallback ID: ${fallbackId}`);
      return fallbackId;
    }
  }
}

// Export a default generator instance
export const serviceOrderIdGenerator = new DatabaseServiceOrderIdGenerator();
