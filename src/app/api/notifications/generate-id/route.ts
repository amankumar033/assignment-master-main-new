import { NextResponse } from 'next/server';
import { notificationIdGenerator, NotificationIdGenerator } from '@/lib/notificationIdGenerator';

export async function POST() {
  try {
    // Generate a unique notification ID
    const notificationId = await notificationIdGenerator.generateNotificationId();
    
    // Get statistics for response
    const statistics = await notificationIdGenerator.getNotificationIdStatistics();
    
    const response = {
      success: true,
      message: 'Notification ID generated successfully',
      data: {
        notification_id: notificationId,
        notification_number: NotificationIdGenerator.extractNotificationNumber(notificationId),
        range_info: NotificationIdGenerator.getRangeInfo(NotificationIdGenerator.extractNotificationNumber(notificationId)),
        statistics: {
          total_notifications: statistics.totalNotifications,
          next_available_number: statistics.nextAvailableNumber,
          used_ranges: statistics.usedRanges,
          available_ranges: statistics.availableRanges,
          gaps: statistics.gaps
        }
      }
    };
    
    console.log(`✅ Generated notification ID: ${notificationId}`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error generating notification ID:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate notification ID',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get statistics about notification ID usage
    const statistics = await notificationIdGenerator.getNotificationIdStatistics();
    
    const response = {
      success: true,
      message: 'Notification ID statistics retrieved successfully',
      data: {
        total_notifications: statistics.totalNotifications,
        next_available_number: statistics.nextAvailableNumber,
        used_ranges: statistics.usedRanges,
        available_ranges: statistics.availableRanges,
        gaps: statistics.gaps,
        range_explanation: {
          range_1: 'NOT001 to NOT010',
          range_2: 'NOT011 to NOT020',
          range_3: 'NOT021 to NOT030',
          '...': 'And so on...'
        }
      }
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ Error getting notification ID statistics:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to get notification ID statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
