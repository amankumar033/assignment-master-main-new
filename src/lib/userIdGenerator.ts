import mysql from 'mysql2/promise';

export interface UserIdGenerator {
  generateUserId(): Promise<string>;
}

export class DatabaseUserIdGenerator implements UserIdGenerator {
  private connection: mysql.Connection;

  constructor(connection: mysql.Connection) {
    this.connection = connection;
  }

  async generateUserId(): Promise<string> {
    try {
      // Get the maximum user_id from the database
      const [rows] = await this.connection.execute(
        'SELECT MAX(CAST(SUBSTRING(user_id, 4) AS UNSIGNED)) as max_number FROM users WHERE user_id LIKE "USR%"'
      );

      const result = rows as any[];
      let nextNumber = 1;

      if (result.length > 0 && result[0].max_number !== null) {
        nextNumber = result[0].max_number + 1;
      }

      // Generate the new user ID
      const userId = `USR${nextNumber.toString().padStart(6, '0')}`;
      
      console.log(`Generated user ID: ${userId}`);
      return userId;
    } catch (error) {
      console.error('Error generating user ID:', error);
      throw new Error('Failed to generate unique user ID');
    }
  }
}

// Fallback generator for testing or when database is not available
export class FallbackUserIdGenerator implements UserIdGenerator {
  private static counter = 0;

  async generateUserId(): Promise<string> {
    FallbackUserIdGenerator.counter++;
    return `USR${FallbackUserIdGenerator.counter.toString().padStart(6, '0')}`;
  }
}
