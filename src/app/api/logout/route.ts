import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // In a real application, you might want to invalidate the token on the server
    // For now, we'll just return a success response
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Logout failed' },
      { status: 500 }
    );
  }
} 