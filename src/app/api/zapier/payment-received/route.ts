/**
 * Zapier Webhook - Payment Received
 * Receives payment confirmation from FreshBooks via Zapier and updates milestone status
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth/auth-client';

export async function POST(req: NextRequest) {
  try {
    const paymentData = await req.json();

    // Extract payment information from Zapier/FreshBooks webhook
    const {
      invoice_id,
      invoice_number,
      payment_amount,
      payment_date,
      payment_method,
      customer_email,
      customer_name,
      project_name,
      milestone_title,
      milestone_id, // May be included if we track it
      freshbooks_invoice_id
    } = paymentData;

    console.log('Payment received webhook:', paymentData);

    // Find the milestone by FreshBooks invoice ID or other identifiers
    let milestone;
    
    if (milestone_id) {
      // Direct milestone ID provided
      const { data } = await supabase
        .from('project_milestones')
        .select('*, project:projects!inner(*, customer:customers!inner(*))')
        .eq('id', milestone_id)
        .single();
      milestone = data;
    } else if (freshbooks_invoice_id) {
      // Find by FreshBooks invoice ID
      const { data } = await supabase
        .from('project_milestones')
        .select('*, project:projects!inner(*, customer:customers!inner(*))')
        .eq('freshbooks_invoice_id', freshbooks_invoice_id)
        .single();
      milestone = data;
    } else {
      // Find by customer email and project/milestone names
      const { data } = await supabase
        .from('project_milestones')
        .select('*, project:projects!inner(*, customer:customers!inner(*))')
        .eq('title', milestone_title)
        .eq('projects.name', project_name)
        .eq('customers.email', customer_email)
        .single();
      milestone = data;
    }

    if (!milestone) {
      // Log the payment but don't fail
      await supabase
        .from('communication_logs')
        .insert({
          type: 'webhook',
          direction: 'inbound',
          content: `Payment received but milestone not found: ${JSON.stringify(paymentData)}`,
          metadata: paymentData
        });

      return NextResponse.json({
        warning: 'Payment received but milestone not found',
        payment_data: paymentData
      });
    }

    // Update milestone status to 'paid'
    const { error: updateError } = await supabase
      .from('project_milestones')
      .update({ 
        status: 'paid',
        updated_at: new Date().toISOString()
      })
      .eq('id', milestone.id);

    if (updateError) {
      throw new Error(`Failed to update milestone: ${updateError.message}`);
    }

    // Create or update invoice record
    const { error: invoiceError } = await supabase
      .from('invoices')
      .upsert({
        project_id: milestone.project_id,
        milestone_id: milestone.id,
        freshbooks_invoice_id: freshbooks_invoice_id || invoice_id,
        invoice_number: invoice_number,
        amount: payment_amount,
        status: 'sent',
        payment_status: 'paid',
        paid_date: payment_date,
        updated_at: new Date().toISOString()
      });

    if (invoiceError) {
      console.error('Error updating invoice:', invoiceError);
    }

    // Log the payment confirmation
    await supabase
      .from('communication_logs')
      .insert({
        customer_id: milestone.project.customer.id,
        type: 'webhook',
        direction: 'inbound',
        content: `Payment received for ${milestone.title}: $${payment_amount}`,
        metadata: {
          payment_amount,
          payment_date,
          payment_method,
          invoice_number,
          milestone_id: milestone.id,
          freshbooks_invoice_id
        }
      });

    // Send payment confirmation email to customer
    try {
      const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/communications/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: milestone.project.customer.email,
          template: 'payment_confirmation',
          data: {
            customer_name: milestone.project.customer.name,
            project_name: milestone.project.name,
            milestone_title: milestone.title,
            payment_amount: payment_amount,
            payment_date: payment_date,
            invoice_number: invoice_number
          }
        })
      });

      if (!emailResponse.ok) {
        console.error('Failed to send payment confirmation email');
      }
    } catch (emailError) {
      console.error('Email sending error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Payment processed and milestone updated',
      milestone: {
        id: milestone.id,
        title: milestone.title,
        project_name: milestone.project.name,
        customer_name: milestone.project.customer.name,
        status: 'paid'
      },
      payment: {
        amount: payment_amount,
        date: payment_date,
        method: payment_method,
        invoice_number: invoice_number
      }
    });

  } catch (error) {
    console.error('Payment webhook error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process payment webhook',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing and documentation
export async function GET() {
  return NextResponse.json({
    endpoint: 'Zapier Payment Received Webhook',
    description: 'Receives payment confirmations from FreshBooks via Zapier',
    method: 'POST',
    payload_example: {
      invoice_id: 'fb_invoice_id',
      invoice_number: 'INV-001',
      payment_amount: 2500.00,
      payment_date: '2025-01-23',
      payment_method: 'Credit Card',
      customer_email: 'customer@example.com',
      customer_name: 'John Doe',
      project_name: 'Main Floor Drywall',
      milestone_title: 'Drywall Installation',
      milestone_id: 'uuid-string', // Optional
      freshbooks_invoice_id: 'fb_invoice_id'
    },
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/zapier/payment-received`
  });
}