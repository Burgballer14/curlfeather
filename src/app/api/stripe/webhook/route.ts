import { NextRequest, NextResponse } from 'next/server';
import { stripeClient, stripe } from '@/lib/payments/stripe-client';
import { stripeInvoiceAutomationService } from '@/lib/services/stripe-invoice-automation';
import { emailAutomationService } from '@/lib/communications/email-automation';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events for payment confirmations and updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Stripe webhook secret not configured');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const webhookResult = await stripeClient.handleWebhook(body, signature, webhookSecret);
    
    if (!webhookResult.success) {
      console.error('Webhook verification failed:', webhookResult.error);
      return NextResponse.json(
        { error: 'Webhook verification failed' },
        { status: 400 }
      );
    }

    const event = webhookResult.event!;

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event);
        break;
      
      case 'payment_method.attached':
        await handlePaymentMethodAttached(event);
        break;
      
      case 'customer.created':
        await handleCustomerCreated(event);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event);
        break;
      
      case 'invoice.finalized':
        await handleInvoiceFinalized(event);
        break;
      
      case 'invoice.sent':
        await handleInvoiceSent(event);
        break;
      
      case 'invoice.voided':
        await handleInvoiceVoided(event);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSucceeded(event: any) {
  try {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    console.log(`Payment succeeded: ${paymentIntent.id}`);
    console.log('Metadata:', metadata);

    if (metadata.project_id && metadata.milestone_id) {
      // Record payment in Stripe invoice automation system
      const paymentData = {
        stripePaymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount_received / 100, // Convert from cents
        date: new Date().toISOString(),
        note: `Stripe payment: ${paymentIntent.id}`,
      };

      const result = await stripeInvoiceAutomationService.recordPayment(
        metadata.project_id,
        metadata.milestone_id,
        paymentData
      );

      if (result.success) {
        console.log(`Payment recorded successfully for project ${metadata.project_id}`);
        
        // Send payment confirmation email
        try {
          await emailAutomationService.sendPaymentConfirmation({
            customerName: metadata.customer_name || 'Customer',
            customerEmail: metadata.customer_email,
            projectName: `Project ${metadata.project_id}`,
            invoiceNumber: metadata.invoice_id || paymentIntent.id,
            amountPaid: paymentIntent.amount_received / 100,
            paymentMethod: 'Credit Card',
            transactionId: paymentIntent.id,
            paymentDate: new Date().toISOString(),
          });
        } catch (emailError) {
          console.error('Failed to send payment confirmation email:', emailError);
        }
      } else {
        console.error(`Failed to record payment: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('Error handling payment succeeded:', error);
  }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(event: any) {
  try {
    const paymentIntent = event.data.object;
    const metadata = paymentIntent.metadata;

    console.log(`Payment failed: ${paymentIntent.id}`);
    console.log('Last payment error:', paymentIntent.last_payment_error);

    // TODO: Send payment failure notification to customer
    // TODO: Log payment failure for admin review
    // TODO: Update project status if necessary

  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
}

/**
 * Handle payment method attached to customer
 */
async function handlePaymentMethodAttached(event: any) {
  try {
    const paymentMethod = event.data.object;
    
    console.log(`Payment method attached: ${paymentMethod.id} to customer: ${paymentMethod.customer}`);

    // TODO: Update customer payment method preferences
    // TODO: Store payment method details for future use

  } catch (error) {
    console.error('Error handling payment method attached:', error);
  }
}

/**
 * Handle new customer creation
 */
async function handleCustomerCreated(event: any) {
  try {
    const customer = event.data.object;
    
    console.log(`New customer created: ${customer.id} (${customer.email})`);

    // TODO: Sync customer data with internal database
    // TODO: Send welcome email if appropriate

  } catch (error) {
    console.error('Error handling customer created:', error);
  }
}

/**
 * Handle invoice payment succeeded
 */
async function handleInvoicePaymentSucceeded(event: any) {
  try {
    const invoice = event.data.object;
    const metadata = invoice.metadata;
    
    console.log(`Invoice payment succeeded: ${invoice.id}`);
    console.log('Invoice metadata:', metadata);

    if (metadata.project_id && metadata.milestone_id) {
      // Update milestone status to paid
      const paymentData = {
        stripePaymentIntentId: invoice.payment_intent,
        amount: invoice.amount_paid / 100, // Convert from cents
        date: new Date().toISOString(),
        note: `Invoice payment: ${invoice.id}`,
      };

      const result = await stripeInvoiceAutomationService.recordPayment(
        metadata.project_id,
        metadata.milestone_id,
        paymentData
      );

      if (result.success) {
        console.log(`Invoice payment recorded successfully for project ${metadata.project_id}`);
        
        // Send payment confirmation email
        try {
          await emailAutomationService.sendPaymentConfirmation({
            customerName: metadata.customer_name || 'Customer',
            customerEmail: metadata.customer_email,
            projectName: `Project ${metadata.project_id}`,
            invoiceNumber: invoice.number || invoice.id,
            amountPaid: invoice.amount_paid / 100,
            paymentMethod: 'Credit Card',
            transactionId: invoice.payment_intent || invoice.id,
            paymentDate: new Date().toISOString(),
          });
        } catch (emailError) {
          console.error('Failed to send invoice payment confirmation email:', emailError);
        }
      } else {
        console.error(`Failed to record invoice payment: ${result.error}`);
      }
    }

  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

/**
 * Handle invoice payment failed
 */
async function handleInvoicePaymentFailed(event: any) {
  try {
    const invoice = event.data.object;
    const metadata = invoice.metadata;
    
    console.log(`Invoice payment failed: ${invoice.id}`);
    console.log('Payment failure reason:', invoice.last_finalization_error);

    if (metadata.customer_email) {
      // Send payment failure notification
      try {
        await emailAutomationService.sendCustomNotification({
          customerName: metadata.customer_name || 'Customer',
          customerEmail: metadata.customer_email,
          subject: 'Invoice Payment Failed - Curl Feather Roofing',
          message: `We were unable to process payment for invoice ${invoice.number || invoice.id}. Please review your payment method and try again.`,
          projectName: `Project ${metadata.project_id}`,
          actionUrl: invoice.hosted_invoice_url,
          actionText: 'Pay Invoice Now'
        });
      } catch (emailError) {
        console.error('Failed to send payment failure email:', emailError);
      }
    }

  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

/**
 * Handle invoice finalized (ready for payment)
 */
async function handleInvoiceFinalized(event: any) {
  try {
    const invoice = event.data.object;
    const metadata = invoice.metadata;
    
    console.log(`Invoice finalized: ${invoice.id}`);

    // Invoice is now ready for payment
    // The invoice will be automatically sent by Stripe based on collection_method

  } catch (error) {
    console.error('Error handling invoice finalized:', error);
  }
}

/**
 * Handle invoice sent to customer
 */
async function handleInvoiceSent(event: any) {
  try {
    const invoice = event.data.object;
    const metadata = invoice.metadata;
    
    console.log(`Invoice sent: ${invoice.id}`);

    if (metadata.customer_email) {
      // Send additional notification or log the event
      console.log(`Invoice ${invoice.number} sent to ${metadata.customer_email}`);
    }

  } catch (error) {
    console.error('Error handling invoice sent:', error);
  }
}

/**
 * Handle invoice voided
 */
async function handleInvoiceVoided(event: any) {
  try {
    const invoice = event.data.object;
    const metadata = invoice.metadata;
    
    console.log(`Invoice voided: ${invoice.id}`);

    if (metadata.project_id && metadata.milestone_id) {
      // Update milestone status back to completed or appropriate status
      // This would need to be implemented based on business logic
      console.log(`Invoice voided for project ${metadata.project_id}, milestone ${metadata.milestone_id}`);
    }

  } catch (error) {
    console.error('Error handling invoice voided:', error);
  }
}

// Only allow POST requests
export const GET = () => {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
};