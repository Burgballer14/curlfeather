/**
 * Email Automation Service
 * Handles automated customer communications throughout the project lifecycle
 */

import sgMail from '@sendgrid/mail';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export interface EmailTemplate {
  subject: string;
  templateId: string;
  dynamicData: Record<string, any>;
}

export interface ProjectUpdateEmailData {
  customerName: string;
  customerEmail: string;
  projectName: string;
  milestoneTitle: string;
  milestoneDescription: string;
  completionPercentage: number;
  nextSteps: string;
  projectManagerName: string;
  projectManagerEmail: string;
  projectPortalUrl: string;
  photos?: string[];
}

export interface PaymentConfirmationEmailData {
  customerName: string;
  customerEmail: string;
  projectName: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  receiptUrl?: string;
}

export interface MilestoneCompletionEmailData {
  customerName: string;
  customerEmail: string;
  projectName: string;
  completedMilestone: string;
  nextMilestone: string;
  photoGalleryUrl: string;
  invoiceAmount?: number;
  invoiceUrl?: string;
  projectProgressPercentage: number;
}

export interface ProjectCompletionEmailData {
  customerName: string;
  customerEmail: string;
  projectName: string;
  completionDate: string;
  finalPhotosUrl: string;
  warrantyInfo: string;
  feedbackSurveyUrl: string;
  referralProgramUrl: string;
}

class EmailAutomationService {
  private fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@curlfeather.com';
  private fromName = 'Curl Feather Inc.';

