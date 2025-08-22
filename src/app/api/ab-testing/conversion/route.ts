import { NextRequest, NextResponse } from 'next/server';
import { abTestEngine } from '@/lib/ab-testing/ab-test-engine';

/**
 * Track A/B test conversion
 */
export async function POST(request: NextRequest) {
  try {
    const { testId, variantId, userId, sessionId, goal, metadata } = await request.json();

    if (!testId || !variantId || !userId || !sessionId || !goal) {
      return NextResponse.json(
        { error: 'Test ID, Variant ID, User ID, Session ID, and Goal are required' },
        { status: 400 }
      );
    }

    abTestEngine.trackConversion(testId, variantId, userId, sessionId, goal, metadata);

    return NextResponse.json({
      success: true,
      message: 'Conversion tracked successfully',
      data: {
        testId,
        variantId,
        goal,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('A/B testing conversion API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to track conversion',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}