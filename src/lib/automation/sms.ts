import twilio from 'twilio';

// Initialize Twilio client
let twilioClient: twilio.Twilio | null = null;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export interface SMSData {
  to: string;
  message: string;
  from?: string;
}

export interface LeadSMSData {
  name: string;
  phone: string;
  email: string;
  estimatedCost: number;
  leadScore: number;
  projectType: string;
  timeline: string;
}

/**
 * Send SMS using Twilio
 */
export async function sendSMS(smsData: SMSData): Promise<boolean> {
  if (!twilioClient) {
    console.log('Twilio not configured. SMS would be sent:', smsData);
    return true; // Return true for development
  }

  try {
    const message = await twilioClient.messages.create({
      body: smsData.message,
      from: smsData.from || process.env.TWILIO_PHONE_NUMBER,
      to: smsData.to
    });

    console.log('SMS sent successfully:', message.sid);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

/**
 * Send instant quote confirmation SMS to customer
 */
export async function sendQuoteConfirmationSMS(leadData: LeadSMSData): Promise<boolean> {
  const message = `Hi ${leadData.name}! Thanks for your drywall quote request. We're preparing your personalized estimate and you'll receive it within 5 minutes! Questions? Call us at ${process.env.BUSINESS_PHONE || '(406) 555-0123'}. - Curl Feather Inc`;

  return sendSMS({
    to: leadData.phone,
    message
  });
}

/**
 * Send internal alert SMS to business owner
 */
export async function sendLeadAlertSMS(leadData: LeadSMSData): Promise<boolean> {
  const urgency = leadData.leadScore >= 80 ? '🚨 HIGH PRIORITY' : leadData.leadScore >= 60 ? '⚠️ MEDIUM' : '📝 NEW';
  const message = `${urgency} LEAD: ${leadData.name} (${leadData.phone}) - ${leadData.projectType} - ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} - Score: ${leadData.leadScore}/100. CALL NOW for best conversion!`;

  // Send to business owner's phone
  return sendSMS({
    to: process.env.BUSINESS_OWNER_PHONE || process.env.BUSINESS_PHONE || '(406) 555-0123',
    message
  });
}

/**
 * Send appointment reminder SMS
 */
export async function sendAppointmentReminderSMS(customerData: {
  name: string;
  phone: string;
  appointmentDate: string;
  appointmentTime: string;
}): Promise<boolean> {
  const message = `Hi ${customerData.name}! Reminder: Your drywall consultation is scheduled for ${customerData.appointmentDate} at ${customerData.appointmentTime}. We'll see you then! Questions? Call ${process.env.BUSINESS_PHONE || '(406) 555-0123'}. - Curl Feather Inc`;

  return sendSMS({
    to: customerData.phone,
    message
  });
}

/**
 * Send project update SMS
 */
export async function sendProjectUpdateSMS(customerData: {
  name: string;
  phone: string;
  updateMessage: string;
  projectStatus: string;
}): Promise<boolean> {
  const message = `Hi ${customerData.name}! Project Update: ${customerData.updateMessage} Status: ${customerData.projectStatus}. Questions? Call ${process.env.BUSINESS_PHONE || '(406) 555-0123'}. - Curl Feather Inc`;

  return sendSMS({
    to: customerData.phone,
    message
  });
}

/**
 * Send payment reminder SMS
 */
export async function sendPaymentReminderSMS(customerData: {
  name: string;
  phone: string;
  amount: number;
  dueDate: string;
  paymentLink?: string;
}): Promise<boolean> {
  const baseMessage = `Hi ${customerData.name}! Friendly reminder: Payment of ${customerData.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} is due ${customerData.dueDate}.`;
  
  const paymentMessage = customerData.paymentLink 
    ? `${baseMessage} Pay online: ${customerData.paymentLink}` 
    : `${baseMessage} Call ${process.env.BUSINESS_PHONE || '(406) 555-0123'} to pay.`;

  const message = `${paymentMessage} - Curl Feather Inc`;

  return sendSMS({
    to: customerData.phone,
    message
  });
}

/**
 * Send follow-up SMS sequence
 */
export async function sendFollowUpSMS(leadData: LeadSMSData, sequenceStep: number): Promise<boolean> {
  const messages = [
    `Hi ${leadData.name}! Just checking in about your drywall project. Our calendar is filling up fast - call ${process.env.BUSINESS_PHONE || '(406) 555-0123'} to secure your spot! - Curl Feather`,
    `${leadData.name}, don't miss out on your ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} drywall project! We have openings this week. Call ${process.env.BUSINESS_PHONE || '(406) 555-0123'} - Curl Feather`,
    `Final reminder, ${leadData.name}: Your drywall quote expires soon. Call ${process.env.BUSINESS_PHONE || '(406) 555-0123'} to book or we'll release your reserved spot. - Curl Feather`
  ];

  if (sequenceStep > messages.length) return false;

  return sendSMS({
    to: leadData.phone,
    message: messages[sequenceStep - 1]
  });
}

/**
 * Send bulk SMS notification (for team alerts)
 */
export async function sendBulkSMS(phoneNumbers: string[], message: string): Promise<boolean[]> {
  const results = await Promise.all(
    phoneNumbers.map(phone => sendSMS({ to: phone, message }))
  );
  
  return results;
}

/**
 * Validate phone number format
 */
export function validatePhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Check if it's a valid US phone number (10 or 11 digits)
  if (cleaned.length === 10) return true;
  if (cleaned.length === 11 && cleaned[0] === '1') return true;
  
  return false;
}

/**
 * Format phone number for Twilio (E.164 format)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  } else if (cleaned.length === 11 && cleaned[0] === '1') {
    return `+${cleaned}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Check SMS delivery status
 */
export async function checkSMSStatus(messageSid: string): Promise<string | null> {
  if (!twilioClient) {
    console.log('Twilio not configured. Cannot check SMS status.');
    return null;
  }

  try {
    const message = await twilioClient.messages(messageSid).fetch();
    return message.status;
  } catch (error) {
    console.error('Failed to check SMS status:', error);
    return null;
  }
}