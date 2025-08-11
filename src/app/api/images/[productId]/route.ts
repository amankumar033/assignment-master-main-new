import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const imageType = request.nextUrl.searchParams.get('type') || 'image_1';

    console.log('=== IMAGE API CALLED ===');
    console.log('Product ID:', productId);
    console.log('Image type:', imageType);

    // Fetch image from database
    const rows = await query(
      `SELECT ${imageType} FROM kriptocar.products WHERE product_id = ?`,
      [productId]
    ) as any[];

    if (!rows || rows.length === 0) {
      console.log('❌ Product not found');
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    const imageData = rows[0][imageType];

    if (!imageData) {
      console.log('❌ Image not found');
      return NextResponse.json(
        { success: false, message: 'Image not found' },
        { status: 404 }
      );
    }

    console.log('✅ Image found, size:', imageData.length);

    // Convert Buffer to base64 and return as data URL
    const base64 = imageData.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64}`;

    return NextResponse.json({
      success: true,
      imageUrl: dataUrl
    });

  } catch (error: any) {
    console.error('❌ Error fetching image:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch image' },
      { status: 500 }
    );
  }
} 