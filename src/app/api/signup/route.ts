import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/email';
import { createNotificationWithTemplate } from '@/lib/notifications';
import { userIdGenerator } from '@/lib/userIdGenerator';

export async function POST(request: Request) {
  try {
    console.log('📝 Signup API called');

    const formData = await request.json();

    if (!formData.email || !formData.password || !formData.fullName) {
      return NextResponse.json(
        { success: false, message: 'Email, password, and full name are required' },
        { status: 400 }
      );
    }

    console.log('📧 Signup attempt for:', formData.email);

    const existingUsers = (await query(
      'SELECT user_id FROM users WHERE email = ? LIMIT 1',
      [formData.email]
    )) as any[];

    if (existingUsers && existingUsers.length > 0) {
      console.log('❌ User already exists:', formData.email);
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(formData.password, salt);

    // Generate user_id using centralized generator with dynamic padding
    const userId = await userIdGenerator.generateUserId();

    await query(
      `INSERT INTO users (
        user_id, full_name, email, password, phone, address, city, state, pincode, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        formData.fullName,
        formData.email,
        hashedPassword,
        formData.phone || null,
        formData.address || null,
        formData.city || null,
        formData.state || null,
        formData.pincode || null,
        1,
      ]
    );

    console.log('✅ User created successfully:', userId);

    const response = NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        user_id: userId,
        full_name: formData.fullName,
        email: formData.email,
      },
    });

    // Async side-effects
    Promise.resolve().then(async () => {
      console.log('🚀 Starting email and notification processing...');

      try {
        console.log('📧 Sending welcome email to:', formData.email);
        await sendWelcomeEmail(formData.email, formData.fullName);
      } catch (emailError) {
        console.error('❌ Error sending welcome email:', emailError);
      }

      try {
        // Admin notification: user_registered
        await createNotificationWithTemplate(
          'user_registered',
          'admin',
          {
            user_name: formData.fullName,
            user_email: formData.email,
            registration_date: new Date().toISOString(),
          },
          { user_id: userId }
        );
        // User notification (optional):
        await createNotificationWithTemplate(
          'user_registered',
          'customer',
          {
            user_name: formData.fullName,
            user_email: formData.email,
          },
          { user_id: userId }
        );
      } catch (notificationError) {
        console.error('❌ Error creating notification:', notificationError);
      }
    });

    return response;
  } catch (error: any) {
    console.error('❌ Signup error:', error);

    if (error.code === 'ER_DUP_ENTRY' && error.message.includes('email')) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}