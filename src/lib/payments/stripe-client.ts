/**
 * Stripe Payment Processing Client
 * Handles secure payment processing, payment intents, and webhook management
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-07-30.basil',
});

export interface PaymentIntentData {
  amount: number; // amount in cents
  currency: string;
  customerId?: string;
  customerEmail: string;
  customerName: string;
  invoiceId?: string;
  projectId: string;
  milestoneId: string;
  description: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

export interface PaymentMethodData {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

export interface PaymentResult {
  success: boolean;
  paymentIntent?: Stripe.PaymentIntent;
  clientSecret?: string;
  error?: string;
  requiresAction?: boolean;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number; // in cents
  category: 'labor' | 'materials' | 'equipment' | 'permit' | 'other';
}

export interface InvoiceData {
  customerId: string;
  customerEmail: string;
  customerName: string;
  projectId: string;
  milestoneId: string;
  milestone: string;
  description: string;
  lineItems: InvoiceLineItem[];
  dueDate?: string; // ISO date string
  notes?: string;
  metadata?: Record<string, string>;
}

export interface StripeInvoice {
  id: string;
  number: string;
  status: string;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string;
  customer: string;
  due_date?: number;
  created: number;
  hosted_invoice_url?: string;
  invoice_pdf?: string;
  payment_intent?: string;
  metadata?: Record<string, string>;
}

export interface InvoiceResult {
  success: boolean;
  invoice?: StripeInvoice;
  error?: string;
  message?: string;
}

class StripePaymentClient {
  /**
   * Create or retrieve a Stripe customer
   */
  async createOrGetCustomer(customerData: {
    email: string;
    name?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  }): Promise<{ success: boolean; customer?: StripeCustomer; error?: string }> {
    try {
      // First, try to find existing customer by email
      const existingCustomers = await stripe.customers.list({
        email: customerData.email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        return {
          success: true,
          customer: {
            id: customer.id,
            email: customer.email || customerData.email,
            name: customer.name || customerData.name,
            phone: customer.phone || customerData.phone,
            address: customer.address ? {
              line1: customer.address.line1 || undefined,
              line2: customer.address.line2 || undefined,
              city: customer.address.city || undefined,
              state: customer.address.state || undefined,
              postal_code: customer.address.postal_code || undefined,
              country: customer.address.country || undefined,
            } : customerData.address,
          }
        };
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        address: customerData.address,
        metadata: {
          source: 'curlfeather_platform',
          created_at: new Date().toISOString(),
        },
      });

      return {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email || customerData.email,
          name: customer.name || customerData.name,
          phone: customer.phone || customerData.phone,
          address: customer.address ? {
            line1: customer.address.line1 || undefined,
            line2: customer.address.line2 || undefined,
            city: customer.address.city || undefined,
            state: customer.address.state || undefined,
            postal_code: customer.address.postal_code || undefined,
            country: customer.address.country || undefined,
          } : customerData.address,
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating customer'
      };
    }
  }

  /**
   * Create a payment intent for invoice payment
   */
  async createPaymentIntent(paymentData: PaymentIntentData): Promise<PaymentResult> {
    try {
      // Ensure we have a Stripe customer
      const customerResult = await this.createOrGetCustomer({
        email: paymentData.customerEmail,
        name: paymentData.customerName,
      });

      if (!customerResult.success) {
        return { success: false, error: customerResult.error };
      }

      const customer = customerResult.customer!;

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: paymentData.amount,
        currency: paymentData.currency || 'usd',
        customer: customer.id,
        description: paymentData.description,
        metadata: {
          project_id: paymentData.projectId,
          milestone_id: paymentData.milestoneId,
          invoice_id: paymentData.invoiceId || '',
          customer_email: paymentData.customerEmail,
          customer_name: paymentData.customerName,
          payment_type: 'milestone_payment',
          ...paymentData.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
        receipt_email: paymentData.customerEmail,
      });

      return {
        success: true,
        paymentIntent,
        clientSecret: paymentIntent.client_secret || undefined,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating payment intent'
      };
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPaymentIntent(
    paymentIntentId: string,
    paymentMethodId: string
  ): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/confirm`,
      });

      return {
        success: true,
        paymentIntent,
        requiresAction: paymentIntent.status === 'requires_action',
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error confirming payment'
      };
    }
  }

  /**
   * Retrieve payment intent
   */
  async getPaymentIntent(paymentIntentId: string): Promise<PaymentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        paymentIntent,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving payment intent'
      };
    }
  }

  /**
   * Get customer's payment methods
   */
  async getCustomerPaymentMethods(customerId: string): Promise<{
    success: boolean;
    paymentMethods?: PaymentMethodData[];
    error?: string;
  }> {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      const formattedMethods: PaymentMethodData[] = paymentMethods.data.map((pm: any) => ({
        id: pm.id,
        type: pm.type,
        card: pm.card ? {
          brand: pm.card.brand,
          last4: pm.card.last4,
          exp_month: pm.card.exp_month,
          exp_year: pm.card.exp_year,
        } : undefined,
      }));

      return {
        success: true,
        paymentMethods: formattedMethods,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving payment methods'
      };
    }
  }

  /**
   * Create setup intent for saving payment method
   */
  async createSetupIntent(customerId: string): Promise<{
    success: boolean;
    setupIntent?: Stripe.SetupIntent;
    clientSecret?: string;
    error?: string;
  }> {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
        usage: 'off_session',
      });

      return {
        success: true,
        setupIntent,
        clientSecret: setupIntent.client_secret || undefined,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating setup intent'
      };
    }
  }

  /**
   * Process refund for a payment
   */
  async processRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<{
    success: boolean;
    refund?: Stripe.Refund;
    error?: string;
  }> {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount,
        reason: reason as Stripe.RefundCreateParams.Reason || undefined,
        metadata: {
          refund_date: new Date().toISOString(),
          processed_by: 'curlfeather_platform',
        },
      });

      return {
        success: true,
        refund,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing refund'
      };
    }
  }

  /**
   * Get payment history for a customer
   */
  async getCustomerPayments(customerId: string): Promise<{
    success: boolean;
    payments?: Array<{
      id: string;
      amount: number;
      currency: string;
      status: string;
      created: number;
      description?: string;
      metadata?: Record<string, string>;
    }>;
    error?: string;
  }> {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        customer: customerId,
        limit: 100,
      });

      const payments = paymentIntents.data.map((pi: any) => ({
        id: pi.id,
        amount: pi.amount,
        currency: pi.currency,
        status: pi.status,
        created: pi.created,
        description: pi.description || undefined,
        metadata: pi.metadata,
      }));

      return {
        success: true,
        payments,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving customer payments'
      };
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhook(
    payload: string | Buffer,
    signature: string,
    endpointSecret: string
  ): Promise<{
    success: boolean;
    event?: Stripe.Event;
    error?: string;
  }> {
    try {
      const event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);

      return {
        success: true,
        event,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook signature verification failed'
      };
    }
  }

  /**
   * Get payment analytics for dashboard
   */
  async getPaymentAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    success: boolean;
    analytics?: {
      totalAmount: number;
      totalPayments: number;
      successfulPayments: number;
      failedPayments: number;
      averagePaymentAmount: number;
      paymentsByDay: Array<{
        date: string;
        amount: number;
        count: number;
      }>;
    };
    error?: string;
  }> {
    try {
      const paymentIntents = await stripe.paymentIntents.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });

      const totalPayments = paymentIntents.data.length;
      const successfulPayments = paymentIntents.data.filter((pi: any) => pi.status === 'succeeded').length;
      const failedPayments = paymentIntents.data.filter((pi: any) => pi.status === 'payment_failed').length;
      const totalAmount = paymentIntents.data.reduce((sum: number, pi: any) => sum + (pi.status === 'succeeded' ? pi.amount : 0), 0);
      const averagePaymentAmount = successfulPayments > 0 ? totalAmount / successfulPayments : 0;

      // Group payments by day
      const paymentsByDay: { [key: string]: { amount: number; count: number } } = {};
      
      paymentIntents.data.forEach((pi: any) => {
        if (pi.status === 'succeeded') {
          const date = new Date(pi.created * 1000).toISOString().split('T')[0];
          if (!paymentsByDay[date]) {
            paymentsByDay[date] = { amount: 0, count: 0 };
          }
          paymentsByDay[date].amount += pi.amount;
          paymentsByDay[date].count += 1;
        }
      });

      const paymentsByDayArray = Object.entries(paymentsByDay).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
      }));

      return {
        success: true,
        analytics: {
          totalAmount,
          totalPayments,
          successfulPayments,
          failedPayments,
          averagePaymentAmount,
          paymentsByDay: paymentsByDayArray,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving payment analytics'
      };
    }
  }

  /**
   * Create a Stripe invoice for a project milestone
   */
  async createInvoice(invoiceData: InvoiceData): Promise<InvoiceResult> {
    try {
      // Ensure customer exists
      const customerResult = await this.createOrGetCustomer({
        email: invoiceData.customerEmail,
        name: invoiceData.customerName,
      });

      if (!customerResult.success) {
        return { success: false, error: customerResult.error };
      }

      const customer = customerResult.customer!;

      // Create invoice items first
      const invoiceItems = [];
      for (const lineItem of invoiceData.lineItems) {
        const invoiceItem = await stripe.invoiceItems.create({
          customer: customer.id,
          amount: lineItem.unitPrice * lineItem.quantity,
          currency: 'usd',
          description: `${lineItem.description} (${lineItem.quantity} x $${(lineItem.unitPrice / 100).toFixed(2)})`,
          metadata: {
            category: lineItem.category,
            project_id: invoiceData.projectId,
            milestone_id: invoiceData.milestoneId,
            milestone: invoiceData.milestone,
          },
        });
        invoiceItems.push(invoiceItem);
      }

      // Calculate due date (default to 30 days from now)
      const dueDate = invoiceData.dueDate
        ? Math.floor(new Date(invoiceData.dueDate).getTime() / 1000)
        : Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000);

      // Create the invoice
      const invoice = await stripe.invoices.create({
        customer: customer.id,
        due_date: dueDate,
        description: invoiceData.description,
        footer: invoiceData.notes || 'Thank you for your business!',
        metadata: {
          project_id: invoiceData.projectId,
          milestone_id: invoiceData.milestoneId,
          milestone: invoiceData.milestone,
          customer_email: invoiceData.customerEmail,
          customer_name: invoiceData.customerName,
          source: 'curlfeather_platform',
          ...invoiceData.metadata,
        },
        collection_method: 'send_invoice',
        days_until_due: 30,
      });

      // Finalize the invoice to make it ready for payment
      const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id);

      return {
        success: true,
        invoice: {
          id: finalizedInvoice.id || '',
          number: finalizedInvoice.number || '',
          status: finalizedInvoice.status || '',
          amount_due: finalizedInvoice.amount_due || 0,
          amount_paid: finalizedInvoice.amount_paid || 0,
          amount_remaining: finalizedInvoice.amount_remaining || 0,
          currency: finalizedInvoice.currency || 'usd',
          customer: (finalizedInvoice.customer as string) || '',
          due_date: finalizedInvoice.due_date || undefined,
          created: finalizedInvoice.created || 0,
          hosted_invoice_url: finalizedInvoice.hosted_invoice_url || undefined,
          invoice_pdf: finalizedInvoice.invoice_pdf || undefined,
          payment_intent: (finalizedInvoice as any).payment_intent || undefined,
          metadata: finalizedInvoice.metadata as Record<string, string> || {},
        },
        message: `Invoice ${finalizedInvoice.number} created successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating invoice'
      };
    }
  }

  /**
   * Send invoice to customer via email
   */
  async sendInvoice(invoiceId: string): Promise<InvoiceResult> {
    try {
      const invoice = await stripe.invoices.sendInvoice(invoiceId);

      return {
        success: true,
        invoice: {
          id: invoice.id || '',
          number: invoice.number || '',
          status: invoice.status || '',
          amount_due: invoice.amount_due || 0,
          amount_paid: invoice.amount_paid || 0,
          amount_remaining: invoice.amount_remaining || 0,
          currency: invoice.currency || 'usd',
          customer: (invoice.customer as string) || '',
          due_date: invoice.due_date || undefined,
          created: invoice.created || 0,
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          payment_intent: (invoice as any).payment_intent || undefined,
          metadata: invoice.metadata as Record<string, string> || {},
        },
        message: `Invoice ${invoice.number} sent successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending invoice'
      };
    }
  }

  /**
   * Retrieve an invoice by ID
   */
  async getInvoice(invoiceId: string): Promise<InvoiceResult> {
    try {
      const invoice = await stripe.invoices.retrieve(invoiceId);

      return {
        success: true,
        invoice: {
          id: invoice.id || '',
          number: invoice.number || '',
          status: invoice.status || '',
          amount_due: invoice.amount_due || 0,
          amount_paid: invoice.amount_paid || 0,
          amount_remaining: invoice.amount_remaining || 0,
          currency: invoice.currency || 'usd',
          customer: (invoice.customer as string) || '',
          due_date: invoice.due_date || undefined,
          created: invoice.created || 0,
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          payment_intent: (invoice as any).payment_intent || undefined,
          metadata: invoice.metadata as Record<string, string> || {},
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving invoice'
      };
    }
  }

  /**
   * Get all invoices for a customer
   */
  async getCustomerInvoices(customerId: string): Promise<{
    success: boolean;
    invoices?: StripeInvoice[];
    error?: string;
  }> {
    try {
      const invoices = await stripe.invoices.list({
        customer: customerId,
        limit: 100,
      });

      const formattedInvoices: StripeInvoice[] = invoices.data.map((invoice: any) => ({
        id: invoice.id || '',
        number: invoice.number || '',
        status: invoice.status || '',
        amount_due: invoice.amount_due || 0,
        amount_paid: invoice.amount_paid || 0,
        amount_remaining: invoice.amount_remaining || 0,
        currency: invoice.currency || 'usd',
        customer: invoice.customer || '',
        due_date: invoice.due_date || undefined,
        created: invoice.created || 0,
        hosted_invoice_url: invoice.hosted_invoice_url || undefined,
        invoice_pdf: invoice.invoice_pdf || undefined,
        payment_intent: invoice.payment_intent || undefined,
        metadata: invoice.metadata || {},
      }));

      return {
        success: true,
        invoices: formattedInvoices,
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving customer invoices'
      };
    }
  }

  /**
   * Update invoice status and metadata
   */
  async updateInvoice(invoiceId: string, updates: {
    metadata?: Record<string, string>;
    description?: string;
    footer?: string;
  }): Promise<InvoiceResult> {
    try {
      const invoice = await stripe.invoices.update(invoiceId, updates);

      return {
        success: true,
        invoice: {
          id: invoice.id || '',
          number: invoice.number || '',
          status: invoice.status || '',
          amount_due: invoice.amount_due || 0,
          amount_paid: invoice.amount_paid || 0,
          amount_remaining: invoice.amount_remaining || 0,
          currency: invoice.currency || 'usd',
          customer: (invoice.customer as string) || '',
          due_date: invoice.due_date || undefined,
          created: invoice.created || 0,
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          payment_intent: (invoice as any).payment_intent || undefined,
          metadata: invoice.metadata as Record<string, string> || {},
        },
        message: `Invoice ${invoice.number} updated successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error updating invoice'
      };
    }
  }

  /**
   * Pay an invoice using a payment method
   */
  async payInvoice(invoiceId: string, paymentMethodId?: string): Promise<InvoiceResult> {
    try {
      const invoice = await stripe.invoices.pay(invoiceId, {
        payment_method: paymentMethodId,
      });

      return {
        success: true,
        invoice: {
          id: invoice.id || '',
          number: invoice.number || '',
          status: invoice.status || '',
          amount_due: invoice.amount_due || 0,
          amount_paid: invoice.amount_paid || 0,
          amount_remaining: invoice.amount_remaining || 0,
          currency: invoice.currency || 'usd',
          customer: (invoice.customer as string) || '',
          due_date: invoice.due_date || undefined,
          created: invoice.created || 0,
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          payment_intent: (invoice as any).payment_intent || undefined,
          metadata: invoice.metadata as Record<string, string> || {},
        },
        message: `Invoice ${invoice.number} paid successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error paying invoice'
      };
    }
  }

  /**
   * Void an invoice (cancel it)
   */
  async voidInvoice(invoiceId: string): Promise<InvoiceResult> {
    try {
      const invoice = await stripe.invoices.voidInvoice(invoiceId);

      return {
        success: true,
        invoice: {
          id: invoice.id || '',
          number: invoice.number || '',
          status: invoice.status || '',
          amount_due: invoice.amount_due || 0,
          amount_paid: invoice.amount_paid || 0,
          amount_remaining: invoice.amount_remaining || 0,
          currency: invoice.currency || 'usd',
          customer: (invoice.customer as string) || '',
          due_date: invoice.due_date || undefined,
          created: invoice.created || 0,
          hosted_invoice_url: invoice.hosted_invoice_url || undefined,
          invoice_pdf: invoice.invoice_pdf || undefined,
          payment_intent: (invoice as any).payment_intent || undefined,
          metadata: invoice.metadata as Record<string, string> || {},
        },
        message: `Invoice ${invoice.number} voided successfully`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error voiding invoice'
      };
    }
  }

  /**
   * Get invoice analytics for dashboard
   */
  async getInvoiceAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<{
    success: boolean;
    analytics?: {
      totalInvoices: number;
      totalAmount: number;
      paidAmount: number;
      outstandingAmount: number;
      paidInvoices: number;
      unpaidInvoices: number;
      overdueInvoices: number;
      averageInvoiceAmount: number;
      invoicesByStatus: {
        draft: number;
        open: number;
        paid: number;
        void: number;
        uncollectible: number;
      };
      invoicesByDay: Array<{
        date: string;
        amount: number;
        count: number;
        paid_amount: number;
        paid_count: number;
      }>;
    };
    error?: string;
  }> {
    try {
      const invoices = await stripe.invoices.list({
        created: {
          gte: Math.floor(startDate.getTime() / 1000),
          lte: Math.floor(endDate.getTime() / 1000),
        },
        limit: 100,
      });

      const totalInvoices = invoices.data.length;
      const totalAmount = invoices.data.reduce((sum: number, inv: any) => sum + inv.amount_due, 0);
      const paidAmount = invoices.data.reduce((sum: number, inv: any) => sum + inv.amount_paid, 0);
      const outstandingAmount = totalAmount - paidAmount;
      const paidInvoices = invoices.data.filter((inv: any) => inv.status === 'paid').length;
      const unpaidInvoices = invoices.data.filter((inv: any) => inv.status === 'open').length;
      const overdueInvoices = invoices.data.filter((inv: any) =>
        inv.status === 'open' && inv.due_date && inv.due_date < Date.now() / 1000
      ).length;
      const averageInvoiceAmount = totalInvoices > 0 ? totalAmount / totalInvoices : 0;

      // Group by status
      const invoicesByStatus = invoices.data.reduce(
        (acc: any, invoice: any) => {
          acc[invoice.status] = (acc[invoice.status] || 0) + 1;
          return acc;
        },
        { draft: 0, open: 0, paid: 0, void: 0, uncollectible: 0 }
      );

      // Group by day
      const invoicesByDay: { [key: string]: { amount: number; count: number; paid_amount: number; paid_count: number } } = {};
      
      invoices.data.forEach((invoice: any) => {
        const date = new Date(invoice.created * 1000).toISOString().split('T')[0];
        if (!invoicesByDay[date]) {
          invoicesByDay[date] = { amount: 0, count: 0, paid_amount: 0, paid_count: 0 };
        }
        invoicesByDay[date].amount += invoice.amount_due;
        invoicesByDay[date].count += 1;
        if (invoice.status === 'paid') {
          invoicesByDay[date].paid_amount += invoice.amount_paid;
          invoicesByDay[date].paid_count += 1;
        }
      });

      const invoicesByDayArray = Object.entries(invoicesByDay).map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
        paid_amount: data.paid_amount,
        paid_count: data.paid_count,
      }));

      return {
        success: true,
        analytics: {
          totalInvoices,
          totalAmount,
          paidAmount,
          outstandingAmount,
          paidInvoices,
          unpaidInvoices,
          overdueInvoices,
          averageInvoiceAmount,
          invoicesByStatus,
          invoicesByDay: invoicesByDayArray,
        },
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving invoice analytics'
      };
    }
  }
}

// Environment-based configuration
const stripeConfig = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  secretKey: process.env.STRIPE_SECRET_KEY || '',
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
};

// Export singleton instance
export const stripeClient = new StripePaymentClient();

// Export Stripe instance for direct access if needed
export { stripe };

// Export configuration
export { stripeConfig };


export { StripePaymentClient };