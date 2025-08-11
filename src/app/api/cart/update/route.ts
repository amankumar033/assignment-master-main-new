import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

async function handleUpdate(request: NextRequest) {
  const { user_id, cart_items } = await request.json();

  await query(
    'UPDATE kriptocar.users SET cart_items = ? WHERE user_id = ?',
    [JSON.stringify(cart_items || []), user_id]
  );

  return NextResponse.json({
    success: true,
    cartItems: cart_items || []
  });
}

export async function PUT(request: NextRequest) {
  return handleUpdate(request);
}

// Support POST for sendBeacon/keepalive flush during unload
export async function POST(request: NextRequest) {
  return handleUpdate(request);
}
