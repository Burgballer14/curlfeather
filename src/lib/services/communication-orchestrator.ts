/**
 * Communication Orchestrator Service
 * Manages automated communication workflows and triggers
 */

import { emailAutomationService } from '@/lib/communications/email-automation';
import { smsAutomationService } from '@/lib/communications/sms-automation';
import { invoiceAutomationService } from '@/lib/services/invoice-automation';

export interface CommunicationPreferences {
  customerId: string;
  email: {
    enabled: boolean;
    projectUpdates: boolean;
    paymentReminders: boolean;
    milestoneCompletions: boolean;
    marketingUpdates: boolean;
  };
  sms: {
    enabled: boolean;
    urgentOnly: boolean;
    appointmentReminders: boolean;
    crewArrivals: boolean;
    paymentReminders: boolean;
  };
  timezone: string;
  preferredContactHours: {
    start: string; // e.g., "09:00"
    end: string;   // e.g., "18:00"
  };
}

export interface MilestoneCompletionData {
  projectId: string;
  milestoneId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectName: string;
  milestoneTitle: string;
  milestoneDescription: string;
  completionPercentage: number;
  invoiceAmount?: number;
  invoiceUrl?: string;
  photoGalleryUrl: string;
  nextMilestone: string;
  projectManagerName: string;
  projectManagerEmail: string;
}

export interface PaymentReceivedData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectName: string;
  invoiceNumber: string;
  amountPaid: number;
  paymentMethod: string;
  transactionId: string;
  paymentDate: string;
  receiptUrl?: string;
}

export interface ProjectCompletionData {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  projectName: string;
  completionDate: string;
  finalPhotosUrl: string;
  warrantyInfo: string;
  feedbackSurveyUrl: string;
  referralProgramUrl: string;
}

export interface CrewDispatchData {
  customerId: string;
  customerName: string;
  customerPhone: string;
  projectName: string;
  estimatedArrival: string;
  crewLeadName: string;
  crewLeadPhone: string;
}

export type ProjectCommunicationTrigger =
  | { triggerType: 'milestone_completed'; data: MilestoneCompletionData }
  | { triggerType: 'payment_received'; data: PaymentReceivedData }
  | { triggerType: 'project_completed'; data: ProjectCompletionData }
  | { triggerType: 'crew_dispatch'; data: CrewDispatchData }
  | { triggerType: 'delay_notification'; data: Record<string, any> };

