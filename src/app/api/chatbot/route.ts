import { NextRequest, NextResponse } from 'next/server';
import { chatbotEngine } from '@/lib/chatbot/chatbot-engine';
import { sendLeadAlertSMS } from '@/lib/automation/sms';
import { sendLeadNotificationEmail } from '@/lib/automation/email';

/**
 * Handle chatbot message processing
 */
export async function POST(request: NextRequest) {
  try {
    const { sessionId, message } = await request.json();

    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    // Process message through chatbot engine
    const newMessages = chatbotEngine.processMessage(sessionId, message);
    const session = chatbotEngine.getSession(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Check if lead needs human handoff
    const { leadData } = session;
    if (leadData.qualificationScore >= 70 || leadData.appointmentRequested) {
      // Send notifications for high-priority leads
      try {
        if (leadData.email && leadData.name) {
          await sendLeadNotificationEmail({
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone || 'Not provided',
            address: leadData.location || 'Not provided',
            projectType: leadData.projectType || 'General inquiry',
            estimatedCost: 0, // Chatbot leads don't have pricing yet
            leadScore: leadData.qualificationScore,
            projectDetails: {
              roomLength: 'N/A',
              roomWidth: 'N/A',
              ceilingHeight: 'N/A',
              timeline: leadData.timeline || leadData.urgency || 'Not specified',
              budget: leadData.budget || 'Not specified',
              services: { chatbot_lead: true }
            }
          });
        }

        if (leadData.phone && leadData.qualificationScore >= 80) {
          await sendLeadAlertSMS({
            name: leadData.name || 'Chatbot Lead',
            phone: leadData.phone,
            email: leadData.email || 'Not provided',
            estimatedCost: 0,
            leadScore: leadData.qualificationScore,
            projectType: leadData.projectType || 'Chatbot inquiry',
            timeline: leadData.timeline || leadData.urgency || 'Not specified'
          });
        }
      } catch (notificationError) {
        console.error('Failed to send lead notifications:', notificationError);
      }
    }

    return NextResponse.json({
      success: true,
      messages: newMessages,
      leadData: session.leadData,
      sessionInfo: {
        id: session.id,
        currentFlow: session.currentFlow,
        qualificationScore: leadData.qualificationScore,
        readyForQuote: leadData.readyForQuote,
        needsHandoff: leadData.qualificationScore >= 70
      }
    });

  } catch (error) {
    console.error('Chatbot API error:', error);
    
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
 * Get chatbot session information
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = chatbotEngine.getSession(sessionId);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        messages: session.messages,
        leadData: session.leadData,
        currentFlow: session.currentFlow,
        isActive: session.isActive,
        startedAt: session.startedAt,
        lastActivity: session.lastActivity
      }
    });

  } catch (error) {
    console.error('Chatbot session API error:', error);
    
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
 * Create new chatbot session
 */
export async function PUT(request: NextRequest) {
  try {
    const session = chatbotEngine.createSession();
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        messages: session.messages,
        leadData: session.leadData,
        currentFlow: session.currentFlow
      }
    });

  } catch (error) {
    console.error('Chatbot session creation error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to create session',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}