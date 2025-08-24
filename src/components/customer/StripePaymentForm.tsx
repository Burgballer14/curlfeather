'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { 
  CreditCardIcon,
  LockClosedIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Load Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface PaymentFormProps {
  invoiceId: string;
  amount: number;
  description: string;
  projectId: string;
  milestoneId: string;
  customerEmail: string;
  customerName: string;
  onPaymentSuccess?: (paymentIntentId: string) => void;
  onPaymentError?: (error: string) => void;
}

interface PaymentFormInnerProps extends PaymentFormProps {
  clientSecret?: string;
}

const PaymentFormInner: React.FC<PaymentFormInnerProps> = ({
  invoiceId,
  amount,
  description,
  projectId,
  milestoneId,
  customerEmail,
  customerName,
  clientSecret,
  onPaymentSuccess,
  onPaymentError
}) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const [processing, setProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [paymentIntentId, setPaymentIntentId] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      setErrorMessage('Payment system not ready. Please try again.');
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Card element not found. Please refresh and try again.');
      return;
    }

    setProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerName,
            email: customerEmail,
          },
        },
      });

      if (error) {
        setPaymentStatus('failed');
        setErrorMessage(error.message || 'Payment failed. Please try again.');
        onPaymentError?.(error.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        setPaymentIntentId(paymentIntent.id);
        onPaymentSuccess?.(paymentIntent.id);
      } else {
        setPaymentStatus('failed');
        setErrorMessage('Payment was not completed. Please try again.');
        onPaymentError?.('Payment not completed');
      }
    } catch (err) {
      setPaymentStatus('failed');
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setErrorMessage(errorMsg);
      onPaymentError?.(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  const formatAmount = (cents: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(cents / 100);
  };

  if (paymentStatus === 'succeeded') {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Successful!</h3>
          <p className="text-gray-600 mb-4">
            Your payment of {formatAmount(amount)} has been processed successfully.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
            <div className="space-y-1">
              <div>Payment ID: {paymentIntentId}</div>
              <div>Amount: {formatAmount(amount)}</div>
              <div>Date: {new Date().toLocaleDateString()}</div>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            A receipt has been sent to your email address.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Secure Payment</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Invoice:</span>
            <span className="text-sm font-medium">#{invoiceId}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Description:</span>
            <span className="text-sm font-medium">{description}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount:</span>
            <span className="text-lg font-bold text-blue-600">{formatAmount(amount)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Card Information
          </label>
          <div className="border rounded-lg p-3 bg-gray-50">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
                hidePostalCode: false,
              }}
            />
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <LockClosedIcon className="h-5 w-5 text-blue-600" />
            <span className="text-blue-800 font-medium text-sm">Secure Payment</span>
          </div>
          <p className="text-blue-700 text-sm">
            Your payment information is encrypted and processed securely through Stripe. 
            We never store your card details on our servers.
          </p>
        </div>

        <button
          type="submit"
          disabled={!stripe || processing || !clientSecret}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {processing ? (
            <>
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              <span>Processing Payment...</span>
            </>
          ) : (
            <>
              <CreditCardIcon className="h-5 w-5" />
              <span>Pay {formatAmount(amount)}</span>
            </>
          )}
        </button>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            By clicking "Pay", you agree to our terms of service and privacy policy.
          </p>
        </div>
      </form>
    </div>
  );
};

const StripePaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    createPaymentIntent();
  }, []);

  const createPaymentIntent = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: props.amount,
          currency: 'usd',
          customerEmail: props.customerEmail,
          customerName: props.customerName,
          invoiceId: props.invoiceId,
          projectId: props.projectId,
          milestoneId: props.milestoneId,
          description: props.description,
          metadata: {
            invoice_id: props.invoiceId,
            project_id: props.projectId,
            milestone_id: props.milestoneId,
          }
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setClientSecret(result.clientSecret);
      } else {
        setError(result.error || 'Failed to create payment intent');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Setup Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={createPaymentIntent}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const stripeOptions = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentFormInner {...props} clientSecret={clientSecret} />
    </Elements>
  );
};

export default StripePaymentForm;