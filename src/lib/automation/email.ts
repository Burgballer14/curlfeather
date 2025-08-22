import sgMail from '@sendgrid/mail';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
  templateData?: Record<string, any>;
}

export interface LeadEmailData {
  name: string;
  email: string;
  phone: string;
  address: string;
  projectType: string;
  estimatedCost: number;
  leadScore: number;
  projectDetails: {
    roomLength: string;
    roomWidth: string;
    ceilingHeight: string;
    timeline: string;
    budget: string;
    services: any;
  };
}

/**
 * Send email using SendGrid
 */
export async function sendEmail(emailData: EmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('SendGrid not configured. Email would be sent:', emailData);
    return true; // Return true for development
  }

  try {
    const msg = {
      to: emailData.to,
      from: {
        email: process.env.SENDGRID_FROM_EMAIL || 'noreply@curlfeather.com',
        name: process.env.SENDGRID_FROM_NAME || 'Curl Feather Inc'
      },
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || stripHtml(emailData.html)
    };

    await sgMail.send(msg);
    console.log('Email sent successfully to:', emailData.to);
    return true;
  } catch (error) {
    console.error('Failed to send email:', error);
    return false;
  }
}

/**
 * Send instant quote email to customer
 */
export async function sendQuoteEmail(leadData: LeadEmailData): Promise<boolean> {
  const subject = `Your Drywall Quote is Ready - ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
  
  const html = generateQuoteEmailHTML(leadData);
  
  return sendEmail({
    to: leadData.email,
    subject,
    html
  });
}

/**
 * Send internal notification email to business owner
 */
export async function sendLeadNotificationEmail(leadData: LeadEmailData): Promise<boolean> {
  const subject = `🚨 New HIGH-VALUE Lead: ${leadData.name} - ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
  
  const html = generateLeadNotificationHTML(leadData);
  
  return sendEmail({
    to: process.env.BUSINESS_EMAIL || 'info@curlfeather.com',
    subject,
    html
  });
}

/**
 * Send follow-up email sequence
 */
export async function sendFollowUpEmail(leadData: LeadEmailData, sequenceStep: number): Promise<boolean> {
  const templates = [
    {
      subject: `Don't miss out on your drywall project, ${leadData.name}`,
      html: generateFollowUpHTML(leadData, 1)
    },
    {
      subject: `${leadData.name}, let's get your project started`,
      html: generateFollowUpHTML(leadData, 2)
    },
    {
      subject: `Final reminder: Your drywall quote expires soon`,
      html: generateFollowUpHTML(leadData, 3)
    }
  ];

  if (sequenceStep > templates.length) return false;
  
  const template = templates[sequenceStep - 1];
  
  return sendEmail({
    to: leadData.email,
    subject: template.subject,
    html: template.html
  });
}

/**
 * Generate HTML for customer quote email
 */
