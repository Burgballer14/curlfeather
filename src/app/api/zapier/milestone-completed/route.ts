/**
 * Zapier Webhook - Milestone Completed
 * Sends milestone data to Zapier when a milestone is completed for FreshBooks invoice creation
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth/auth-client';

export async function POST(req: NextRequest) {
  try {
    const { milestoneId, projectId } = await req.json();

    // Get milestone and project data
    const { data: milestone, error: milestoneError } = await supabase
      .from('project_milestones')
      .select(`
        *,
        project:projects!inner(
          *,
          customer:customers!inner(*)
        )
      `)
      .eq('id', milestoneId)
      .single();

    if (milestoneError || !milestone) {
      return NextResponse.json(
        { error: 'Milestone not found' },
        { status: 404 }
      );
    }

    // Prepare webhook payload for Zapier → FreshBooks
    const webhookPayload = {
      // Milestone Information
      milestone_id: milestone.id,
      milestone_title: milestone.title,
      milestone_description: milestone.description,
      milestone_amount: milestone.amount,
      milestone_due_date: milestone.due_date,
      milestone_completed_date: milestone.completed_date,
      
      // Project Information
      project_id: milestone.project.id,
      project_name: milestone.project.name,
      project_description: milestone.project.description,
      
      // Customer Information for FreshBooks Client
      customer_name: milestone.project.customer.name,
      customer_email: milestone.project.customer.email,
      customer_phone: milestone.project.customer.phone,
      customer_address: milestone.project.customer.address,
      
      // Invoice Line Items
      line_items: milestone.line_items || [
        {
          description: `${milestone.project.name} - ${milestone.title}`,
          quantity: 1,
          unit_price: milestone.amount,
          amount: milestone.amount
        }
      ],
      
      // Invoice Details
      invoice_description: `${milestone.project.name} - ${milestone.title}`,
      invoice_amount: milestone.amount,
      invoice_due_date: milestone.due_date,
      
      // Metadata
      created_at: new Date().toISOString(),
      platform_source: 'curlfeather_autonomous_platform'
    };

    // Send to Zapier webhook
    const zapierWebhookUrl = process.env.ZAPIER_FRESHBOOKS_WEBHOOK_URL;
    
    if (!zapierWebhookUrl) {
      return NextResponse.json(
        { error: 'Zapier webhook URL not configured' },
        { status: 500 }
      );
    }

    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookPayload),
    });

    if (!zapierResponse.ok) {
      throw new Error(`Zapier webhook failed: ${zapierResponse.statusText}`);
    }

    // Update milestone status to 'invoiced'
    const { error: updateError } = await supabase
      .from('project_milestones')
      .update({ 
        status: 'invoiced',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestoneId);

    if (updateError) {
      console.error('Error updating milestone status:', updateError);
    }

    // Log the webhook call
    await supabase
      .from('communication_logs')
      .insert({
        customer_id: milestone.project.customer.id,
        type: 'webhook',
        direction: 'outbound',
        content: `Milestone completion sent to FreshBooks via Zapier: ${milestone.title}`,
        metadata: {
          milestone_id: milestoneId,
          zapier_webhook_url: zapierWebhookUrl,
          webhook_payload: webhookPayload
        }
      });

    return NextResponse.json({
      success: true,
      message: 'Milestone data sent to Zapier for FreshBooks invoice creation',
      milestone_id: milestoneId,
      project_name: milestone.project.name,
      milestone_title: milestone.title,
      invoice_amount: milestone.amount
    });

  } catch (error) {
    console.error('Zapier milestone webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send milestone data to Zapier',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing webhook functionality
export async function GET() {
  return NextResponse.json({
    endpoint: 'Zapier Milestone Completed Webhook',
    description: 'Sends milestone completion data to Zapier for FreshBooks invoice creation',
    method: 'POST',
    payload_example: {
      milestoneId: 'uuid-string',
      projectId: 'uuid-string'
    },
    environment_variables_required: [
      'ZAPIER_FRESHBOOKS_WEBHOOK_URL'
    ]
  });
}