import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 60000; // 1 minute

function getCachedData(): any | null {
  const cached = cache.get('service_categories');
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
}

function setCachedData(data: any): void {
  cache.set('service_categories', {
    data,
    timestamp: Date.now()
  });
}

export async function GET() {
  try {
    // Check cache first
    const cachedResult = getCachedData();
    if (cachedResult) {
      console.log('Returning cached service categories data');
      return NextResponse.json(cachedResult);
    }

    const serviceCategories = await query(
      'SELECT * FROM kriptocar.service_categories ORDER BY name ASC'
    );

    const result = {
      success: true,
      serviceCategories: serviceCategories
    };

    // Cache the result
    setCachedData(result);

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error fetching service categories:', error);
    
    // Handle specific database connection errors
    if (error instanceof Error && error.message.includes('connection limit')) {
      const result = {
        success: true,
        serviceCategories: [],
        message: 'Database temporarily unavailable. Please try again later.'
      };
      
      // Cache the empty result to prevent repeated failed calls
      setCachedData(result);
      
      return NextResponse.json(result);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch service categories',
      serviceCategories: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
