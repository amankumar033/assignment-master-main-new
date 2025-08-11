import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('userId');

    if (!user_id) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required',
        cartItems: []
      });
    }

    const users = await query(
      'SELECT cart_items FROM kriptocar.users WHERE user_id = ?',
      [user_id]
    ) as any[];

    let cartItems = [];
    if (users[0]?.cart_items) {
      try {
        cartItems = typeof users[0].cart_items === 'string' 
          ? JSON.parse(users[0].cart_items) 
          : users[0].cart_items;
      } catch {
        cartItems = [];
      }
    }

    return NextResponse.json({
      success: true,
      cartItems: cartItems
    });
  } catch (error) {
    console.error('Error in cart GET API:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection limit')) {
      return NextResponse.json({
        success: false,
        message: 'Database temporarily unavailable. Please try again.',
        cartItems: []
      }, { status: 503 });
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to load cart',
      cartItems: []
    }, { status: 500 });
  }
} 