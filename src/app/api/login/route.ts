import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';

export async function POST(request: Request) {
  try {
    console.log('🔐 Login API called');

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log('📧 Login attempt for:', email);

    const users = (await query(
      'SELECT user_id, email, password, full_name, phone, address, city, state, pincode, created_at, updated_at, is_active, last_login FROM users WHERE email = ? LIMIT 1',
      [email]
    )) as any[];

    if (!users || users.length === 0) {
      console.log('❌ User not found:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log('✅ User found:', user.user_id);

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for user:', email);
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await query('UPDATE users SET last_login = NOW() WHERE user_id = ?', [user.user_id]);

    const token = Buffer.from(`${user.user_id}:${Date.now()}`).toString('base64');

    const { password: _userPassword, ...userData } = user;

    console.log('✅ Login successful for user:', user.user_id);

    return NextResponse.json({
      success: true,
      user: userData,
      token: token,
    });
  } catch (error: any) {
    console.error('❌ Login error:', error);

    return NextResponse.json(
      { success: false, message: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}