function generateQuoteEmailHTML(leadData: LeadEmailData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Drywall Quote from Curl Feather Inc</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .quote-box { background: white; border-left: 4px solid #16a34a; padding: 20px; margin: 20px 0; }
    .price { font-size: 32px; font-weight: bold; color: #16a34a; text-align: center; margin: 20px 0; }
    .details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
    .cta-button { background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏠 Your Drywall Quote is Ready!</h1>
    <p>Professional drywall services in Bozeman, MT</p>
  </div>
  
  <div class="content">
    <h2>Hi ${leadData.name},</h2>
    
    <p>Thank you for choosing Curl Feather Inc for your drywall project! We've prepared a detailed quote based on your requirements.</p>
    
    <div class="quote-box">
      <h3>📋 Project Summary</h3>
      <div class="details">
        <strong>Project Type:</strong> ${leadData.projectType}<br>
        <strong>Location:</strong> ${leadData.address}<br>
        <strong>Room Size:</strong> ${leadData.projectDetails.roomLength}' × ${leadData.projectDetails.roomWidth}'<br>
        <strong>Ceiling Height:</strong> ${leadData.projectDetails.ceilingHeight} feet<br>
        <strong>Timeline:</strong> ${leadData.projectDetails.timeline}<br>
        <strong>Services:</strong> ${formatServices(leadData.projectDetails.services)}
      </div>
      
      <div class="price">
        ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </div>
      <p style="text-align: center; color: #666; font-size: 14px;">
        Includes materials, labor, and cleanup
      </p>
    </div>
    
    <h3>✅ What's Included:</h3>
    <ul>
      <li>Professional consultation and measurement</li>
      <li>High-quality materials and supplies</li>
      <li>Expert installation and finishing</li>
      <li>Complete cleanup when finished</li>
      <li>100% satisfaction guarantee</li>
      <li>Licensed and insured work</li>
    </ul>
    
    <div style="text-align: center;">
      <a href="tel:${process.env.BUSINESS_PHONE || '(406) 555-0123'}" class="cta-button">
        📞 Call Now to Schedule: ${process.env.BUSINESS_PHONE || '(406) 555-0123'}
      </a>
    </div>
    
    <h3>🚀 Next Steps:</h3>
    <ol>
      <li><strong>Call us</strong> at ${process.env.BUSINESS_PHONE || '(406) 555-0123'} to discuss details</li>
      <li><strong>Schedule</strong> a free in-home consultation</li>
      <li><strong>Finalize</strong> project timeline and start date</li>
      <li><strong>Get started</strong> on your beautiful new drywall!</li>
    </ol>
    
    <div class="quote-box">
      <h4>⚡ Limited Time Offer</h4>
      <p>This quote is valid for 30 days. Book within the next 7 days and receive:</p>
      <ul>
        <li><strong>5% Early Bird Discount</strong></li>
        <li><strong>Free texture upgrade</strong> (up to $200 value)</li>
        <li><strong>Priority scheduling</strong></li>
      </ul>
    </div>
    
    <p><strong>Questions?</strong> Reply to this email or call us directly. We're here to help!</p>
    
    <p>Best regards,<br>
    <strong>The Curl Feather Team</strong><br>
    Licensed & Insured Drywall Contractors<br>
    Serving Bozeman and surrounding areas</p>
  </div>
  
  <div class="footer">
    <p><strong>Curl Feather Inc</strong><br>
    ${process.env.BUSINESS_ADDRESS || 'Bozeman, MT'}<br>
    Phone: ${process.env.BUSINESS_PHONE || '(406) 555-0123'}<br>
    Email: ${process.env.BUSINESS_EMAIL || 'info@curlfeather.com'}</p>
  </div>
</body>
</html>`;
}

/**
 * Generate HTML for internal lead notification email
 */
function generateLeadNotificationHTML(leadData: LeadEmailData): string {
  const urgencyColor = leadData.leadScore >= 80 ? '#ef4444' : leadData.leadScore >= 60 ? '#f59e0b' : '#16a34a';
  const urgencyLabel = leadData.leadScore >= 80 ? 'HIGH PRIORITY' : leadData.leadScore >= 60 ? 'MEDIUM PRIORITY' : 'STANDARD';
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Lead Alert</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .alert { background: ${urgencyColor}; color: white; padding: 15px; text-align: center; font-weight: bold; }
    .content { padding: 20px; background: #f9f9f9; }
    .lead-info { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid ${urgencyColor}; }
    .price { font-size: 24px; font-weight: bold; color: ${urgencyColor}; }
    .action-buttons { text-align: center; margin: 20px 0; }
    .btn { background: ${urgencyColor}; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; margin: 0 10px; display: inline-block; }
  </style>
</head>
<body>
  <div class="alert">
    🚨 NEW LEAD ALERT - ${urgencyLabel} 🚨
  </div>
  
  <div class="content">
    <h2>Lead Details</h2>
    
    <div class="lead-info">
      <h3>${leadData.name}</h3>
      <p><strong>Score:</strong> ${leadData.leadScore}/100 (${urgencyLabel})</p>
      <p><strong>Estimated Value:</strong> <span class="price">${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span></p>
      <p><strong>Phone:</strong> <a href="tel:${leadData.phone}">${leadData.phone}</a></p>
      <p><strong>Email:</strong> <a href="mailto:${leadData.email}">${leadData.email}</a></p>
      <p><strong>Address:</strong> ${leadData.address}</p>
    </div>
    
    <div class="lead-info">
      <h4>Project Details</h4>
      <p><strong>Type:</strong> ${leadData.projectType}</p>
      <p><strong>Size:</strong> ${leadData.projectDetails.roomLength}' × ${leadData.projectDetails.roomWidth}' (${leadData.projectDetails.ceilingHeight}' ceiling)</p>
      <p><strong>Timeline:</strong> ${leadData.projectDetails.timeline}</p>
      <p><strong>Budget:</strong> ${leadData.projectDetails.budget}</p>
      <p><strong>Services:</strong> ${formatServices(leadData.projectDetails.services)}</p>
    </div>
    
    <div class="action-buttons">
      <a href="tel:${leadData.phone}" class="btn">📞 Call Now</a>
      <a href="mailto:${leadData.email}" class="btn">📧 Send Email</a>
    </div>
    
    <p><strong>⏰ Action Required:</strong> Contact this lead within 5 minutes for best conversion rates!</p>
  </div>
</body>
</html>`;
}

/**
 * Generate follow-up email HTML
 */
function generateFollowUpHTML(leadData: LeadEmailData, step: number): string {
  const messages = [
    {
      title: "Don't let your project wait!",
      content: "We noticed you requested a quote but haven't scheduled your consultation yet. Our calendar is filling up fast, and we'd hate for you to miss out on getting your project completed."
    },
    {
      title: "Ready to transform your space?",
      content: "Your drywall project is waiting! We've reserved some time slots this week specifically for quote follow-ups. Let's get your project on the calendar."
    },
    {
      title: "Last chance for priority scheduling",
      content: "This is our final reminder about your drywall quote. After today, we'll remove you from our priority list, but you can always reach out if you decide to move forward later."
    }
  ];
  
  const message = messages[step - 1];
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${message.title}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
    .header { background: #16a34a; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .cta-button { background: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
    .reminder-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${message.title}</h1>
  </div>
  
  <div class="content">
    <h2>Hi ${leadData.name},</h2>
    
    <p>${message.content}</p>
    
    <div class="reminder-box">
      <h4>Your Quote Recap:</h4>
      <p><strong>Project:</strong> ${leadData.projectType}</p>
      <p><strong>Estimate:</strong> ${leadData.estimatedCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
      <p><strong>Timeline:</strong> ${leadData.projectDetails.timeline}</p>
    </div>
    
    <div style="text-align: center;">
      <a href="tel:${process.env.BUSINESS_PHONE || '(406) 555-0123'}" class="cta-button">
        Call Now: ${process.env.BUSINESS_PHONE || '(406) 555-0123'}
      </a>
    </div>
    
    <p>Thanks,<br>
    <strong>Curl Feather Inc</strong></p>
  </div>
</body>
</html>`;
}

/**
 * Format services for display
 */
function formatServices(services: any): string {
  const serviceList = [];
  if (services.installation) serviceList.push('Installation');
  if (services.taping) serviceList.push('Taping & Finishing');
  if (services.texture) serviceList.push(`${services.texture} Texture`);
  return serviceList.join(', ') || 'Standard Services';
}

/**
 * Strip HTML tags for plain text version
 */
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}