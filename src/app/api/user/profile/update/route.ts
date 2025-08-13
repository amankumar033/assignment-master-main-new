import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const user_id = request.headers.get('user-id');
    const formData = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const existingUsers = await query(
      'SELECT user_id FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    if (!existingUsers || existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Update user profile
    await query(
      `UPDATE kriptocar.users SET
        full_name = ?,
        phone = ?,
        address = ?,
        city = ?,
        state = ?,
        pincode = ?,
        updated_at = NOW()
      WHERE user_id = ?`,
      [
        formData.full_name || formData.fullName || null, // Support both field names
        formData.phone || null,
        formData.address || null,
        formData.city || null,
        formData.state || null,
        formData.pincode || null,
        user_id
      ]
    );

    // Fetch updated user data
    const updatedUsers = await query(
      'SELECT user_id, email, full_name, phone, address, city, state, pincode, created_at, updated_at FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    const updatedUser = updatedUsers[0];
    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
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
        updated_at: updatedUser.updated_at
      }
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 