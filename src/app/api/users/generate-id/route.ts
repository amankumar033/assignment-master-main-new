import { NextResponse } from 'next/server';
import { userIdGenerator, UserIdGenerator } from '@/lib/userIdGenerator';

export async function POST() {
  try {
    // Generate a unique user ID
    const userId = await userIdGenerator.generateUserId();
    
    // Get statistics for response
    const statistics = await userIdGenerator.getUserIdStatistics();
    
    const response = {
      success: true,
      message: 'User ID generated successfully',
      data: {
        user_id: userId,
        user_number: UserIdGenerator.extractUserNumber(userId),
        range_info: UserIdGenerator.getRangeInfo(UserIdGenerator.extractUserNumber(userId)),
        statistics: {
          total_users: statistics.totalUsers,
          next_available_number: statistics.nextAvailableNumber,
          used_ranges: statistics.usedRanges,
          available_ranges: statistics.availableRanges,
          gaps: statistics.gaps
        }
      }
    };
    
    console.log(`✅ Generated user ID: ${userId}`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error generating user ID:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate user ID',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get statistics about user ID usage
    const statistics = await userIdGenerator.getUserIdStatistics();
    
    const response = {
      success: true,
      message: 'User ID statistics retrieved successfully',
      data: {
        total_users: statistics.totalUsers,
        next_available_number: statistics.nextAvailableNumber,
        used_ranges: statistics.usedRanges,
        available_ranges: statistics.availableRanges,
        gaps: statistics.gaps,
        range_explanation: {
          range_1: 'USR001 to USR010',
          range_2: 'USR011 to USR020',
          range_3: 'USR021 to USR030',
          '...': 'And so on...'
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error getting user ID statistics:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get user ID statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
