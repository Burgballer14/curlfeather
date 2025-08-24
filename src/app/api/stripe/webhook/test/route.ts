import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/lib/payments/stripe-client';
import { stripeInvoiceAutomationService } from '@/lib/services/stripe-invoice-automation';

/**
 * GET /api/stripe/webhook/test
 * Test webhook configuration and connectivity
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const testType = searchParams.get('type') || 'basic';

    switch (testType) {
      case 'basic':
        return await testBasicConfiguration();
      
      case 'invoice':
        return await testInvoiceCreation();
      
      case 'payment':
        return await testPaymentIntent();
      
      case 'automation':
        return await testAutomationService();
      
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown test type. Available: basic, invoice, payment, automation'
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Webhook test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Test basic Stripe configuration
 */
async function testBasicConfiguration() {
  const results: Record<string, any> = {
    environment: process.env.NODE_ENV,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ? 'Set ✅' : 'Missing ❌',
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ? 'Set ✅' : 'Missing ❌',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'Set ✅' : 'Missing ❌',
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set ⚠️',
    timestamp: new Date().toISOString()
  };

  // Test Stripe client connectivity
  try {
    const customerResult = await stripeClient.createOrGetCustomer({
      email: 'test@curlfeather.com',
      name: 'Test Customer'
    });
    
    results.stripeConnectivity = customerResult.success ? 'Connected ✅' : `Failed: ${customerResult.error} ❌`;
  } catch (error) {
    results.stripeConnectivity = `Error: ${error instanceof Error ? error.message : 'Unknown'} ❌`;
  }

  return NextResponse.json({
    success: true,
    testType: 'basic',
    results
  });
}

/**
 * Test invoice creation functionality
 */
async function testInvoiceCreation() {
  try {
    // Create test customer
    const customerResult = await stripeClient.createOrGetCustomer({
      email: 'test-invoice@curlfeather.com',
      name: 'Test Invoice Customer'
    });

    if (!customerResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to create customer: ${customerResult.error}`
      });
    }

    // Create test invoice
    const invoiceResult = await stripeClient.createInvoice({
      customerId: customerResult.customer!.id,
      customerEmail: 'test-invoice@curlfeather.com',
      customerName: 'Test Invoice Customer',
      projectId: 'test-project-123',
      milestoneId: 'test-milestone-456',
      milestone: 'Test Milestone',
      description: 'Test Invoice - Webhook Configuration Verification',
      lineItems: [
        {
          description: 'Test Service',
          quantity: 1,
          unitPrice: 10000, // $100.00
          category: 'labor'
        }
      ],
      notes: 'This is a test invoice created during webhook configuration testing.',
      metadata: {
        test: 'true',
        webhook_test: 'invoice_creation',
        created_at: new Date().toISOString()
      }
    });

    if (!invoiceResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to create invoice: ${invoiceResult.error}`
      });
    }

    return NextResponse.json({
      success: true,
      testType: 'invoice',
      results: {
        customerId: customerResult.customer!.id,
        invoiceId: invoiceResult.invoice!.id,
        invoiceNumber: invoiceResult.invoice!.number,
        hostedUrl: invoiceResult.invoice!.hosted_invoice_url,
        amount: invoiceResult.invoice!.amount_due,
        status: invoiceResult.invoice!.status,
        message: 'Test invoice created successfully ✅'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during invoice test'
    });
  }
}

/**
 * Test payment intent creation
 */
async function testPaymentIntent() {
  try {
    const paymentResult = await stripeClient.createPaymentIntent({
      amount: 5000, // $50.00
      currency: 'usd',
      customerEmail: 'test-payment@curlfeather.com',
      customerName: 'Test Payment Customer',
      projectId: 'test-project-789',
      milestoneId: 'test-milestone-101',
      description: 'Test Payment Intent - Webhook Configuration',
      metadata: {
        test: 'true',
        webhook_test: 'payment_intent',
        created_at: new Date().toISOString()
      }
    });

    if (!paymentResult.success) {
      return NextResponse.json({
        success: false,
        error: `Failed to create payment intent: ${paymentResult.error}`
      });
    }

    return NextResponse.json({
      success: true,
      testType: 'payment',
      results: {
        paymentIntentId: paymentResult.paymentIntent!.id,
        clientSecret: paymentResult.clientSecret,
        amount: paymentResult.paymentIntent!.amount,
        status: paymentResult.paymentIntent!.status,
        customer: paymentResult.paymentIntent!.customer,
        message: 'Test payment intent created successfully ✅'
      }
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during payment test'
    });
  }
}

/**
 * Test automation service functionality
 */
async function testAutomationService() {
  try {
    // This would typically require a real project in the database
    // For testing, we'll just verify the service is accessible
    const testResult = {
      serviceLoaded: !!stripeInvoiceAutomationService,
      timestamp: new Date().toISOString(),
      message: 'Stripe invoice automation service loaded successfully ✅'
    };

    return NextResponse.json({
      success: true,
      testType: 'automation',
      results: testResult
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during automation test'
    });
  }
}

/**
 * POST /api/stripe/webhook/test
 * Simulate webhook events for testing
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, testData } = body;

    if (!eventType) {
      return NextResponse.json({
        success: false,
        error: 'Event type is required'
      }, { status: 400 });
    }

    // Simulate processing different webhook events
    const simulationResult = {
      eventType,
      processed: true,
      timestamp: new Date().toISOString(),
      testData: testData || null,
      message: `Simulated processing of ${eventType} event ✅`
    };

    // Log the simulation for verification
    console.log('Webhook simulation:', simulationResult);

    return NextResponse.json({
      success: true,
      simulation: simulationResult
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during webhook simulation'
    }, { status: 500 });
  }
}