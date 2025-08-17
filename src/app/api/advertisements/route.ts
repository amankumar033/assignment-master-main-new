import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    console.log('📢 Fetching advertisement images from database...');

    const result = await query(
      'SELECT id, image, name FROM kriptocar.advertisements ORDER BY id ASC'
    ) as any[];

    console.log(`✅ Found ${result.length} advertisement images`);

    // Convert blob images to base64 for frontend display
    const advertisements = result.map(ad => ({
      id: ad.id,
      name: ad.name,
      image: ad.image ? `data:image/jpeg;base64,${ad.image.toString('base64')}` : null
    }));

    return NextResponse.json({
      success: true,
      advertisements: advertisements
    });

  } catch (error) {
    console.error('❌ Error fetching advertisement images:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch advertisement images',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
