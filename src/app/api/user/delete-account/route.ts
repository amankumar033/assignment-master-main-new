import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Delete user's orders first (due to foreign key constraints)
    await query('DELETE FROM orders WHERE user_id = ?', [user_id]);

    // Delete user's service orders
    await query('DELETE FROM service_orders WHERE user_id = ?', [user_id]);

    // Clear user's cart items (stored as JSON in users table)
    await query('UPDATE users SET cart_items = NULL WHERE user_id = ?', [user_id]);

    // Finally delete the user
    const result = await query('DELETE FROM users WHERE user_id = ?', [user_id]);

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Account deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 }
    );
  }
}