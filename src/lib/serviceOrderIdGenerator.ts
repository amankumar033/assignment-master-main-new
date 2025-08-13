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

      const existingIds = existingRows.map(row => row.service_order_id);
      console.log('🔍 Existing service order IDs:', existingIds);

      // Try to find an available ID in ranges: 1-10, 11-20, 21-30, etc.
      let nextNumber = 1;
      const maxAttempts = 1000; // Prevent infinite loops
      let attempts = 0;

      while (attempts < maxAttempts) {
        // Check if this number is available
        const proposedId = `SRV${nextNumber.toString().padStart(5, '0')}`;
        
        if (!existingIds.includes(proposedId)) {
          console.log(`✅ Generated unique service order ID: ${proposedId}`);
          return proposedId;
        }

        // Move to next range if current range is full
        if (nextNumber % 10 === 0) {
          nextNumber = Math.floor(nextNumber / 10) * 10 + 11;
        } else {
          nextNumber++;
        }

        attempts++;
      }

      // If we can't find a unique ID in reasonable ranges, use timestamp
      const timestamp = Date.now();
      const fallbackId = `SRV${timestamp.toString().slice(-5)}`;
      console.log(`🔄 Using fallback service order ID: ${fallbackId}`);
      return fallbackId;
    } catch (error) {
      console.error('❌ Error generating service order ID:', error);
      
      // Fallback to timestamp-based ID if database fails
      const timestamp = Date.now();
      const fallbackId = `SRV${timestamp.toString().slice(-5)}`;
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

      const existingIds = existingRows.map(row => row.service_order_id);
      let nextNumber = 1;
      const maxAttempts = 1000;
      let attempts = 0;

      while (attempts < maxAttempts) {
        // Check if this number is available
        const proposedId = `SRV${nextNumber.toString().padStart(5, '0')}`;
        
        if (!existingIds.includes(proposedId)) {
          console.log(`✅ Generated unique fallback service order ID: ${proposedId}`);
          return proposedId;
        }

        // Move to next range if current range is full
        if (nextNumber % 10 === 0) {
          nextNumber = Math.floor(nextNumber / 10) * 10 + 11;
        } else {
          nextNumber++;
        }

        attempts++;
      }

      // Fallback to static counter if database query fails
      FallbackServiceOrderIdGenerator.counter++;
      const fallbackId = `SRV${FallbackServiceOrderIdGenerator.counter.toString().padStart(5, '0')}`;
      console.log(`✅ Generated fallback service order ID: ${fallbackId}`);

      return fallbackId;
    } catch (error) {
      console.error('❌ Error in fallback service order ID generator:', error);
      // Ultimate fallback with timestamp
      const timestamp = Date.now();
      const fallbackId = `SRV${timestamp.toString().slice(-5)}`;
      console.log(`🔄 Using ultimate fallback ID: ${fallbackId}`);
      return fallbackId;
    }
  }
}

// Export a default generator instance
export const serviceOrderIdGenerator = new DatabaseServiceOrderIdGenerator();
