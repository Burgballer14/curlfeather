/**
 * Google Ads Enhanced Conversion Tracking
 * Implements comprehensive conversion tracking for lead generation campaigns
 */

export interface ConversionEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  currency?: string;
  transaction_id?: string;
  customer_data?: {
    email?: string;
    phone?: string;
    address?: {
      first_name?: string;
      last_name?: string;
      street?: string;
      city?: string;
      region?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface GoogleAdsConfig {
  conversionId: string;
  conversionLabel: string;
  analyticsId: string;
  enhancedConversions: boolean;
}

/**
 * Initialize Google Ads tracking
 */
export function initializeGoogleAds(config: GoogleAdsConfig): void {
  if (typeof window === 'undefined') return;

  // Load Google Tag Manager script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${config.conversionId}`;
  document.head.appendChild(script);

  // Initialize gtag
  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(arguments);
  }
  (window as any).gtag = gtag;

  gtag('js', new Date());
  gtag('config', config.conversionId, {
    enhanced_conversions: config.enhancedConversions
  });

  // Initialize Google Analytics 4 if provided
  if (config.analyticsId) {
    gtag('config', config.analyticsId);
  }
}

/**
 * Track conversion with enhanced data
 */
export function trackConversion(event: ConversionEvent): void {
  if (typeof window === 'undefined' || !(window as any).gtag) {
    console.log('Google Ads tracking not initialized. Event would be tracked:', event);
    return;
  }

  const gtag = (window as any).gtag;

  // Track conversion event
  gtag('event', 'conversion', {
    send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID}/${process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL}`,
    value: event.value || 0,
    currency: event.currency || 'USD',
    transaction_id: event.transaction_id,
    event_category: event.category || 'lead_generation',
    event_label: event.label,
    enhanced_conversion_data: event.customer_data
  });

  // Track as Google Analytics event
  gtag('event', event.action, {
    event_category: event.category || 'lead_generation',
    event_label: event.label,
    value: event.value,
    currency: event.currency || 'USD'
  });

  console.log('Conversion tracked:', event);
}

/**
 * Predefined conversion events for drywall business
 */
export const ConversionEvents = {
  // Lead Generation Events
  QUOTE_FORM_STARTED: {
    action: 'quote_form_started',
    category: 'lead_generation',
    label: 'Multi-step quote form initiated'
  },

  QUOTE_FORM_STEP_COMPLETED: {
    action: 'quote_form_step_completed',
    category: 'lead_generation',
    label: 'Quote form step progression'
  },

  QUOTE_SUBMITTED: {
    action: 'quote_submitted',
    category: 'lead_generation',
    label: 'Complete quote form submission'
  },

  // Contact Events
  PHONE_CLICK: {
    action: 'phone_click',
    category: 'contact',
    label: 'Phone number clicked'
  },

  EMAIL_CLICK: {
    action: 'email_click',
    category: 'contact',
    label: 'Email address clicked'
  },

  // Engagement Events
  SERVICE_INTEREST: {
    action: 'service_interest',
    category: 'engagement',
    label: 'Service card clicked'
  },

  CTA_CLICK: {
    action: 'cta_click',
    category: 'engagement',
    label: 'Call-to-action clicked'
  },

  // High-Value Events
  HIGH_VALUE_LEAD: {
    action: 'high_value_lead',
    category: 'lead_quality',
    label: 'Lead with $5000+ estimated value'
  },

  PRIORITY_LEAD: {
    action: 'priority_lead',
    category: 'lead_quality',
    label: 'Lead with 80+ score'
  }
} as const;

/**
 * Track specific business events
 */
export class DrywallBusinessTracker {
  private static instance: DrywallBusinessTracker;

  private constructor() {}

  static getInstance(): DrywallBusinessTracker {
    if (!DrywallBusinessTracker.instance) {
      DrywallBusinessTracker.instance = new DrywallBusinessTracker();
    }
    return DrywallBusinessTracker.instance;
  }

  /**
   * Track quote form initiation
   */
  trackQuoteFormStarted(): void {
    trackConversion({
      ...ConversionEvents.QUOTE_FORM_STARTED,
      value: 50 // Estimated value of a quote form start
    });
  }

  /**
   * Track quote form step completion
   */
  trackQuoteFormStep(step: number, totalSteps: number): void {
    trackConversion({
      ...ConversionEvents.QUOTE_FORM_STEP_COMPLETED,
      label: `Step ${step} of ${totalSteps} completed`,
      value: (step / totalSteps) * 100 // Progress percentage
    });
  }

  /**
   * Track complete quote submission
   */
  trackQuoteSubmission(data: {
    leadId: string;
    estimatedValue: number;
    leadScore: number;
    projectType: string;
    customerData?: {
      email?: string;
      phone?: string;
      name?: string;
      address?: string;
    };
  }): void {
    // Main conversion event
    trackConversion({
      ...ConversionEvents.QUOTE_SUBMITTED,
      value: data.estimatedValue,
      transaction_id: data.leadId,
      customer_data: data.customerData ? {
        email: data.customerData.email,
        phone: data.customerData.phone?.replace(/\D/g, ''), // Clean phone number
        address: data.customerData.name ? {
          first_name: data.customerData.name.split(' ')[0],
          last_name: data.customerData.name.split(' ').slice(1).join(' '),
          street: data.customerData.address?.split(',')[0],
          city: data.customerData.address?.split(',')[1]?.trim(),
          region: 'MT',
          country: 'US'
        } : undefined
      } : undefined
    });

    // Track high-value leads separately
    if (data.estimatedValue >= 5000) {
      trackConversion({
        ...ConversionEvents.HIGH_VALUE_LEAD,
        value: data.estimatedValue,
        transaction_id: data.leadId,
        label: `High-value ${data.projectType} project`
      });
    }

    // Track priority leads
    if (data.leadScore >= 80) {
      trackConversion({
        ...ConversionEvents.PRIORITY_LEAD,
        value: data.estimatedValue,
        transaction_id: data.leadId,
        label: `Priority lead score: ${data.leadScore}`
      });
    }
  }

  /**
   * Track phone number clicks
   */
  trackPhoneClick(source: string = 'header'): void {
    trackConversion({
      ...ConversionEvents.PHONE_CLICK,
      label: `Phone clicked from ${source}`,
      value: 25 // Value of a phone interaction
    });
  }

  /**
   * Track email clicks
   */
  trackEmailClick(source: string = 'header'): void {
    trackConversion({
      ...ConversionEvents.EMAIL_CLICK,
      label: `Email clicked from ${source}`,
      value: 15 // Value of an email interaction
    });
  }

  /**
   * Track service interest
   */
  trackServiceInterest(serviceName: string): void {
    trackConversion({
      ...ConversionEvents.SERVICE_INTEREST,
      label: `Interest in ${serviceName}`,
      value: 10 // Value of service interest
    });
  }

  /**
   * Track call-to-action clicks
   */
  trackCTAClick(ctaType: string, location: string): void {
    trackConversion({
      ...ConversionEvents.CTA_CLICK,
      label: `${ctaType} CTA clicked from ${location}`,
      value: 20 // Value of CTA interaction
    });
  }
}

/**
 * Enhanced conversion tracking for better attribution
 */
export function setupEnhancedConversions(): void {
  if (typeof window === 'undefined') return;

  const gtag = (window as any).gtag;
  if (!gtag) return;

  // Configure enhanced conversions
  gtag('config', process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID, {
    enhanced_conversions: true,
    allow_enhanced_conversions: true
  });
}

/**
 * Track offline conversions (for phone calls that convert)
 */
export function trackOfflineConversion(data: {
  conversionTime: string;
  conversionValue: number;
  customerEmail?: string;
  customerPhone?: string;
  orderId: string;
}): void {
  // This would typically be sent to Google Ads via the API
  // For now, log the data for manual upload
  console.log('Offline conversion data for Google Ads upload:', {
    conversion_name: 'Phone Call Conversion',
    conversion_time: data.conversionTime,
    conversion_value: data.conversionValue,
    conversion_currency: 'USD',
    click_id: '', // Would need to be captured from URL
    order_id: data.orderId,
    custom_variables: {
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone
    }
  });
}

/**
 * Export singleton instance for easy access
 */
export const businessTracker = DrywallBusinessTracker.getInstance();