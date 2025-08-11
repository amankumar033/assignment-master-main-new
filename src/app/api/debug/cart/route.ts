import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('userId');

    if (!user_id) {
      return NextResponse.json(
        { success: false, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get cart items from users table
    const users = await query(
      'SELECT cart_items FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    let cartItems = [];
    
    if (users[0].cart_items) {
      try {
        cartItems = JSON.parse(users[0].cart_items);
      } catch (error) {
        console.error('Error parsing cart items:', error);
        cartItems = [];
      }
    }

    return NextResponse.json({
      success: true,
      cartItems: cartItems,
      rawCartItems: users[0].cart_items
    });

  } catch (error) {
    console.error('Error debugging cart:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to debug cart' },
      { status: 500 }
    );
  }
} 