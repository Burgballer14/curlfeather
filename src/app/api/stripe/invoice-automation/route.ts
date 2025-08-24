import { NextRequest, NextResponse } from 'next/server';
import { stripeInvoiceAutomationService } from '@/lib/services/stripe-invoice-automation';

/**
 * POST /api/stripe/invoice-automation
 * Trigger automated Stripe invoice creation and project milestone management
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, milestoneId, paymentData, completionNotes } = body;

    if (!action || !projectId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: action or projectId' 
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'complete_milestone':
        if (!milestoneId) {
          return NextResponse.json(
            { success: false, error: 'milestoneId is required for complete_milestone action' },
            { status: 400 }
          );
        }
        result = await stripeInvoiceAutomationService.completeMilestone(
          projectId, 
          milestoneId, 
          completionNotes
        );
        break;

      case 'create_invoice':
        if (!milestoneId) {
          return NextResponse.json(
            { success: false, error: 'milestoneId is required for create_invoice action' },
            { status: 400 }
          );
        }
        result = await stripeInvoiceAutomationService.createMilestoneInvoice(
          projectId, 
          milestoneId,
          body.customDueDate
        );
        break;

      case 'record_payment':
        if (!milestoneId || !paymentData) {
          return NextResponse.json(
            { success: false, error: 'milestoneId and paymentData are required for record_payment action' },
            { status: 400 }
          );
        }
        result = await stripeInvoiceAutomationService.recordPayment(
          projectId, 
          milestoneId, 
          paymentData
        );
        break;

      case 'sync_payments':
        result = await stripeInvoiceAutomationService.syncPaymentStatus(projectId);
        break;

      case 'financial_report':
        const reportResult = await stripeInvoiceAutomationService.getProjectFinancialReport(projectId);
        return NextResponse.json(reportResult);

      case 'get_invoices':
        const invoicesResult = await stripeInvoiceAutomationService.getProjectInvoices(projectId);
        return NextResponse.json(invoicesResult);

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Stripe invoice automation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/stripe/invoice-automation?projectId=xxx&action=xxx
 * Get project financial status, invoices, and milestone information
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const action = searchParams.get('action') || 'financial_report';

    if (!projectId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Project ID is required' 
        },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'financial_report':
        result = await stripeInvoiceAutomationService.getProjectFinancialReport(projectId);
        break;

      case 'invoices':
        result = await stripeInvoiceAutomationService.getProjectInvoices(projectId);
        break;

      case 'sync_status':
        result = await stripeInvoiceAutomationService.syncPaymentStatus(projectId);
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
    
    return NextResponse.json(result);

  } catch (error) {
    console.error('Stripe invoice automation GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}