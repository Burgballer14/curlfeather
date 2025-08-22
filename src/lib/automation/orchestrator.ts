import { sendQuoteEmail, sendLeadNotificationEmail, sendFollowUpEmail, type LeadEmailData } from './email';
import { sendQuoteConfirmationSMS, sendLeadAlertSMS, sendFollowUpSMS, formatPhoneNumber, type LeadSMSData } from './sms';
import { calculateLeadScore, calculateProjectPricing } from '../supabase/client-simple';
import type { QuoteFormData } from '../validations/simple-forms';

export interface AutomationTrigger {
  type: 'quote_submitted' | 'follow_up_1' | 'follow_up_2' | 'follow_up_3' | 'appointment_scheduled' | 'project_update' | 'payment_reminder';
  leadData: QuoteFormData;
  metadata?: Record<string, any>;
}

export interface AutomationResult {
  success: boolean;
  emailSent: boolean;
  smsSent: boolean;
  errors: string[];
  leadId: string;
  leadScore: number;
  estimatedValue: number;
}

/**
 * Main automation orchestrator - handles complete lead automation workflow
 */
export async function executeAutomation(trigger: AutomationTrigger): Promise<AutomationResult> {
  const errors: string[] = [];
  let emailSent = false;
  let smsSent = false;
  
  try {
    // Calculate lead metrics
    const leadScore = calculateLeadScore(trigger.leadData);
    const pricingData = calculateProjectPricing(trigger.leadData);
    const leadId = generateLeadId();
    
    // Format phone number
    const formattedPhone = formatPhoneNumber(trigger.leadData.phone);
    
    // Prepare lead data for automation
    const emailData: LeadEmailData = {
      name: trigger.leadData.name,
      email: trigger.leadData.email,
      phone: formattedPhone,
      address: trigger.leadData.address,
      projectType: trigger.leadData.project_type,
      estimatedCost: pricingData.total_cost,
      leadScore,
      projectDetails: {
        roomLength: trigger.leadData.room_length,
        roomWidth: trigger.leadData.room_width,
        ceilingHeight: trigger.leadData.ceiling_height,
        timeline: trigger.leadData.project_timeline,
        budget: trigger.leadData.project_budget,
        services: trigger.leadData.services
      }
    };
    
    const smsData: LeadSMSData = {
      name: trigger.leadData.name,
      phone: formattedPhone,
      email: trigger.leadData.email,
      estimatedCost: pricingData.total_cost,
      leadScore,
      projectType: trigger.leadData.project_type,
      timeline: trigger.leadData.project_timeline
    };
    
    // Execute automation based on trigger type
    switch (trigger.type) {
      case 'quote_submitted':
        emailSent = await executeQuoteSubmissionAutomation(emailData, smsData);
        smsSent = await sendQuoteConfirmationSMS(smsData);
        
        // Schedule follow-ups
        await scheduleFollowUpSequence(leadId, trigger.leadData);
        break;
        
      case 'follow_up_1':
      case 'follow_up_2':
      case 'follow_up_3':
        const step = parseInt(trigger.type.split('_')[2]);
        emailSent = await sendFollowUpEmail(emailData, step);
        smsSent = await sendFollowUpSMS(smsData, step);
        break;
        
      default:
        errors.push(`Unknown automation trigger: ${trigger.type}`);
    }
    
    // Log automation execution
    console.log('Automation executed:', {
      leadId,
      trigger: trigger.type,
      leadScore,
      estimatedValue: pricingData.total_cost,
      emailSent,
      smsSent,
      timestamp: new Date().toISOString()
    });
    
    return {
      success: errors.length === 0,
      emailSent,
      smsSent,
      errors,
      leadId,
      leadScore,
      estimatedValue: pricingData.total_cost
    };
    
  } catch (error) {
    console.error('Automation execution failed:', error);
    errors.push(`Automation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    return {
      success: false,
      emailSent,
      smsSent,
      errors,
      leadId: generateLeadId(),
      leadScore: 0,
      estimatedValue: 0
    };
  }
}

/**
 * Execute complete quote submission automation
 */
async function executeQuoteSubmissionAutomation(emailData: LeadEmailData, smsData: LeadSMSData): Promise<boolean> {
  try {
    // Send customer quote email
    const customerEmailSent = await sendQuoteEmail(emailData);
    
    // Send internal notification (high priority leads only)
    if (emailData.leadScore >= 60) {
      await sendLeadNotificationEmail(emailData);
    }
    
    // Send urgent SMS alert for high-value leads
    if (emailData.estimatedCost >= 5000 || emailData.leadScore >= 80) {
      await sendLeadAlertSMS(smsData);
    }
    
    return customerEmailSent;
  } catch (error) {
    console.error('Quote submission automation failed:', error);
    return false;
  }
}

/**
 * Schedule automated follow-up sequence
 */
async function scheduleFollowUpSequence(leadId: string, leadData: QuoteFormData): Promise<void> {
  try {
    // In a real implementation, this would use a job queue like Bull or Agenda
    // For now, we'll simulate with setTimeout for demonstration
    
    const followUpSchedule = [
      { delay: 24 * 60 * 60 * 1000, step: 1 }, // 24 hours
      { delay: 72 * 60 * 60 * 1000, step: 2 }, // 3 days  
      { delay: 168 * 60 * 60 * 1000, step: 3 } // 7 days
    ];
    
    followUpSchedule.forEach(({ delay, step }) => {
      setTimeout(async () => {
        await executeAutomation({
          type: `follow_up_${step}` as any,
          leadData,
          metadata: { leadId, scheduledFollowUp: true }
        });
      }, delay);
    });
    
    console.log('Follow-up sequence scheduled for lead:', leadId);
  } catch (error) {
    console.error('Failed to schedule follow-up sequence:', error);
  }
}

/**
 * Generate unique lead ID
 */
function generateLeadId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `lead_${timestamp}_${random}`;
}

/**
 * Save lead to database (Supabase integration)
 */
export async function saveLeadToDatabase(leadData: QuoteFormData, automationResult: AutomationResult): Promise<boolean> {
  try {
    // This will be implemented when Supabase is connected
    // For now, just log the data
    
    const leadRecord = {
      id: automationResult.leadId,
      ...leadData,
      lead_score: automationResult.leadScore,
      estimated_value: automationResult.estimatedValue,
      status: 'new',
      source: 'website_quote_form',
      created_at: new Date().toISOString(),
      automation_sent: {
        email: automationResult.emailSent,
        sms: automationResult.smsSent
      }
    };
    
    console.log('Lead saved to database:', leadRecord);
    
    // TODO: Implement actual Supabase insertion
    // const { data, error } = await supabase
    //   .from('leads')
    //   .insert([leadRecord]);
    
    return true;
  } catch (error) {
    console.error('Failed to save lead to database:', error);
    return false;
  }
}

/**
 * Update lead status in database
 */
export async function updateLeadStatus(leadId: string, status: string, metadata?: Record<string, any>): Promise<boolean> {
  try {
    console.log('Lead status updated:', { leadId, status, metadata });
    
    // TODO: Implement actual Supabase update
    // const { data, error } = await supabase
    //   .from('leads')
    //   .update({ status, updated_at: new Date().toISOString(), ...metadata })
    //   .eq('id', leadId);
    
    return true;
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return false;
  }
}

/**
 * Get lead analytics and performance metrics
 */
export async function getAutomationMetrics(timeframe: '24h' | '7d' | '30d' = '7d'): Promise<{
  totalLeads: number;
  automationSuccess: number;
  emailDelivery: number;
  smsDelivery: number;
  avgLeadScore: number;
  totalEstimatedValue: number;
}> {
  try {
    // This will pull real metrics from the database
    // For now, return mock data
    
    return {
      totalLeads: 12,
      automationSuccess: 0.95,
      emailDelivery: 0.98,
      smsDelivery: 0.92,
      avgLeadScore: 72,
      totalEstimatedValue: 84500
    };
  } catch (error) {
    console.error('Failed to get automation metrics:', error);
    return {
      totalLeads: 0,
      automationSuccess: 0,
      emailDelivery: 0,
      smsDelivery: 0,
      avgLeadScore: 0,
      totalEstimatedValue: 0
    };
  }
}

/**
 * Test automation system (for development/debugging)
 */
export async function testAutomationSystem(testData?: Partial<QuoteFormData>): Promise<AutomationResult> {
  const defaultTestData: QuoteFormData = {
    name: 'John Test',
    email: 'john.test@example.com',
    phone: '(406) 555-0123',
    address: '123 Test St, Bozeman, MT',
    project_type: 'installation',
    ceiling_height: '9',
    room_length: '20',
    room_width: '15',
    project_timeline: 'Within 2 weeks',
    project_budget: '$5000-$10000',
    services: {
      installation: true,
      taping: true,
      texture: 'spray'
    },
    contact_method: 'email',
    preferred_times: ['morning'],
    additional_notes: 'Test automation system'
  };
  
  const mergedTestData = { ...defaultTestData, ...testData };
  
  return executeAutomation({
    type: 'quote_submitted',
    leadData: mergedTestData,
    metadata: { isTest: true }
  });
}