  /**
   * Send project update notification
   */
  async sendProjectUpdate(data: ProjectUpdateEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: data.customerName,
        projectName: data.projectName,
        milestoneTitle: data.milestoneTitle,
        milestoneDescription: data.milestoneDescription,
        completionPercentage: data.completionPercentage,
        nextSteps: data.nextSteps,
        projectManagerName: data.projectManagerName,
        projectManagerEmail: data.projectManagerEmail,
        projectPortalUrl: data.projectPortalUrl,
        companyName: this.fromName,
        year: new Date().getFullYear(),
        hasPhotos: data.photos && data.photos.length > 0,
        photoCount: data.photos?.length || 0,
      };

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-project-update-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Project update email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending project update email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send payment confirmation
   */
  async sendPaymentConfirmation(data: PaymentConfirmationEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: data.customerName,
        projectName: data.projectName,
        invoiceNumber: data.invoiceNumber,
        amountPaid: this.formatCurrency(data.amountPaid),
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId,
        paymentDate: this.formatDate(data.paymentDate),
        receiptUrl: data.receiptUrl,
        companyName: this.fromName,
        year: new Date().getFullYear(),
        hasReceipt: !!data.receiptUrl,
      };

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-payment-confirmation-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Payment confirmation email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending payment confirmation email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send milestone completion notification
   */
  async sendMilestoneCompletion(data: MilestoneCompletionEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: data.customerName,
        projectName: data.projectName,
        completedMilestone: data.completedMilestone,
        nextMilestone: data.nextMilestone,
        photoGalleryUrl: data.photoGalleryUrl,
        projectProgressPercentage: data.projectProgressPercentage,
        invoiceAmount: data.invoiceAmount ? this.formatCurrency(data.invoiceAmount) : null,
        invoiceUrl: data.invoiceUrl,
        companyName: this.fromName,
        year: new Date().getFullYear(),
        hasInvoice: !!data.invoiceAmount,
      };

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-milestone-completion-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Milestone completion email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending milestone completion email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send project completion notification
   */
  async sendProjectCompletion(data: ProjectCompletionEmailData): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: data.customerName,
        projectName: data.projectName,
        completionDate: this.formatDate(data.completionDate),
        finalPhotosUrl: data.finalPhotosUrl,
        warrantyInfo: data.warrantyInfo,
        feedbackSurveyUrl: data.feedbackSurveyUrl,
        referralProgramUrl: data.referralProgramUrl,
        companyName: this.fromName,
        year: new Date().getFullYear(),
      };

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-project-completion-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Project completion email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending project completion email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send welcome email to new customers
   */
  async sendWelcomeEmail(customerData: {
    name: string;
    email: string;
    projectName: string;
    projectManagerName: string;
    projectManagerEmail: string;
    projectPortalUrl: string;
    estimatedStartDate: string;
    estimatedCompletion: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: customerData.name,
        projectName: customerData.projectName,
        projectManagerName: customerData.projectManagerName,
        projectManagerEmail: customerData.projectManagerEmail,
        projectPortalUrl: customerData.projectPortalUrl,
        estimatedStartDate: this.formatDate(customerData.estimatedStartDate),
        estimatedCompletion: this.formatDate(customerData.estimatedCompletion),
        companyName: this.fromName,
        year: new Date().getFullYear(),
      };

      const msg = {
        to: customerData.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-welcome-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Welcome email sent to ${customerData.email}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send invoice reminder
   */
  async sendInvoiceReminder(data: {
    customerName: string;
    customerEmail: string;
    invoiceNumber: string;
    amountDue: number;
    dueDate: string;
    paymentUrl: string;
    projectName: string;
    daysPastDue?: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const isOverdue = data.daysPastDue && data.daysPastDue > 0;
      
      const templateData = {
        customerName: data.customerName,
        invoiceNumber: data.invoiceNumber,
        amountDue: this.formatCurrency(data.amountDue),
        dueDate: this.formatDate(data.dueDate),
        paymentUrl: data.paymentUrl,
        projectName: data.projectName,
        isOverdue,
        daysPastDue: data.daysPastDue || 0,
        companyName: this.fromName,
        year: new Date().getFullYear(),
      };

      const templateId = isOverdue ? 'd-overdue-invoice-template' : 'd-invoice-reminder-template';

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId,
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Invoice reminder email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending invoice reminder email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(data: {
    customerName: string;
    customerEmail: string;
    subject: string;
    message: string;
    projectName?: string;
    actionUrl?: string;
    actionText?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const templateData = {
        customerName: data.customerName,
        subject: data.subject,
        message: data.message,
        projectName: data.projectName,
        actionUrl: data.actionUrl,
        actionText: data.actionText,
        hasAction: !!data.actionUrl,
        companyName: this.fromName,
        year: new Date().getFullYear(),
      };

      const msg = {
        to: data.customerEmail,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        templateId: 'd-custom-notification-template', // SendGrid dynamic template ID
        dynamicTemplateData: templateData,
      };

      await sgMail.send(msg);
      console.log(`Custom notification email sent to ${data.customerEmail}`);
      
      return { success: true };
    } catch (error) {
      console.error('Error sending custom notification email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending email'
      };
    }
  }

  /**
   * Send bulk notifications (for announcements, etc.)
   */
  async sendBulkNotification(
    recipients: Array<{ name: string; email: string }>,
    templateData: {
      subject: string;
      message: string;
      actionUrl?: string;
      actionText?: string;
    }
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendCustomNotification({
          customerName: recipient.name,
          customerEmail: recipient.email,
          subject: templateData.subject,
          message: templateData.message,
          actionUrl: templateData.actionUrl,
          actionText: templateData.actionText,
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${recipient.email}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return {
      success: failed === 0,
      sent,
      failed,
      errors,
    };
  }

  // Helper methods
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Test email configuration
   */
  async testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
    try {
      const testMsg = {
        to: process.env.ADMIN_EMAIL || 'admin@curlfeather.com',
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: 'Email Configuration Test - Curl Feather Platform',
        text: 'This is a test email to verify SendGrid configuration.',
        html: `
          <h2>Email Configuration Test</h2>
          <p>This is a test email to verify SendGrid configuration.</p>
          <p>If you receive this email, the email automation system is working correctly.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
      };

      await sgMail.send(testMsg);
      console.log('Test email sent successfully');
      
      return { success: true };
    } catch (error) {
      console.error('Error sending test email:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending test email'
      };
    }
  }
}

// Export singleton instance
export const emailAutomationService = new EmailAutomationService();

export { EmailAutomationService };