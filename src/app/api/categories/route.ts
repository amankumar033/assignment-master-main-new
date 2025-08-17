import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

function getCachedData(): any | null {
  const cached = cache.get('categories');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(data: any): void {
  cache.set('categories', {
    data,
    timestamp: Date.now()
  });
}

export async function GET() {
  try {
    // Check cache first
    const cachedResult = getCachedData();
    if (cachedResult) {
      console.log('Returning cached categories data');
      return NextResponse.json(cachedResult);
    }

    const categories = await query(
      'SELECT * FROM kriptocar.categories WHERE is_active = 1 ORDER BY name ASC'
    );

    const result = {
      success: true,
      categories: categories
    };

    // Cache the result
    setCachedData(result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching categories:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection limit')) {
      const result = {
        success: true,
        categories: [],
        message: 'Database temporarily unavailable. Please try again later.'
      };
      
      // Cache the empty result to prevent repeated failed calls
      setCachedData(result);
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch categories',
      categories: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 