'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';
import { useHeroSectionTest, useCTAButtonTest, useQuoteFormTest } from '@/hooks/useABTesting';

interface ConversionOptimizerProps {
  children: React.ReactNode;
  testId?: string;
  sessionId?: string;
}

export default function ConversionOptimizer({ 
  children, 
  testId = 'main_page', 
  sessionId 
}: ConversionOptimizerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [sessionStartTime] = useState(Date.now());

  const { config: heroConfig, trackConversion: trackHeroConversion } = useHeroSectionTest();
  const { config: ctaConfig, trackConversion: trackCTAConversion } = useCTAButtonTest();
  const { config: formConfig, trackConversion: trackFormConversion } = useQuoteFormTest();

  useEffect(() => {
    // Initialize performance tracking
    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Track page view
    performanceMonitor.trackPageView(window.location.pathname, currentSessionId);
    
    // Track Web Vitals
    performanceMonitor.trackWebVitals();
    
    setIsTracking(true);

    // Track page exit
    const handleBeforeUnload = () => {
      const timeOnPage = Date.now() - sessionStartTime;
      performanceMonitor.trackPageView(`${window.location.pathname}_exit`, currentSessionId);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sessionId, sessionStartTime]);

  const trackEvent = (eventType: string, metadata?: Record<string, any>) => {
    if (!isTracking) return;

    const currentSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    switch (eventType) {
      case 'hero_cta_click':
        trackHeroConversion('cta_click', metadata);
        trackCTAConversion('cta_click', metadata);
        break;
      case 'form_start':
        trackFormConversion('form_start', metadata);
        performanceMonitor.trackFormStep('start', 'quote_form', currentSessionId);
        break;
      case 'form_step':
        trackFormConversion('form_step', metadata);
        performanceMonitor.trackFormStep(metadata?.step || 'unknown', 'quote_form', currentSessionId);
        break;
      case 'form_complete':
        trackFormConversion('form_completion', metadata);
        performanceMonitor.trackConversion('quote_form', metadata?.estimatedValue || 0, currentSessionId, metadata);
        break;
      case 'chatbot_engage':
        performanceMonitor.trackConversion('chatbot_interaction', 1, currentSessionId, metadata);
        break;
      case 'appointment_book':
        performanceMonitor.trackConversion('appointment_booking', metadata?.estimatedValue || 0, currentSessionId, metadata);
        break;
    }

    // Track with Google Ads
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventType, {
        event_category: 'conversion_optimization',
        event_label: testId,
        value: metadata?.value || 1
      });
    }
  };

  return (
    <ConversionContext.Provider value={{ 
      trackEvent, 
      heroConfig, 
      ctaConfig, 
      formConfig,
      isTracking 
    }}>
      {children}
    </ConversionContext.Provider>
  );
}

// Conversion Context for child components
import { createContext, useContext } from 'react';

interface ConversionContextType {
  trackEvent: (eventType: string, metadata?: Record<string, any>) => void;
  heroConfig: any;
  ctaConfig: any;
  formConfig: any;
  isTracking: boolean;
}

const ConversionContext = createContext<ConversionContextType | null>(null);

export function useConversionTracking() {
  const context = useContext(ConversionContext);
  if (!context) {
    throw new Error('useConversionTracking must be used within ConversionOptimizer');
  }
  return context;
}

// Enhanced CTA Button with A/B testing
export function OptimizedCTAButton({ 
  onClick, 
  className = '', 
  children,
  testId = 'main_cta'
}: {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
  testId?: string;
}) {
  const { trackEvent, ctaConfig } = useConversionTracking();

  const handleClick = () => {
    trackEvent('hero_cta_click', { testId, buttonText: ctaConfig.text });
    onClick?.();
  };

  const baseClasses = 'px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105';
  
  const colorClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700 text-white',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    orange: 'bg-orange-600 hover:bg-orange-700 text-white',
    red: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`
          ${baseClasses}
          ${colorClasses[ctaConfig.color as keyof typeof colorClasses] || colorClasses.blue}
          ${sizeClasses[ctaConfig.size as keyof typeof sizeClasses] || sizeClasses.medium}
          ${className}
        `}
      >
        {children || ctaConfig.text || 'Get Free Quote'}
      </button>
      
      {ctaConfig.urgency && ctaConfig.subtext && (
        <div className="absolute -bottom-6 left-0 right-0 text-center">
          <span className="text-xs text-gray-600 bg-yellow-100 px-2 py-1 rounded">
            {ctaConfig.subtext}
          </span>
        </div>
      )}
    </div>
  );
}

// Form Progress Tracker
export function FormProgressTracker({ 
  currentStep, 
  totalSteps, 
  formId = 'quote_form' 
}: {
  currentStep: number;
  totalSteps: number;
  formId?: string;
}) {
  const { trackEvent, formConfig } = useConversionTracking();

  useEffect(() => {
    trackEvent('form_step', {
      step: `step_${currentStep}`,
      formId,
      progress: (currentStep / totalSteps) * 100
    });
  }, [currentStep, totalSteps, formId, trackEvent]);

  if (!formConfig.progressBar) return null;

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="flex justify-between mt-2 text-sm text-gray-600">
        <span>Step {currentStep} of {totalSteps}</span>
        <span>{Math.round(progress)}% Complete</span>
      </div>
    </div>
  );
}

// Exit Intent Detector
export function ExitIntentDetector({ 
  onExitIntent,
  children 
}: {
  onExitIntent: () => void;
  children: React.ReactNode;
}) {
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggered) {
        setHasTriggered(true);
        onExitIntent();
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasTriggered, onExitIntent]);

  return <>{children}</>;
}

// Conversion Rate Display (for testing)
export function ConversionRateDisplay() {
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const conversionMetrics = performanceMonitor.getConversionMetrics(window.location.pathname);
      const webVitals = performanceMonitor.getWebVitalsSummary();
      setMetrics({ conversionMetrics, webVitals });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (!metrics || process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs z-50">
      <h4 className="font-bold mb-2">Live Metrics</h4>
      <div>Conversion Rate: {metrics.conversionMetrics.conversionRate.toFixed(2)}%</div>
      <div>Page Views: {metrics.conversionMetrics.visitors}</div>
      <div>LCP: {metrics.webVitals.lcp.value.toFixed(0)}ms</div>
      <div>CLS: {metrics.webVitals.cls.value.toFixed(3)}</div>
    </div>
  );
}