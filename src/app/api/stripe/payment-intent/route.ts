import { NextRequest, NextResponse } from 'next/server';
import { stripeClient, PaymentIntentData } from '@/lib/payments/stripe-client';

/**
 * POST /api/stripe/payment-intent
 * Create a new payment intent for invoice payment
 */
export async function POST(request: NextRequest) {
  try {
    const paymentData: PaymentIntentData = await request.json();
    
    // Validate required fields
    if (!paymentData.amount || !paymentData.customerEmail || !paymentData.projectId || !paymentData.milestoneId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: amount, customerEmail, projectId, or milestoneId' 
        },
        { status: 400 }
      );
    }

    // Ensure amount is in cents
    if (paymentData.amount < 50) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment amount must be at least $0.50' 
        },
        { status: 400 }
      );
    }

    // Create payment intent
    const result = await stripeClient.createPaymentIntent(paymentData);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to create payment intent' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      clientSecret: result.clientSecret,
      paymentIntentId: result.paymentIntent?.id
    });

  } catch (error) {
    console.error('Payment intent creation error:', error);
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
 * GET /api/stripe/payment-intent?payment_intent_id=xxx
 * Retrieve payment intent status
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const paymentIntentId = searchParams.get('payment_intent_id');

    if (!paymentIntentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Payment intent ID is required' 
        },
        { status: 400 }
      );
    }

    // Get payment intent
    const result = await stripeClient.getPaymentIntent(paymentIntentId);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to retrieve payment intent' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      paymentIntent: result.paymentIntent
    });

  } catch (error) {
    console.error('Payment intent retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}