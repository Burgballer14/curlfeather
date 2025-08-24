/**
 * Email Automation API Routes
 * Handles email communication triggers and testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { emailAutomationService } from '@/lib/communications/email-automation';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'send_welcome':
        const welcomeResult = await emailAutomationService.sendWelcomeEmail(data);
        return NextResponse.json(welcomeResult);

      case 'send_milestone_completion':
        const milestoneResult = await emailAutomationService.sendMilestoneCompletion(data);
        return NextResponse.json(milestoneResult);

      case 'send_payment_confirmation':
        const paymentResult = await emailAutomationService.sendPaymentConfirmation(data);
        return NextResponse.json(paymentResult);

      case 'send_project_completion':
        const completionResult = await emailAutomationService.sendProjectCompletion(data);
        return NextResponse.json(completionResult);

      case 'send_invoice_reminder':
        const reminderResult = await emailAutomationService.sendInvoiceReminder(data);
        return NextResponse.json(reminderResult);

      case 'test_configuration':
        const testResult = await emailAutomationService.testEmailConfiguration();
        return NextResponse.json(testResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email automation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'test':
        const testResult = await emailAutomationService.testEmailConfiguration();
        return NextResponse.json(testResult);

      case 'templates':
        // Return available email templates
        const templates = [
          { id: 'welcome', name: 'Welcome Email', description: 'New customer onboarding' },
          { id: 'milestone_completion', name: 'Milestone Completion', description: 'Project milestone completed' },
          { id: 'payment_confirmation', name: 'Payment Confirmation', description: 'Payment received confirmation' },
          { id: 'project_completion', name: 'Project Completion', description: 'Project completed notification' },
          { id: 'invoice_reminder', name: 'Invoice Reminder', description: 'Payment reminder notification' },
        ];
        return NextResponse.json({ success: true, templates });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Email automation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}