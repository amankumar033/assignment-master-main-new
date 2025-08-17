import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== DATABASE TEST API CALLED ===');

    // Test 1: Check if we can connect to the database
    console.log('Testing database connection...');
    
    // Test 2: Check if users table exists and get its structure
    console.log('Checking users table structure...');
    const tableStructure = await query(
      'DESCRIBE kriptocar.users'
    ) as any[];

    console.log('Users table structure:', tableStructure);

    // Test 3: Check if we can query the users table
    console.log('Testing users table query...');
    const userCount = await query(
      'SELECT COUNT(*) as count FROM kriptocar.users'
    ) as any[];

    console.log('User count:', userCount);

    // Test 4: Get a sample user
    console.log('Getting sample user...');
    const sampleUser = await query(
      'SELECT user_id, email, full_name FROM kriptocar.users LIMIT 1'
    ) as any[];

    console.log('Sample user:', sampleUser);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        tableStructure: tableStructure,
        userCount: userCount[0]?.count || 0,
        sampleUser: sampleUser[0] || null
      }
    });

  } catch (error) {
    console.error('❌ Database test error:', error);
    
    let errorMessage = 'Database test failed';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Users table not found';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 