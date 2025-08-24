/**
 * SMS Automation Service
 * Handles automated SMS notifications for time-sensitive project updates
 */

import { Twilio } from 'twilio';

// Initialize Twilio
const twilioClient = new Twilio(
  process.env.TWILIO_ACCOUNT_SID || '',
  process.env.TWILIO_AUTH_TOKEN || ''
);

export interface SMSNotificationData {
  customerName: string;
  customerPhone: string;
  message: string;
  projectName?: string;
  urgencyLevel?: 'low' | 'medium' | 'high';
}

export interface ProjectUpdateSMSData {
  customerName: string;
  customerPhone: string;
  projectName: string;
  updateType: 'milestone_completed' | 'delay_notification' | 'crew_arrival' | 'completion_ready';
  customMessage?: string;
}

export interface PaymentReminderSMSData {
  customerName: string;
  customerPhone: string;
  invoiceNumber: string;
  amountDue: number;
  dueDate: string;
  paymentUrl: string;
}

class SMSAutomationService {
  private fromPhone = process.env.TWILIO_PHONE_NUMBER || '';
  private maxMessageLength = 160; // Standard SMS length

  /**
   * Send project update SMS
   */
  async sendProjectUpdate(data: ProjectUpdateSMSData): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      let message = '';

      switch (data.updateType) {
        case 'milestone_completed':
          message = `Hi ${data.customerName}! Great news - we've completed another milestone on your ${data.projectName} project. Check your customer portal for photos and progress updates.`;
          break;
        case 'delay_notification':
          message = `Hi ${data.customerName}, we need to update you on your ${data.projectName} project timeline. Please check your customer portal or we'll call you shortly.`;
          break;
        case 'crew_arrival':
          message = `Hi ${data.customerName}! Our crew is on the way to your ${data.projectName} project site. They should arrive within the next 30 minutes.`;
          break;
        case 'completion_ready':
          message = `Hi ${data.customerName}! Your ${data.projectName} project is complete and ready for final walkthrough. Please check your customer portal to schedule.`;
          break;
        default:
          message = data.customMessage || `Update on your ${data.projectName} project. Please check your customer portal.`;
      }

      // Use custom message if provided
      if (data.customMessage) {
        message = data.customMessage;
      }

