/**
 * Stripe Invoice Automation Service
 * Handles automated invoice creation, project milestone tracking, and payment synchronization using Stripe
 */

import { stripeClient, InvoiceData, InvoiceLineItem } from '@/lib/payments/stripe-client';
import { supabase } from '@/lib/auth/auth-client';

export interface ProjectMilestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'invoiced' | 'paid';
  amount: number;
  dueDate: string;
  completedDate?: string;
  invoiceId?: string;
  stripeInvoiceId?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number; // in cents
    category: 'labor' | 'materials' | 'equipment' | 'permit' | 'other';
  }>;
}

export interface ProjectData {
  id: string;
  name: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country?: string;
  };
  status: 'planning' | 'in_progress' | 'completed';
  milestones: ProjectMilestone[];
}

export interface StripeInvoiceAutomationResult {
  success: boolean;
  invoiceId?: string;
  stripeInvoiceId?: string;
  hostedInvoiceUrl?: string;
  error?: string;
  message?: string;
}

class StripeInvoiceAutomationService {
  /**
   * Complete a project milestone and automatically create Stripe invoice
   */
  async completeMilestone(
    projectId: string, 
    milestoneId: string,
    completionNotes?: string
  ): Promise<StripeInvoiceAutomationResult> {
    try {
      // 1. Get project and milestone data
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      if (milestone.status === 'completed' || milestone.status === 'invoiced') {
        return { success: false, error: 'Milestone already completed' };
      }

      // 2. Mark milestone as completed
      milestone.status = 'completed';
      milestone.completedDate = new Date().toISOString();

      // 3. Ensure customer exists in Stripe
      const customer = await this.ensureCustomerInStripe(project);
      if (!customer.success) {
        return { success: false, error: customer.error };
      }

      // 4. Create invoice in Stripe
      const invoiceData: InvoiceData = {
        customerId: customer.stripeId!,
        customerEmail: project.customerEmail,
        customerName: project.customerName,
        projectId: project.id,
        milestoneId: milestone.id,
        milestone: milestone.title,
        description: `${project.name} - ${milestone.title}`,
        lineItems: milestone.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category
        })),
        dueDate: milestone.dueDate,
        notes: completionNotes || `Milestone completed: ${milestone.title}\n\nThank you for your business!`,
        metadata: {
          project_id: project.id,
          milestone_id: milestone.id,
          milestone_title: milestone.title,
          customer_email: project.customerEmail,
          completion_date: milestone.completedDate || new Date().toISOString(),
        }
      };

      const invoiceResult = await stripeClient.createInvoice(invoiceData);
      if (!invoiceResult.success) {
        return { success: false, error: invoiceResult.error };
      }

      // 5. Update milestone with invoice information
      milestone.status = 'invoiced';
      milestone.stripeInvoiceId = invoiceResult.invoice?.id;

      // 6. Save updated project data
      await this.updateProjectData(project);

      // 7. Send invoice to customer
      if (invoiceResult.invoice?.id) {
        await stripeClient.sendInvoice(invoiceResult.invoice.id);
      }

      return {
        success: true,
        stripeInvoiceId: invoiceResult.invoice?.id,
        hostedInvoiceUrl: invoiceResult.invoice?.hosted_invoice_url,
        message: `Invoice created and sent for milestone: ${milestone.title}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error in milestone completion'
      };
    }
  }

  /**
   * Record payment and update project status (handled automatically by Stripe webhooks)
   */
  async recordPayment(
    projectId: string,
    milestoneId: string,
    paymentData: {
      stripePaymentIntentId: string;
      amount: number;
      date: string;
      note?: string;
    }
  ): Promise<StripeInvoiceAutomationResult> {
    try {
      // 1. Get project and milestone data
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone || !milestone.stripeInvoiceId) {
        return { success: false, error: 'Milestone or invoice not found' };
      }

      // 2. Verify payment in Stripe
      const paymentResult = await stripeClient.getPaymentIntent(paymentData.stripePaymentIntentId);
      if (!paymentResult.success || paymentResult.paymentIntent?.status !== 'succeeded') {
        return { success: false, error: 'Payment not found or not successful' };
      }

      // 3. Update milestone status
      milestone.status = 'paid';

      // 4. Save updated project data
      await this.updateProjectData(project);

      // 5. Update database with payment information
      await supabase
        .from('project_milestones')
        .update({
          status: 'paid',
          payment_date: paymentData.date,
          stripe_payment_intent_id: paymentData.stripePaymentIntentId,
          updated_at: new Date().toISOString()
        })
        .eq('id', milestoneId);

      return {
        success: true,
        message: `Payment recorded for milestone: ${milestone.title}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error recording payment'
      };
    }
  }

  /**
   * Sync payment status from Stripe
   */
  async syncPaymentStatus(projectId: string): Promise<StripeInvoiceAutomationResult> {
    try {
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      let updatesCount = 0;

      // Check each milestone for payment updates
      for (const milestone of project.milestones) {
        if (milestone.stripeInvoiceId && milestone.status === 'invoiced') {
          // Get invoice details from Stripe
          const invoiceResult = await stripeClient.getInvoice(milestone.stripeInvoiceId);
          
          if (invoiceResult.success && invoiceResult.invoice) {
            const stripeInvoice = invoiceResult.invoice;
            
            // Update status based on Stripe status
            if (stripeInvoice.status === 'paid') {
              milestone.status = 'paid';
              updatesCount++;
            }
          }
        }
      }

      if (updatesCount > 0) {
        await this.updateProjectData(project);
      }

      return {
        success: true,
        message: `Synced payment status for ${updatesCount} milestones`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error syncing payment status'
      };
    }
  }

  /**
   * Get financial report for project
   */
  async getProjectFinancialReport(projectId: string): Promise<{
    success: boolean;
    report?: {
      totalProjectValue: number;
      totalInvoiced: number;
      totalPaid: number;
      outstanding: number;
      milestoneStatus: {
        pending: number;
        completed: number;
        invoiced: number;
        paid: number;
      };
      invoices: Array<{
        id: string;
        number: string;
        amount: number;
        status: string;
        created: string;
        dueDate?: string;
        hostedUrl?: string;
        milestone: string;
      }>;
    };
    error?: string;
  }> {
    try {
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const totalProjectValue = project.milestones.reduce((sum, m) => sum + m.amount, 0);
      const totalInvoiced = project.milestones
        .filter(m => m.status === 'invoiced' || m.status === 'paid')
        .reduce((sum, m) => sum + m.amount, 0);

      let totalPaid = 0;
      const invoices = [];

      // Get detailed invoice information from Stripe
      for (const milestone of project.milestones) {
        if (milestone.stripeInvoiceId) {
          const invoiceResult = await stripeClient.getInvoice(milestone.stripeInvoiceId);
          if (invoiceResult.success && invoiceResult.invoice) {
            const invoice = invoiceResult.invoice;
            totalPaid += invoice.amount_paid;
            
            invoices.push({
              id: invoice.id,
              number: invoice.number,
              amount: invoice.amount_due,
              status: invoice.status,
              created: new Date(invoice.created * 1000).toISOString(),
              dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : undefined,
              hostedUrl: invoice.hosted_invoice_url,
              milestone: milestone.title
            });
          }
        }
      }

      const milestoneStatus = project.milestones.reduce(
        (acc, milestone) => {
          acc[milestone.status]++;
          return acc;
        },
        { pending: 0, in_progress: 0, completed: 0, invoiced: 0, paid: 0 }
      );

      return {
        success: true,
        report: {
          totalProjectValue,
          totalInvoiced,
          totalPaid,
          outstanding: totalInvoiced - totalPaid,
          milestoneStatus: {
            pending: milestoneStatus.pending + milestoneStatus.in_progress,
            completed: milestoneStatus.completed,
            invoiced: milestoneStatus.invoiced,
            paid: milestoneStatus.paid
          },
          invoices
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error generating report'
      };
    }
  }

  /**
   * Create invoice for specific milestone without marking as completed
   */
  async createMilestoneInvoice(
    projectId: string,
    milestoneId: string,
    customDueDate?: string
  ): Promise<StripeInvoiceAutomationResult> {
    try {
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const milestone = project.milestones.find(m => m.id === milestoneId);
      if (!milestone) {
        return { success: false, error: 'Milestone not found' };
      }

      if (milestone.status === 'invoiced' || milestone.status === 'paid') {
        return { success: false, error: 'Milestone already invoiced' };
      }

      // Ensure customer exists in Stripe
      const customer = await this.ensureCustomerInStripe(project);
      if (!customer.success) {
        return { success: false, error: customer.error };
      }

      // Create invoice
      const invoiceData: InvoiceData = {
        customerId: customer.stripeId!,
        customerEmail: project.customerEmail,
        customerName: project.customerName,
        projectId: project.id,
        milestoneId: milestone.id,
        milestone: milestone.title,
        description: `${project.name} - ${milestone.title}`,
        lineItems: milestone.lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          category: item.category
        })),
        dueDate: customDueDate || milestone.dueDate,
        notes: `Invoice for ${milestone.title}\n\nPayment due within 30 days of invoice date.`,
        metadata: {
          project_id: project.id,
          milestone_id: milestone.id,
          milestone_title: milestone.title,
          customer_email: project.customerEmail,
        }
      };

      const invoiceResult = await stripeClient.createInvoice(invoiceData);
      if (!invoiceResult.success) {
        return { success: false, error: invoiceResult.error };
      }

      // Update milestone
      milestone.status = 'invoiced';
      milestone.stripeInvoiceId = invoiceResult.invoice?.id;
      await this.updateProjectData(project);

      return {
        success: true,
        stripeInvoiceId: invoiceResult.invoice?.id,
        hostedInvoiceUrl: invoiceResult.invoice?.hosted_invoice_url,
        message: `Invoice created for milestone: ${milestone.title}`
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error creating invoice'
      };
    }
  }

  /**
   * Get all invoices for a project
   */
  async getProjectInvoices(projectId: string): Promise<{
    success: boolean;
    invoices?: Array<{
      id: string;
      number: string;
      amount: number;
      status: string;
      created: string;
      dueDate?: string;
      hostedUrl?: string;
      milestone: string;
      milestoneId: string;
    }>;
    error?: string;
  }> {
    try {
      const project = await this.getProjectData(projectId);
      if (!project) {
        return { success: false, error: 'Project not found' };
      }

      const invoices = [];
      for (const milestone of project.milestones) {
        if (milestone.stripeInvoiceId) {
          const invoiceResult = await stripeClient.getInvoice(milestone.stripeInvoiceId);
          if (invoiceResult.success && invoiceResult.invoice) {
            const invoice = invoiceResult.invoice;
            invoices.push({
              id: invoice.id,
              number: invoice.number,
              amount: invoice.amount_due,
              status: invoice.status,
              created: new Date(invoice.created * 1000).toISOString(),
              dueDate: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : undefined,
              hostedUrl: invoice.hosted_invoice_url,
              milestone: milestone.title,
              milestoneId: milestone.id
            });
          }
        }
      }

      return {
        success: true,
        invoices
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error retrieving invoices'
      };
    }
  }

  // Private helper methods

  private async getProjectData(projectId: string): Promise<ProjectData | null> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          milestones:project_milestones(*),
          customer:customer_profiles(*)
        `)
        .eq('id', projectId)
        .single();

      if (error || !data) {
        console.error('Error fetching project:', error);
        return null;
      }

      return {
        id: data.id,
        name: data.name,
        customerId: data.customer.id,
        customerEmail: data.customer.email,
        customerName: `${data.customer.first_name} ${data.customer.last_name}`,
        customerPhone: data.customer.phone,
        customerAddress: data.customer.address,
        status: data.status,
        milestones: data.milestones?.map((m: any) => ({
          id: m.id,
          projectId: m.project_id,
          title: m.title,
          description: m.description,
          status: m.status,
          amount: m.amount,
          dueDate: m.due_date,
          completedDate: m.completed_date,
          stripeInvoiceId: m.stripe_invoice_id,
          lineItems: m.line_items || []
        })) || []
      };
    } catch (error) {
      console.error('Error in getProjectData:', error);
      return null;
    }
  }

  private async updateProjectData(project: ProjectData): Promise<void> {
    // Update project milestones in database
    for (const milestone of project.milestones) {
      await supabase
        .from('project_milestones')
        .upsert({
          id: milestone.id,
          project_id: project.id,
          title: milestone.title,
          description: milestone.description,
          status: milestone.status,
          amount: milestone.amount,
          due_date: milestone.dueDate,
          completed_date: milestone.completedDate,
          stripe_invoice_id: milestone.stripeInvoiceId,
          line_items: milestone.lineItems,
          updated_at: new Date().toISOString()
        });
    }
  }

  private async ensureCustomerInStripe(project: ProjectData): Promise<{
    success: boolean;
    stripeId?: string;
    error?: string;
  }> {
    try {
      // Create or get customer in Stripe
      const customerResult = await stripeClient.createOrGetCustomer({
        email: project.customerEmail,
        name: project.customerName,
        phone: project.customerPhone,
        address: project.customerAddress ? {
          line1: project.customerAddress.street,
          city: project.customerAddress.city,
          state: project.customerAddress.state,
          postal_code: project.customerAddress.zip,
          country: project.customerAddress.country || 'US'
        } : undefined
      });

      if (!customerResult.success) {
        return { success: false, error: customerResult.error };
      }

      // Update customer profile with Stripe ID if not already stored
      await supabase
        .from('customer_profiles')
        .update({
          stripe_customer_id: customerResult.customer!.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.customerId);

      return { success: true, stripeId: customerResult.customer!.id };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error ensuring customer'
      };
    }
  }
}

// Export singleton instance
export const stripeInvoiceAutomationService = new StripeInvoiceAutomationService();