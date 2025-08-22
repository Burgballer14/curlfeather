'use client';

import React, { useState, useEffect } from 'react';
import { ABTestVariant } from '@/lib/ab-testing/ab-test-engine';

interface UseABTestingReturn {
  variant: ABTestVariant | null;
  isLoading: boolean;
  trackConversion: (goal: string, metadata?: Record<string, any>) => void;
}

export function useABTesting(testId: string): UseABTestingReturn {
  const [variant, setVariant] = useState<ABTestVariant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Get or create user ID
    let storedUserId = localStorage.getItem('ab_test_user_id');
    if (!storedUserId) {
      storedUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ab_test_user_id', storedUserId);
    }
    setUserId(storedUserId);

    // Generate session ID
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(newSessionId);

    // Get variant assignment
    fetchVariant(testId, storedUserId);
  }, [testId]);

  const fetchVariant = async (testId: string, userId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ab-testing/variant?testId=${testId}&userId=${userId}`);
      const data = await response.json();
      
      if (data.success && data.variant) {
        setVariant(data.variant);
      }
    } catch (error) {
      console.error('Failed to fetch A/B test variant:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const trackConversion = async (goal: string, metadata?: Record<string, any>) => {
    if (!variant || !userId || !sessionId) return;

    try {
      await fetch('/api/ab-testing/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          variantId: variant.id,
          userId,
          sessionId,
          goal,
          metadata
        })
      });

      // Track with Google Ads if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'ab_test_conversion', {
          event_category: 'ab_testing',
          event_label: `${testId}_${variant.id}_${goal}`,
          value: 1
        });
      }
    } catch (error) {
      console.error('Failed to track A/B test conversion:', error);
    }
  };

  return {
    variant,
    isLoading,
    trackConversion
  };
}

/**
 * Hook for hero section A/B testing
 */
export function useHeroSectionTest() {
  const { variant, isLoading, trackConversion } = useABTesting('hero_section_test');
  
  const config = variant?.config || {
    headline: 'Professional Drywall Services in Bozeman',
    subheadline: 'Get your drywall project done right the first time',
    ctaText: 'Get Free Quote',
    backgroundImage: 'professional',
    emphasizeSpeed: false
  };

  return {
    config,
    isLoading,
    trackConversion,
    variantId: variant?.id
  };
}

/**
 * Hook for quote form layout A/B testing
 */
export function useQuoteFormTest() {
  const { variant, isLoading, trackConversion } = useABTesting('quote_form_layout');
  
  const config = variant?.config || {
    layout: 'multi_step',
    steps: 4,
    progressBar: true,
    stepTitles: ['Project Type', 'Room Details', 'Timeline', 'Contact Info']
  };

  return {
    config,
    isLoading,
    trackConversion,
    variantId: variant?.id
  };
}

/**
 * Hook for CTA button A/B testing
 */
export function useCTAButtonTest() {
  const { variant, isLoading, trackConversion } = useABTesting('cta_button_test');
  
  const config = variant?.config || {
    text: 'Get Free Quote',
    color: 'blue',
    size: 'large',
    urgency: false
  };

  return {
    config,
    isLoading,
    trackConversion,
    variantId: variant?.id
  };
}

/**
 * Simple A/B testing utility functions
 */
export function getABTestConfig(testId: string, userId?: string) {
  // This would typically call the API, but for now return a simple config
  const configs = {
    hero_section_test: {
      headline: 'Professional Drywall Services in Bozeman',
      subheadline: 'Get your drywall project done right the first time',
      ctaText: 'Get Free Quote',
      backgroundImage: 'professional',
      emphasizeSpeed: false
    },
    quote_form_layout: {
      layout: 'multi_step',
      steps: 4,
      progressBar: true,
      stepTitles: ['Project Type', 'Room Details', 'Timeline', 'Contact Info']
    },
    cta_button_test: {
      text: 'Get Free Quote',
      color: 'blue',
      size: 'large',
      urgency: false
    }
  };
  
  return configs[testId as keyof typeof configs] || {};
}