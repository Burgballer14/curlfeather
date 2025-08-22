import { NextRequest, NextResponse } from 'next/server';
import { abTestEngine } from '@/lib/ab-testing/ab-test-engine';

/**
 * Get A/B test variant assignment for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');
    const userId = searchParams.get('userId');

    if (!testId || !userId) {
      return NextResponse.json(
        { error: 'Test ID and User ID are required' },
        { status: 400 }
      );
    }

    const variant = abTestEngine.getVariantForUser(testId, userId);

    if (!variant) {
      return NextResponse.json(
        { error: 'Test not found or not active' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      variant,
      testId,
      userId
    });

  } catch (error) {
    console.error('A/B testing variant API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get variant assignment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}