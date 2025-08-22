'use client';

import { useEffect } from 'react';
import { initializeGoogleAds, setupEnhancedConversions } from '@/lib/tracking/google-ads';

interface GoogleAdsTrackingProps {
  conversionId?: string;
  conversionLabel?: string;
  analyticsId?: string;
}

export default function GoogleAdsTracking({
  conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID,
  conversionLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_LABEL,
  analyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
}: GoogleAdsTrackingProps) {
  useEffect(() => {
    // Only initialize if we have the required environment variables
    if (!conversionId || !analyticsId) {
      console.log('Google Ads tracking not configured - missing environment variables');
      return;
    }

    try {
      // Initialize Google Ads tracking
      initializeGoogleAds({
        conversionId,
        conversionLabel: conversionLabel || '',
        analyticsId,
        enhancedConversions: true
      });

      // Set up enhanced conversions for better attribution
      setupEnhancedConversions();

      console.log('Google Ads tracking initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Ads tracking:', error);
    }
  }, [conversionId, conversionLabel, analyticsId]);

  // This component doesn't render anything visible
  return null;
}