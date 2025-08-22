import { NextRequest, NextResponse } from 'next/server';
import { calendarEngine } from '@/lib/calendar/calendar-engine';

/**
 * Get available time slots for a specific date
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate date is not in the past
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return NextResponse.json(
        { error: 'Cannot book appointments in the past' },
        { status: 400 }
      );
    }

    const availableSlots = calendarEngine.generateAvailableSlots(date);

    return NextResponse.json({
      success: true,
      date,
      slots: availableSlots,
      availableCount: availableSlots.filter(slot => slot.isAvailable).length,
      message: `Found ${availableSlots.length} time slots for ${date}`
    });

  } catch (error) {
    console.error('Calendar slots API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch available time slots',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}