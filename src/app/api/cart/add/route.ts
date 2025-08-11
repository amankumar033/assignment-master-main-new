import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { product_id, user_id } = await request.json();

    if (!product_id || !user_id) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Get current cart items
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

    // Check if item already exists
    const existingItemIndex = cartItems.findIndex((item: any) => item.product_id === product_id);

    if (existingItemIndex !== -1) {
      // Increment quantity
      cartItems[existingItemIndex].quantity += 1;
    } else {
      // Add new item
      cartItems.push({
        product_id,
        quantity: 1,
        name: `Product ${product_id}`,
        price: 0,
        image: null
      });
    }

    // Update database with new cart items
    await query(
      'UPDATE kriptocar.users SET cart_items = ? WHERE user_id = ?',
      [JSON.stringify(cartItems), user_id]
    );

    return NextResponse.json({
      success: true,
      cartItems: cartItems
    });

  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
