/**
 * Communication Orchestrator API Routes
 * Handles orchestrated communication workflows and triggers
 */

import { NextRequest, NextResponse } from 'next/server';
import { communicationOrchestrator, ProjectCommunicationTrigger } from '@/lib/services/communication-orchestrator';

export async function POST(request: NextRequest) {
  try {
    const { action, trigger, data } = await request.json();

    switch (action) {
      case 'process_trigger':
        if (!trigger) {
          return NextResponse.json(
            { success: false, error: 'Trigger data is required' },
            { status: 400 }
          );
        }
        const result = await communicationOrchestrator.processTrigger(trigger as ProjectCommunicationTrigger);
        return NextResponse.json(result);

      case 'milestone_completion':
        const milestoneResult = await communicationOrchestrator.handleMilestoneCompletion(data);
        return NextResponse.json(milestoneResult);

      case 'payment_received':
        const paymentResult = await communicationOrchestrator.handlePaymentReceived(data);
        return NextResponse.json(paymentResult);

      case 'project_completion':
        const completionResult = await communicationOrchestrator.handleProjectCompletion(data);
        return NextResponse.json(completionResult);

      case 'crew_dispatch':
        const crewResult = await communicationOrchestrator.handleCrewDispatch(data);
        return NextResponse.json(crewResult);

      case 'payment_reminder':
        const reminderResult = await communicationOrchestrator.handlePaymentReminder(data);
        return NextResponse.json(reminderResult);

      case 'customer_onboarding':
        const onboardingResult = await communicationOrchestrator.handleCustomerOnboarding(data);
        return NextResponse.json(onboardingResult);

      case 'test_system':
        const testResult = await communicationOrchestrator.testCommunicationSystem();
        return NextResponse.json(testResult);

      case 'schedule_reminders':
        const scheduleResult = await communicationOrchestrator.scheduleAutomatedReminders();
        return NextResponse.json(scheduleResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Communication orchestrator API error:', error);
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
        const testResult = await communicationOrchestrator.testCommunicationSystem();
        return NextResponse.json(testResult);

      case 'workflows':
        // Return available communication workflows
        const workflows = [
          {
            id: 'milestone_completion',
            name: 'Milestone Completion',
            description: 'Triggered when a project milestone is completed',
            triggers: ['email', 'sms'],
          },
          {
            id: 'payment_received',
            name: 'Payment Received',
            description: 'Triggered when a payment is successfully processed',
            triggers: ['email'],
          },
          {
            id: 'project_completion',
            name: 'Project Completion',
            description: 'Triggered when a project is fully completed',
            triggers: ['email', 'sms'],
          },
          {
            id: 'crew_dispatch',
            name: 'Crew Dispatch',
            description: 'Triggered when crew is dispatched to project site',
            triggers: ['sms'],
          },
          {
            id: 'payment_reminder',
            name: 'Payment Reminder',
            description: 'Triggered for overdue invoices',
            triggers: ['email', 'sms'],
          },
          {
            id: 'customer_onboarding',
            name: 'Customer Onboarding',
            description: 'Triggered for new customer welcome sequence',
            triggers: ['email', 'sms'],
          },
        ];
        return NextResponse.json({ success: true, workflows });

      case 'status':
        // Return communication system status
        const systemStatus = {
          emailService: 'operational',
          smsService: 'operational',
          orchestrator: 'operational',
          lastHealthCheck: new Date().toISOString(),
        };
        return NextResponse.json({ success: true, status: systemStatus });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Communication orchestrator API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}