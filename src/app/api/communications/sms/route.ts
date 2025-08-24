/**
 * SMS Automation API Routes
 * Handles SMS communication triggers and testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { smsAutomationService } from '@/lib/communications/sms-automation';

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'send_welcome':
        const welcomeResult = await smsAutomationService.sendWelcomeSMS(data);
        return NextResponse.json(welcomeResult);

      case 'send_project_update':
        const updateResult = await smsAutomationService.sendProjectUpdate(data);
        return NextResponse.json(updateResult);

      case 'send_payment_reminder':
        const reminderResult = await smsAutomationService.sendPaymentReminder(data);
        return NextResponse.json(reminderResult);

      case 'send_appointment_reminder':
        const appointmentResult = await smsAutomationService.sendAppointmentReminder(data);
        return NextResponse.json(appointmentResult);

      case 'test_configuration':
        const testResult = await smsAutomationService.testSMSConfiguration();
        return NextResponse.json(testResult);

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SMS automation API error:', error);
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
        const testResult = await smsAutomationService.testSMSConfiguration();
        return NextResponse.json(testResult);

      case 'templates':
        // Return available SMS templates
        const templates = [
          { id: 'welcome', name: 'Welcome SMS', description: 'New customer onboarding' },
          { id: 'project_update', name: 'Project Update', description: 'Project status notifications' },
          { id: 'payment_reminder', name: 'Payment Reminder', description: 'Payment due notifications' },
          { id: 'appointment_reminder', name: 'Appointment Reminder', description: 'Upcoming appointment alerts' },
        ];
        return NextResponse.json({ success: true, templates });

      case 'delivery_status':
        // In a real implementation, this would query Twilio for delivery status
        const messageId = searchParams.get('messageId');
        if (!messageId) {
          return NextResponse.json(
            { success: false, error: 'Message ID required' },
            { status: 400 }
          );
        }

        // Mock delivery status for now
        const deliveryStatus = {
          messageId,
          status: 'delivered', // delivered, failed, pending
          deliveredAt: new Date().toISOString(),
        };
        return NextResponse.json({ success: true, deliveryStatus });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('SMS automation API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}