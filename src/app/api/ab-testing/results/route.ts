import { NextRequest, NextResponse } from 'next/server';
import { abTestEngine } from '@/lib/ab-testing/ab-test-engine';

/**
 * Get A/B test results and metrics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get('testId');

    if (!testId) {
      return NextResponse.json(
        { error: 'Test ID is required' },
        { status: 400 }
      );
    }

    const test = abTestEngine.getTest(testId);
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    const metrics = abTestEngine.getTestMetrics(testId);

    return NextResponse.json({
      success: true,
      test: {
        id: test.id,
        name: test.name,
        description: test.description,
        type: test.type,
        status: test.status,
        startDate: test.startDate,
        endDate: test.endDate,
        goals: test.goals
      },
      metrics,
      summary: {
        totalVariants: test.variants.length,
        activeVariants: test.variants.filter(v => v.active).length,
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        bestPerforming: metrics.find(m => m.isWinner)?.variantName || 'TBD'
      }
    });

  } catch (error) {
    console.error('A/B testing results API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get test results',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Get all active tests summary
 */
export async function POST(request: NextRequest) {
  try {
    const activeTests = abTestEngine.getActiveTests();
    const testSummaries = activeTests.map(test => {
      const metrics = abTestEngine.getTestMetrics(test.id);
      return {
        id: test.id,
        name: test.name,
        type: test.type,
        status: test.status,
        variants: test.variants.length,
        totalImpressions: metrics.reduce((sum, m) => sum + m.impressions, 0),
        bestVariant: metrics.find(m => m.isWinner)?.variantName || 'TBD',
        primaryGoalConversion: metrics.length > 0 && test.goals.length > 0 
          ? metrics.reduce((sum, m) => sum + (m.conversionRates[test.goals[0]] || 0), 0) / metrics.length
          : 0
      };
    });

    return NextResponse.json({
      success: true,
      activeTests: testSummaries,
      totalActiveTests: activeTests.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('A/B testing summary API error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to get tests summary',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}