      // Truncate if necessary
      if (message.length > this.maxMessageLength) {
        message = message.substring(0, this.maxMessageLength - 3) + '...';
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Project update SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending project update SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Send payment reminder SMS
   */
  async sendPaymentReminder(data: PaymentReminderSMSData): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      const formattedAmount = this.formatCurrency(data.amountDue);
      const formattedDate = this.formatDate(data.dueDate);
      
      const message = `Hi ${data.customerName}! Friendly reminder: Invoice ${data.invoiceNumber} for ${formattedAmount} is due ${formattedDate}. Pay securely: ${data.paymentUrl}`;

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Payment reminder SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending payment reminder SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Send emergency or urgent notification
   */
  async sendUrgentNotification(data: {
    customerName: string;
    customerPhone: string;
    message: string;
    projectName?: string;
  }): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      let urgentMessage = `URGENT - ${data.customerName}: ${data.message}`;
      
      if (data.projectName) {
        urgentMessage += ` (Project: ${data.projectName})`;
      }

      // Truncate if necessary
      if (urgentMessage.length > this.maxMessageLength) {
        urgentMessage = urgentMessage.substring(0, this.maxMessageLength - 3) + '...';
      }

      const result = await twilioClient.messages.create({
        body: urgentMessage,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Urgent notification SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending urgent notification SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Send appointment reminder
   */
  async sendAppointmentReminder(data: {
    customerName: string;
    customerPhone: string;
    appointmentType: string;
    appointmentDate: string;
    appointmentTime: string;
    location?: string;
  }): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      let message = `Hi ${data.customerName}! Reminder: ${data.appointmentType} scheduled for ${this.formatDate(data.appointmentDate)} at ${data.appointmentTime}`;
      
      if (data.location) {
        message += ` at ${data.location}`;
      }
      
      message += '. Reply CONFIRM to confirm or call us if you need to reschedule.';

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Appointment reminder SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending appointment reminder SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Send custom SMS notification
   */
  async sendCustomNotification(data: SMSNotificationData): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      let message = data.message;

      // Add urgency indicator for high priority messages
      if (data.urgencyLevel === 'high') {
        message = `URGENT - ${message}`;
      }

      // Truncate if necessary
      if (message.length > this.maxMessageLength) {
        message = message.substring(0, this.maxMessageLength - 3) + '...';
      }

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Custom SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending custom SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Send welcome SMS to new customers
   */
  async sendWelcomeSMS(data: {
    customerName: string;
    customerPhone: string;
    projectName: string;
    projectManagerName: string;
    projectPortalUrl: string;
  }): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      const message = `Welcome ${data.customerName}! Your ${data.projectName} project is starting soon. Your project manager is ${data.projectManagerName}. Track progress: ${data.projectPortalUrl}`;

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(data.customerPhone),
      });

      console.log(`Welcome SMS sent to ${data.customerPhone}, SID: ${result.sid}`);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending welcome SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending SMS'
      };
    }
  }

  /**
   * Handle incoming SMS responses
   */
  async handleIncomingSMS(data: {
    from: string;
    body: string;
    messageSid: string;
  }): Promise<{ success: boolean; response?: string; action?: string }> {
    try {
      const phoneNumber = this.formatPhoneNumber(data.from);
      const message = data.body.trim().toLowerCase();

      console.log(`Incoming SMS from ${phoneNumber}: ${data.body}`);

      // Handle common responses
      if (message.includes('confirm') || message === 'yes' || message === 'y') {
        return {
          success: true,
          response: 'Thank you for confirming! We\'ll see you at the scheduled time.',
          action: 'confirmation_received'
        };
      }

      if (message.includes('reschedule') || message.includes('cancel')) {
        return {
          success: true,
          response: 'We\'ll call you shortly to reschedule. You can also call us at (555) 123-4567.',
          action: 'reschedule_requested'
        };
      }

      if (message.includes('stop') || message === 'unsubscribe') {
        return {
          success: true,
          response: 'You have been unsubscribed from SMS notifications.',
          action: 'unsubscribe_requested'
        };
      }

      if (message.includes('help') || message === '?') {
        return {
          success: true,
          response: 'For help, call us at (555) 123-4567 or visit your customer portal. Reply STOP to unsubscribe.',
          action: 'help_requested'
        };
      }

      // Default response for unrecognized messages
      return {
        success: true,
        response: 'Thanks for your message! For immediate assistance, call (555) 123-4567.',
        action: 'general_response'
      };

    } catch (error) {
      console.error('Error handling incoming SMS:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Send bulk SMS notifications
   */
  async sendBulkSMS(
    recipients: Array<{ name: string; phone: string }>,
    message: string,
    urgencyLevel: 'low' | 'medium' | 'high' = 'low'
  ): Promise<{ success: boolean; sent: number; failed: number; errors: string[] }> {
    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const recipient of recipients) {
      try {
        const result = await this.sendCustomNotification({
          customerName: recipient.name,
          customerPhone: recipient.phone,
          message: message,
          urgencyLevel
        });

        if (result.success) {
          sent++;
        } else {
          failed++;
          errors.push(`${recipient.phone}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${recipient.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }

      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      success: failed === 0,
      sent,
      failed,
      errors,
    };
  }

  /**
   * Get SMS delivery status
   */
  async getSMSStatus(messageSid: string): Promise<{
    success: boolean;
    status?: string;
    dateUpdated?: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    try {
      const message = await twilioClient.messages(messageSid).fetch();
      
      return {
        success: true,
        status: message.status,
        dateUpdated: message.dateUpdated?.toISOString(),
        errorCode: message.errorCode?.toString(),
        errorMessage: message.errorMessage || undefined,
      };
    } catch (error) {
      console.error('Error fetching SMS status:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Test SMS configuration
   */
  async testSMSConfiguration(): Promise<{ success: boolean; error?: string; messageSid?: string }> {
    try {
      const testPhone = process.env.ADMIN_PHONE || process.env.TWILIO_TEST_PHONE;
      
      if (!testPhone) {
        return {
          success: false,
          error: 'No test phone number configured'
        };
      }

      const message = `SMS Test - Curl Feather Platform\nSent at: ${new Date().toLocaleString()}\nIf you receive this, SMS automation is working correctly.`;

      const result = await twilioClient.messages.create({
        body: message,
        from: this.fromPhone,
        to: this.formatPhoneNumber(testPhone),
      });

      console.log('Test SMS sent successfully, SID:', result.sid);
      
      return { 
        success: true, 
        messageSid: result.sid 
      };
    } catch (error) {
      console.error('Error sending test SMS:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error sending test SMS'
      };
    }
  }

  // Helper methods
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Add +1 if it's a US number without country code
    if (digits.length === 10) {
      return `+1${digits}`;
    }
    
    // Add + if it's missing
    if (digits.length === 11 && !phone.startsWith('+')) {
      return `+${digits}`;
    }
    
    return phone;
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  /**
   * Validate phone number format
   */
  isValidPhoneNumber(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 15;
  }
}

// Export singleton instance
export const smsAutomationService = new SMSAutomationService();

export { SMSAutomationService };