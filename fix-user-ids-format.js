const mysql = require('mysql2/promise');

// Script to fix user IDs to conform to the new 3-digit format
async function fixUserIdsFormat() {
  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kriptocar'
    });

    console.log('🔧 Fixing user IDs to conform to new 3-digit format...\n');

    // Step 1: Get all existing user IDs
    console.log('📋 Checking existing user IDs...');
    const [existingUsers] = await connection.execute(
      'SELECT user_id FROM users ORDER BY user_id'
    );
    
    if (existingUsers.length === 0) {
      console.log('   No users found in database');
      return;
    }

    console.log(`   Found ${existingUsers.length} users`);
    
    // Step 2: Identify non-compliant user IDs
    const nonCompliantUsers = [];
    const compliantUsers = [];
    
    existingUsers.forEach(user => {
      const userId = user.user_id;
      
      // Check if it matches the new format: USR + exactly 3 digits (001-999)
      const isValid = /^USR\d{3}$/.test(userId);
      const number = parseInt(userId.substring(3));
      const isInRange = number >= 1 && number <= 999;
      
      if (isValid && isInRange) {
        compliantUsers.push(userId);
      } else {
        nonCompliantUsers.push(userId);
      }
    });

    console.log(`   ✅ Compliant user IDs: ${compliantUsers.length}`);
    console.log(`   ⚠️  Non-compliant user IDs: ${nonCompliantUsers.length}`);
    
    if (nonCompliantUsers.length > 0) {
      console.log('   Non-compliant IDs:');
      nonCompliantUsers.forEach(userId => {
        console.log(`      ${userId}`);
      });
    }
    console.log('');

    // Step 3: Fix non-compliant user IDs
    if (nonCompliantUsers.length > 0) {
      console.log('🔧 Fixing non-compliant user IDs...');
      
      // Get all existing numbers to avoid conflicts
      const existingNumbers = compliantUsers
        .map(userId => parseInt(userId.substring(3)))
        .sort((a, b) => a - b);
      
      let nextAvailableNumber = 1;
      if (existingNumbers.length > 0) {
        const maxNumber = Math.max(...existingNumbers);
        
        // Find first gap or next number
        for (let i = 1; i <= maxNumber; i++) {
          if (!existingNumbers.includes(i)) {
            nextAvailableNumber = i;
            break;
          }
        }
        
        if (nextAvailableNumber === 1) {
          nextAvailableNumber = maxNumber + 1;
        }
      }

      // Start transaction
      await connection.beginTransaction();
      
      try {
        for (const oldUserId of nonCompliantUsers) {
          // Generate new user ID
          if (nextAvailableNumber > 999) {
            throw new Error('Maximum user ID limit reached (999)');
          }
          
          const newUserId = `USR${nextAvailableNumber.toString().padStart(3, '0')}`;
          
          console.log(`   Updating ${oldUserId} → ${newUserId}`);
          
          // Update the user ID
          await connection.execute(
            'UPDATE users SET user_id = ? WHERE user_id = ?',
            [newUserId, oldUserId]
          );
          
          // Add to existing numbers for next iteration
          existingNumbers.push(nextAvailableNumber);
          existingNumbers.sort((a, b) => a - b);
          
          // Find next available number
          nextAvailableNumber = 1;
          if (existingNumbers.length > 0) {
            const maxNumber = Math.max(...existingNumbers);
            
            for (let i = 1; i <= maxNumber; i++) {
              if (!existingNumbers.includes(i)) {
                nextAvailableNumber = i;
                break;
              }
            }
            
            if (nextAvailableNumber === 1) {
              nextAvailableNumber = maxNumber + 1;
            }
          }
        }
        
        // Commit transaction
        await connection.commit();
        console.log('   ✅ Successfully updated all non-compliant user IDs');
        
      } catch (error) {
        await connection.rollback();
        throw error;
      }
    } else {
      console.log('✅ All user IDs are already compliant with the new format');
    }
    console.log('');

    // Step 4: Verify the fix
    console.log('🔍 Verifying the fix...');
    const [updatedUsers] = await connection.execute(
      'SELECT user_id FROM users ORDER BY user_id'
    );
    
    const allCompliant = updatedUsers.every(user => {
      const userId = user.user_id;
      const isValid = /^USR\d{3}$/.test(userId);
      const number = parseInt(userId.substring(3));
      const isInRange = number >= 1 && number <= 999;
      return isValid && isInRange;
    });
    
    if (allCompliant) {
      console.log('   ✅ All user IDs now conform to the new format');
      console.log('   Updated user IDs:');
      updatedUsers.forEach((user, index) => {
        console.log(`      ${index + 1}. ${user.user_id}`);
      });
    } else {
      console.log('   ❌ Some user IDs still don\'t conform to the new format');
    }
    console.log('');

    console.log('🎉 User ID format fix completed successfully!');
    console.log('   New format: USR + exactly 3 digits (001-999)');
    console.log('   Examples: USR001, USR010, USR100, USR999, USR190');

  } catch (error) {
    console.error('❌ Error fixing user IDs:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the fix
fixUserIdsFormat();
