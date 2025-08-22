import { NextRequest, NextResponse } from 'next/server';
import { executeAutomation, saveLeadToDatabase } from '@/lib/automation/orchestrator';
import { trackConversion } from '@/lib/supabase/client-simple';
import type { QuoteFormData } from '@/lib/validations/simple-forms';

/**
 * Handle quote form submission with full automation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leadData, metadata } = body as {
      leadData: QuoteFormData;
      metadata?: Record<string, any>;
    };

    // Validate required fields
    if (!leadData || !leadData.name || !leadData.email || !leadData.phone) {
      return NextResponse.json(
        { error: 'Missing required lead data' },
        { status: 400 }
      );
    }

    // Execute automation workflow
    const automationResult = await executeAutomation({
      type: 'quote_submitted',
      leadData,
      metadata: {
        ...metadata,
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        user_agent: request.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString()
      }
    });

    // Track conversion for Google Ads
    await trackConversion(
      'quote_completed',
      automationResult.leadId,
      automationResult.estimatedValue,
      {
        lead_score: automationResult.leadScore,
        project_type: leadData.project_type,
        estimated_value: automationResult.estimatedValue,
        utm_source: metadata?.utm_source || 'direct'
      }
    );

    // Save to database
    const dbSaved = await saveLeadToDatabase(leadData, automationResult);

    // Return detailed response
    return NextResponse.json({
      success: automationResult.success,
      leadId: automationResult.leadId,
      leadScore: automationResult.leadScore,
      estimatedValue: automationResult.estimatedValue,
      automation: {
        emailSent: automationResult.emailSent,
        smsSent: automationResult.smsSent,
        errors: automationResult.errors
      },
      database: {
        saved: dbSaved
      },
      message: 'Quote automation executed successfully'
    });

  } catch (error) {
    console.error('Quote automation API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Test automation endpoint (for development/debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testMode = searchParams.get('test') === 'true';
    
    if (!testMode) {
      return NextResponse.json(
        { error: 'Test mode not enabled' },
        { status: 403 }
      );
    }

    // Import test function
    const { testAutomationSystem } = await import('@/lib/automation/orchestrator');
    
    // Run automation test
    const testResult = await testAutomationSystem();
    
    return NextResponse.json({
      success: true,
      testResult,
      message: 'Automation test completed'
    });

  } catch (error) {
    console.error('Automation test error:', error);
    
    return NextResponse.json(
      {
        error: 'Test failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}