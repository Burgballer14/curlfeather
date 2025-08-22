import { NextRequest, NextResponse } from 'next/server';
import { calendarEngine } from '@/lib/calendar/calendar-engine';

/**
 * Get available dates for appointment booking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = parseInt(searchParams.get('days') || '14');

    const availableDates = calendarEngine.getAvailableDates(daysAhead);

    return NextResponse.json({
      success: true,
      dates: availableDates,
      message: `Found ${availableDates.length} available dates`
    });

  } catch (error) {
    console.error('Calendar dates API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch available dates',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}