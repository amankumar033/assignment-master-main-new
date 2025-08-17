import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      user_id = 'USR001',
      type = 'debug_test',
      title = 'Test Notification',
      message = 'This is a test notification from the debug API',
      description = 'Debug notification to verify IST timestamps and insertion',
      for_admin = 1
    } = body || {};

    const success = await createNotification({
      type,
      title,
      message,
      description,
      for_admin,
      user_id,
    });

    if (!success) {
      return NextResponse.json({ success: false, message: 'Failed to create test notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Test notification created successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Error creating test notification', error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    usage: {
      method: 'POST',
      url: '/api/debug/notifications',
      body: {
        user_id: 'USR001',
        type: 'debug_test',
        title: 'Test Notification',
        message: 'Message',
        description: 'Optional',
        for_admin: 1
      }
    }
  });
}


