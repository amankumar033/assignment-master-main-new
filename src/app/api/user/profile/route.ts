import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get user ID from headers
    const userId = request.headers.get('user-id');

    console.log('=== GET USER PROFILE API CALLED ===');
    console.log('User ID:', userId);

    if (!userId) {
      console.log('❌ User ID missing in headers');
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user profile from users table
    const userResult = await query(
      `SELECT 
        user_id,
        full_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        created_at,
        updated_at,
        is_active,
        last_login
      FROM kriptocar.users 
      WHERE user_id = ?`,
      [userId]
    ) as any[];

    console.log('User query result:', userResult);

    if (!userResult || userResult.length === 0) {
      console.log('❌ User not found');
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const user = userResult[0];
    console.log('✅ User found:', user);

    const response = {
      success: true,
      message: 'User profile fetched successfully',
      user: {
        user_id: user.user_id,
        full_name: user.full_name || '',
        name: user.full_name || '', // Keep for backward compatibility
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        state: user.state || '',
        pincode: user.pincode || '',
        created_at: user.created_at,
        updated_at: user.updated_at,
        is_active: user.is_active,
        last_login: user.last_login
      }
    };

    console.log('✅ Returning success response:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    
    let errorMessage = 'Failed to fetch user profile';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Database table not found - please run database setup scripts';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied - check credentials';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused - check if database is running';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        message: errorMessage,
        debug: {
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, name, email, phone, address, city, state, pincode } = body;

    console.log('=== UPDATE USER PROFILE API CALLED ===');
    console.log('Update data:', { user_id, name, email, phone, address, city, state, pincode });

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Update user profile
    const updateResult = await query(
      `UPDATE kriptocar.users 
       SET full_name = ?, email = ?, phone = ?, address = ?, city = ?, state = ?, pincode = ?, updated_at = NOW()
       WHERE user_id = ?`,
      [name, email, phone, address, city, state, pincode, user_id]
    ) as any;

    console.log('Update result:', updateResult);

    if (updateResult.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found or no changes made' },
        { status: 404 }
      );
    }

    // Get updated user data
    const userResult = await query(
      `SELECT 
        user_id,
        full_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        created_at,
        updated_at,
        is_active,
        last_login
      FROM kriptocar.users 
      WHERE user_id = ?`,
      [user_id]
    ) as any[];

    const updatedUser = userResult[0];

    const response = {
      success: true,
      message: 'User profile updated successfully',
      user: {
        user_id: updatedUser.user_id,
        full_name: updatedUser.full_name || '',
        name: updatedUser.full_name || '', // Keep for backward compatibility
        email: updatedUser.email || '',
        phone: updatedUser.phone || '',
        address: updatedUser.address || '',
        city: updatedUser.city || '',
        state: updatedUser.state || '',
        pincode: updatedUser.pincode || '',
        created_at: updatedUser.created_at,
        updated_at: updatedUser.updated_at,
        is_active: updatedUser.is_active,
        last_login: updatedUser.last_login
      }
    };

    console.log('✅ Profile updated successfully:', response);
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    
    let errorMessage = 'Failed to update user profile';
    
    if (error instanceof Error) {
      if (error.message.includes('ER_NO_SUCH_TABLE')) {
        errorMessage = 'Database table not found';
      } else if (error.message.includes('ER_ACCESS_DENIED')) {
        errorMessage = 'Database access denied';
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage = 'Database connection refused';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 