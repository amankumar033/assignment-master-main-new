import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;

    // Check if the parameter is a slug or an ID
    // Category IDs like CTR1, CTR10, CTR101 should be treated as IDs, not slugs
    const isNumeric = /^\d+$/.test(categoryId);
    const isCategoryId = /^CTR\d+$/.test(categoryId); // Matches CTR followed by numbers
    let sqlQuery: string;

    if (isNumeric || isCategoryId) {
      // If it's numeric or matches CTR pattern, treat as category_id
      sqlQuery = `
        SELECT image, name
        FROM kriptocar.categories
        WHERE category_id = ? AND is_active = 1
      `;
    } else {
      // If it's not numeric or CTR pattern, treat as slug
      sqlQuery = `
        SELECT image, name
        FROM kriptocar.categories
        WHERE slug = ? AND is_active = 1
      `;
    }

    // Fetch category image from BLOB
    const rows = await query(sqlQuery, [categoryId]);

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, message: 'Category not found' },
        { status: 404 }
      );
    }

    const category = (rows as any[])[0];
    
    if (!category.image) {
      return NextResponse.json(
        { success: false, message: 'No image found for this category' },
        { status: 404 }
      );
    }

    // Convert BLOB to Buffer
    const imageBuffer = Buffer.from(category.image);

    // Try to detect image format based on magic numbers
    let contentType = 'image/png'; // default
    if (imageBuffer.length > 4) {
      const header = imageBuffer.subarray(0, 4);
      if (header[0] === 0xFF && header[1] === 0xD8) {
        contentType = 'image/jpeg';
      } else if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) {
        contentType = 'image/png';
      } else if (header[0] === 0x47 && header[1] === 0x49 && header[2] === 0x46) {
        contentType = 'image/gif';
      }
    }

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error: any) {
    console.error('Error fetching category image:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch category image' },
      { status: 500 }
    );
  }
}

