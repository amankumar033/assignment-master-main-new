import mysql from 'mysql2/promise';

export interface NotificationIdGeneratorConfig {
  host: string;
  user: string;
  password: string;
  database: string;
}

export class NotificationIdGenerator {
  private config: NotificationIdGeneratorConfig;
  private connection: mysql.Connection | null = null;

  constructor(config: NotificationIdGeneratorConfig) {
    this.config = config;
  }

  /**
   * Generate a unique notification ID in the format NOT + 3-digit number
   * @returns Promise<string> - Unique notification ID (e.g., NOT001, NOT002, etc.)
   */
  async generateNotificationId(): Promise<string> {
    let connection: mysql.Connection | null = null;
    
    try {
      // Create database connection
      connection = await mysql.createConnection(this.config);
      
      // Start transaction for atomic operations
      await connection.beginTransaction();
      
      try {
        // Step 1: Get all existing notification IDs from the database
        const [existingNotifications] = await connection.execute(
          'SELECT notification_id FROM notifications ORDER BY notification_id FOR UPDATE'
        );
        
        // Step 2: Extract existing notification numbers
        const existingNotificationNumbers = (existingNotifications as any[])
          .map((row: any) => row.notification_id)
          .filter(notificationId => notificationId.match(/^NOT\d{3}$/))
          .map(notificationId => {
            const match = notificationId.match(/^NOT(\d{3})$/);
            return match ? parseInt(match[1]) : 0;
          })
          .sort((a: number, b: number) => a - b);
        
        console.log(`Existing notification numbers: ${existingNotificationNumbers.join(', ')}`);
        
        // Step 3: Find the next available number using range-based approach
        const nextNotificationNumber = this.findNextAvailableNumber(existingNotificationNumbers);
        
        // Step 4: Generate the notification ID
        const notificationId = `NOT${nextNotificationNumber.toString().padStart(3, '0')}`;
        
        // Step 5: Double-check this ID doesn't exist (race condition protection)
        const [existingNotification] = await connection.execute(
          'SELECT notification_id FROM notifications WHERE notification_id = ?',
          [notificationId]
        );
        
        if ((existingNotification as any[]).length > 0) {
          // If ID exists, find the next available one
          const alternativeNotificationId = await this.findAlternativeNotificationId(connection, existingNotificationNumbers);
          await connection.commit();
          console.log(`Generated notification ID: ${alternativeNotificationId} (alternative)`);
          return alternativeNotificationId;
        }
        
        // Step 6: Commit transaction
        await connection.commit();
        console.log(`Generated notification ID: ${notificationId}`);
        return notificationId;
        
      } catch (error) {
        await connection.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error('Error generating notification ID:', error);
      throw new Error('Failed to generate unique notification ID');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Find the next available number in the sequence using range-based approach
   * @param existingNumbers - Array of existing notification numbers
   * @returns number - Next available number
   */
  private findNextAvailableNumber(existingNumbers: number[]): number {
    // If no existing notifications, start with 1
    if (existingNumbers.length === 0) {
      return 1;
    }
    
    const rangeSize = 10; // Each range has 10 numbers (1-10, 11-20, etc.)
    const maxExistingNumber = Math.max(...existingNumbers);
    
    // Check for gaps in the sequence first
    for (let i = 1; i <= maxExistingNumber; i++) {
      if (!existingNumbers.includes(i)) {
        return i;
      }
    }
    
    // If no gaps, return the next number after the maximum
    return maxExistingNumber + 1;
  }

  /**
   * Find an alternative notification ID if the proposed one already exists
   * @param connection - Database connection
   * @param existingNumbers - Array of existing notification numbers
   * @returns Promise<string> - Alternative notification ID
   */
  private async findAlternativeNotificationId(
    connection: mysql.Connection, 
    existingNumbers: number[]
  ): Promise<string> {
    const maxExistingNumber = Math.max(...existingNumbers);
    let attemptNumber = maxExistingNumber + 1;
    const maxAttempts = 100;
    
    while (attemptNumber <= maxExistingNumber + maxAttempts) {
      const alternativeNotificationId = `NOT${attemptNumber.toString().padStart(3, '0')}`;
      
      const [checkExisting] = await connection.execute(
        'SELECT notification_id FROM notifications WHERE notification_id = ?',
        [alternativeNotificationId]
      );
      
      if ((checkExisting as any[]).length === 0) {
        return alternativeNotificationId;
      }
      
      attemptNumber++;
    }
    
    throw new Error('Unable to generate unique notification ID after maximum attempts');
  }

  /**
   * Validate if a notification ID format is correct
   * @param notificationId - Notification ID to validate
   * @returns boolean - True if valid format
   */
  static validateNotificationIdFormat(notificationId: string): boolean {
    return /^NOT\d{3}$/.test(notificationId);
  }

  /**
   * Extract notification number from notification ID
   * @param notificationId - Notification ID (e.g., NOT001)
   * @returns number - Notification number (e.g., 1)
   */
  static extractNotificationNumber(notificationId: string): number {
    const match = notificationId.match(/^NOT(\d{3})$/);
    if (!match) {
      throw new Error('Invalid notification ID format');
    }
    return parseInt(match[1]);
  }

  /**
   * Get range information for a notification number
   * @param notificationNumber - Notification number
   * @returns object - Range information
   */
  static getRangeInfo(notificationNumber: number): { rangeStart: number; rangeEnd: number; rangeNumber: number } {
    const rangeSize = 10;
    const rangeNumber = Math.ceil(notificationNumber / rangeSize);
    const rangeStart = (rangeNumber - 1) * rangeSize + 1;
    const rangeEnd = rangeNumber * rangeSize;
    
    return { rangeStart, rangeEnd, rangeNumber };
  }

  /**
   * Check if a notification ID is available (doesn't exist in database)
   * @param notificationId - Notification ID to check
   * @returns Promise<boolean> - True if available
   */
  async isNotificationIdAvailable(notificationId: string): Promise<boolean> {
    let connection: mysql.Connection | null = null;
    
    try {
      connection = await mysql.createConnection(this.config);
      
      const [existingNotification] = await connection.execute(
        'SELECT notification_id FROM notifications WHERE notification_id = ?',
        [notificationId]
      );
      
      return (existingNotification as any[]).length === 0;
      
    } catch (error) {
      console.error('Error checking notification ID availability:', error);
      throw new Error('Failed to check notification ID availability');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Get statistics about notification ID usage
   * @returns Promise<object> - Usage statistics
   */
  async getNotificationIdStatistics(): Promise<{
    totalNotifications: number;
    usedRanges: number[];
    availableRanges: number[];
    nextAvailableNumber: number;
    gaps: number[];
  }> {
    let connection: mysql.Connection | null = null;
    
    try {
      connection = await mysql.createConnection(this.config);
      
      const [existingNotifications] = await connection.execute(
        'SELECT notification_id FROM notifications ORDER BY notification_id'
      );
      
      const existingNotificationNumbers = (existingNotifications as any[])
        .map((row: any) => row.notification_id)
        .filter(notificationId => notificationId.match(/^NOT\d{3}$/))
        .map(notificationId => {
          const match = notificationId.match(/^NOT(\d{3})$/);
          return match ? parseInt(match[1]) : 0;
        })
        .sort((a: number, b: number) => a - b);
      
      const totalNotifications = existingNotificationNumbers.length;
      const nextAvailableNumber = this.findNextAvailableNumber(existingNotificationNumbers);
      
      // Find gaps in the sequence
      const gaps: number[] = [];
      for (let i = 1; i <= Math.max(...existingNotificationNumbers, 0); i++) {
        if (!existingNotificationNumbers.includes(i)) {
          gaps.push(i);
        }
      }
      
      // Calculate used and available ranges
      const usedRanges: number[] = [];
      const availableRanges: number[] = [];
      const maxRange = Math.ceil(Math.max(...existingNotificationNumbers, 0) / 10);
      
      for (let range = 1; range <= maxRange + 1; range++) {
        const rangeStart = (range - 1) * 10 + 1;
        const rangeEnd = range * 10;
        const rangeNumbers = existingNotificationNumbers.filter(num => num >= rangeStart && num <= rangeEnd);
        
        if (rangeNumbers.length > 0) {
          usedRanges.push(range);
        } else {
          availableRanges.push(range);
        }
      }
      
      return {
        totalNotifications,
        usedRanges,
        availableRanges,
        nextAvailableNumber,
        gaps
      };
      
    } catch (error) {
      console.error('Error getting notification ID statistics:', error);
      throw new Error('Failed to get notification ID statistics');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }

  /**
   * Create a notification with auto-generated ID
   * @param notificationData - Notification data
   * @returns Promise<string> - Generated notification ID
   */
  async createNotification(notificationData: {
    user_id: string;
    notification_type: string;
    title: string;
    message: string;
    is_read?: boolean;
  }): Promise<string> {
    let connection: mysql.Connection | null = null;
    
    try {
      connection = await mysql.createConnection(this.config);
      await connection.beginTransaction();
      
      try {
        // Generate unique notification ID
        const notificationId = await this.generateNotificationId();
        
        // Insert notification with generated ID
        await connection.execute(
          `INSERT INTO notifications (
            notification_id, user_id, notification_type, title, message, is_read, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            notificationId,
            notificationData.user_id,
            notificationData.notification_type,
            notificationData.title,
            notificationData.message,
            notificationData.is_read || false,
            new Date()
          ]
        );
        
        await connection.commit();
        console.log(`✅ Created notification with ID: ${notificationId}`);
        return notificationId;
        
      } catch (error) {
        await connection.rollback();
        throw error;
      }
      
    } catch (error) {
      console.error('Error creating notification:', error);
      throw new Error('Failed to create notification');
    } finally {
      if (connection) {
        await connection.end();
      }
    }
  }
}

// Export a singleton instance for easy use
export const notificationIdGenerator = new NotificationIdGenerator({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'kriptocar'
});