class CommunicationOrchestrator {
  /**
   * Handle milestone completion workflow
   */
  async handleMilestoneCompletion(data: {
    projectId: string;
    milestoneId: string;
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    projectName: string;
    milestoneTitle: string;
    milestoneDescription: string;
    completionPercentage: number;
    invoiceAmount?: number;
    invoiceUrl?: string;
    photoGalleryUrl: string;
    nextMilestone: string;
    projectManagerName: string;
    projectManagerEmail: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get customer communication preferences
      const preferences = await this.getCustomerPreferences(data.customerId);

      // Send email notification
      if (preferences.email.enabled && preferences.email.milestoneCompletions) {
        await emailAutomationService.sendMilestoneCompletion({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          projectName: data.projectName,
          completedMilestone: data.milestoneTitle,
          nextMilestone: data.nextMilestone,
          photoGalleryUrl: data.photoGalleryUrl,
          invoiceAmount: data.invoiceAmount,
          invoiceUrl: data.invoiceUrl,
          projectProgressPercentage: data.completionPercentage,
        });
      }

      // Send SMS notification if enabled
      if (preferences.sms.enabled && data.customerPhone && this.isWithinContactHours(preferences)) {
        await smsAutomationService.sendProjectUpdate({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          projectName: data.projectName,
          updateType: 'milestone_completed',
        });
      }

      console.log(`Milestone completion communications sent for project ${data.projectId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in milestone completion workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle payment received workflow
   */
  async handlePaymentReceived(data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    projectName: string;
    invoiceNumber: string;
    amountPaid: number;
    paymentMethod: string;
    transactionId: string;
    paymentDate: string;
    receiptUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get customer communication preferences
      const preferences = await this.getCustomerPreferences(data.customerId);

      // Send email confirmation
      if (preferences.email.enabled) {
        await emailAutomationService.sendPaymentConfirmation({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          projectName: data.projectName,
          invoiceNumber: data.invoiceNumber,
          amountPaid: data.amountPaid,
          paymentMethod: data.paymentMethod,
          transactionId: data.transactionId,
          paymentDate: data.paymentDate,
          receiptUrl: data.receiptUrl,
        });
      }

      console.log(`Payment confirmation communications sent for customer ${data.customerId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in payment received workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle project completion workflow
   */
  async handleProjectCompletion(data: ProjectCompletionData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get customer communication preferences
      const preferences = await this.getCustomerPreferences(data.customerId);

      // Send email notification
      if (preferences.email.enabled) {
        await emailAutomationService.sendProjectCompletion({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          projectName: data.projectName,
          completionDate: data.completionDate,
          finalPhotosUrl: data.finalPhotosUrl,
          warrantyInfo: data.warrantyInfo,
          feedbackSurveyUrl: data.feedbackSurveyUrl,
          referralProgramUrl: data.referralProgramUrl,
        });
      }

      // Send SMS notification if enabled
      if (preferences.sms.enabled && data.customerPhone && this.isWithinContactHours(preferences)) {
        await smsAutomationService.sendProjectUpdate({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          projectName: data.projectName,
          updateType: 'completion_ready',
        });
      }

      console.log(`Project completion communications sent for customer ${data.customerId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in project completion workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle crew dispatch notification
   */
  async handleCrewDispatch(data: CrewDispatchData): Promise<{ success: boolean; error?: string }> {
    try {
      // Get customer communication preferences
      const preferences = await this.getCustomerPreferences(data.customerId);

      // Send SMS notification for crew arrival (time-sensitive)
      if (preferences.sms.enabled && preferences.sms.crewArrivals) {
        await smsAutomationService.sendProjectUpdate({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          projectName: data.projectName,
          updateType: 'crew_arrival',
        });
      }

      console.log(`Crew dispatch notification sent for customer ${data.customerId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in crew dispatch workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle payment reminder workflow
   */
  async handlePaymentReminder(data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    invoiceNumber: string;
    amountDue: number;
    dueDate: string;
    paymentUrl: string;
    projectName: string;
    daysPastDue: number;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Get customer communication preferences
      const preferences = await this.getCustomerPreferences(data.customerId);

      // Send email reminder
      if (preferences.email.enabled && preferences.email.paymentReminders) {
        await emailAutomationService.sendInvoiceReminder({
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          invoiceNumber: data.invoiceNumber,
          amountDue: data.amountDue,
          dueDate: data.dueDate,
          paymentUrl: data.paymentUrl,
          projectName: data.projectName,
          daysPastDue: data.daysPastDue,
        });
      }

      // Send SMS reminder for overdue invoices or if customer prefers SMS
      if (preferences.sms.enabled && preferences.sms.paymentReminders && data.customerPhone) {
        if (data.daysPastDue > 0 || this.isWithinContactHours(preferences)) {
          await smsAutomationService.sendPaymentReminder({
            customerName: data.customerName,
            customerPhone: data.customerPhone,
            invoiceNumber: data.invoiceNumber,
            amountDue: data.amountDue,
            dueDate: data.dueDate,
            paymentUrl: data.paymentUrl,
          });
        }
      }

      console.log(`Payment reminder sent for customer ${data.customerId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in payment reminder workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Handle new customer onboarding
   */
  async handleCustomerOnboarding(data: {
    customerId: string;
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    projectName: string;
    projectManagerName: string;
    projectManagerEmail: string;
    projectPortalUrl: string;
    estimatedStartDate: string;
    estimatedCompletion: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Send welcome email
      await emailAutomationService.sendWelcomeEmail({
        name: data.customerName,
        email: data.customerEmail,
        projectName: data.projectName,
        projectManagerName: data.projectManagerName,
        projectManagerEmail: data.projectManagerEmail,
        projectPortalUrl: data.projectPortalUrl,
        estimatedStartDate: data.estimatedStartDate,
        estimatedCompletion: data.estimatedCompletion,
      });

      // Send welcome SMS if phone number provided
      if (data.customerPhone) {
        await smsAutomationService.sendWelcomeSMS({
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          projectName: data.projectName,
          projectManagerName: data.projectManagerName,
          projectPortalUrl: data.projectPortalUrl,
        });
      }

      console.log(`Customer onboarding communications sent for customer ${data.customerId}`);
      return { success: true };

    } catch (error) {
      console.error('Error in customer onboarding workflow:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Schedule automated reminder workflows
   */
  async scheduleAutomatedReminders(): Promise<{ success: boolean; scheduled: number; errors: string[] }> {
    let scheduled = 0;
    const errors: string[] = [];

    try {
      // This would typically integrate with a job scheduler like Bull/Redis
      // For now, we'll simulate the scheduling logic

      // Schedule payment reminders for overdue invoices
      // TODO: Query database for overdue invoices and schedule reminders

      // Schedule appointment reminders
      // TODO: Query calendar system for upcoming appointments

      // Schedule project update reminders
      // TODO: Check for projects that haven't had updates in X days

      console.log(`Scheduled ${scheduled} automated reminders`);
      
      return {
        success: errors.length === 0,
        scheduled,
        errors,
      };

    } catch (error) {
      console.error('Error scheduling automated reminders:', error);
      return {
        success: false,
        scheduled: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Process communication triggers from external events
   */
  async processTrigger(trigger: ProjectCommunicationTrigger): Promise<{ success: boolean; error?: string }> {
    try {
      switch (trigger.triggerType) {
        case 'milestone_completed':
          return await this.handleMilestoneCompletion(trigger.data);
        
        case 'payment_received':
          return await this.handlePaymentReceived(trigger.data);
        
        case 'project_completed':
          return await this.handleProjectCompletion(trigger.data);
        
        case 'crew_dispatch':
          return await this.handleCrewDispatch(trigger.data);
        
        case 'delay_notification':
          // Handle project delay notifications
          return { success: true };
        
        default:
          const exhaustiveCheck: never = trigger;
          console.warn(`Unknown trigger type: ${(exhaustiveCheck as any).triggerType}`);
          return { success: false, error: 'Unknown trigger type' };
      }
    } catch (error) {
      console.error('Error processing communication trigger:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error processing trigger'
      };
    }
  }

  // Helper methods

  private async getCustomerPreferences(customerId: string): Promise<CommunicationPreferences> {
    // TODO: Implement database query for customer preferences
    // For now, return default preferences
    return {
      customerId,
      email: {
        enabled: true,
        projectUpdates: true,
        paymentReminders: true,
        milestoneCompletions: true,
        marketingUpdates: false,
      },
      sms: {
        enabled: true,
        urgentOnly: false,
        appointmentReminders: true,
        crewArrivals: true,
        paymentReminders: true,
      },
      timezone: 'America/Denver',
      preferredContactHours: {
        start: '09:00',
        end: '18:00',
      },
    };
  }

  private isWithinContactHours(preferences: CommunicationPreferences): boolean {
    try {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = currentHour * 60 + currentMinute;

      const [startHour, startMinute] = preferences.preferredContactHours.start.split(':').map(Number);
      const [endHour, endMinute] = preferences.preferredContactHours.end.split(':').map(Number);
      
      const startTime = startHour * 60 + startMinute;
      const endTime = endHour * 60 + endMinute;

      return currentTime >= startTime && currentTime <= endTime;
    } catch (error) {
      console.error('Error checking contact hours:', error);
      return true; // Default to allowing contact
    }
  }

  /**
   * Test communication system
   */
  async testCommunicationSystem(): Promise<{ success: boolean; emailTest?: boolean; smsTest?: boolean; errors: string[] }> {
    const errors: string[] = [];
    let emailTest = false;
    let smsTest = false;

    try {
      // Test email system
      const emailResult = await emailAutomationService.testEmailConfiguration();
      emailTest = emailResult.success;
      if (!emailResult.success) {
        errors.push(`Email test failed: ${emailResult.error}`);
      }

      // Test SMS system
      const smsResult = await smsAutomationService.testSMSConfiguration();
      smsTest = smsResult.success;
      if (!smsResult.success) {
        errors.push(`SMS test failed: ${smsResult.error}`);
      }

      return {
        success: emailTest && smsTest,
        emailTest,
        smsTest,
        errors,
      };

    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown test error');
      return {
        success: false,
        emailTest,
        smsTest,
        errors,
      };
    }
  }
}

// Export singleton instance
export const communicationOrchestrator = new CommunicationOrchestrator();

export { CommunicationOrchestrator };