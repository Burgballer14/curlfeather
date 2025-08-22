/**
 * Performance Monitoring System
 * Tracks page load times, conversion rates, and system performance
 */

export interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  page?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export interface PagePerformance {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface ConversionMetrics {
  page: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  topExitPoints: string[];
}

export interface SystemMetrics {
  apiResponseTime: number;
  dbQueryTime: number;
  errorRate: number;
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private pageViews: Map<string, number> = new Map();
  private conversions: Map<string, number> = new Map();
  private sessionStartTimes: Map<string, number> = new Map();

  /**
   * Track Web Vitals and page performance
   */
  trackWebVitals(): PagePerformance | null {
    if (typeof window === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');
    
    const pagePerformance: PagePerformance = {
      url: window.location.href,
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      firstContentfulPaint: this.getMetricValue(paintEntries, 'first-contentful-paint'),
      largestContentfulPaint: 0, // Will be updated by observer
      cumulativeLayoutShift: 0, // Will be updated by observer
      firstInputDelay: 0, // Will be updated by observer
      timeToInteractive: navigation.domInteractive - navigation.fetchStart
    };

    // Set up observers for advanced metrics
    this.setupWebVitalsObservers();

    this.addMetric({
      id: `page_load_${Date.now()}`,
      name: 'page_load_time',
      value: pagePerformance.loadTime,
      unit: 'ms',
      timestamp: new Date(),
      page: window.location.pathname,
      userAgent: navigator.userAgent
    });

    return pagePerformance;
  }

  /**
   * Setup observers for advanced Web Vitals
   */
  private setupWebVitalsObservers() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.addMetric({
        id: `lcp_${Date.now()}`,
        name: 'largest_contentful_paint',
        value: lastEntry.startTime,
        unit: 'ms',
        timestamp: new Date(),
        page: window.location.pathname
      });
    });

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported in this browser
    }

    // Cumulative Layout Shift
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0;
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }

      this.addMetric({
        id: `cls_${Date.now()}`,
        name: 'cumulative_layout_shift',
        value: clsValue,
        unit: 'score',
        timestamp: new Date(),
        page: window.location.pathname
      });
    });

    try {
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // CLS not supported in this browser
    }

    // First Input Delay
    const fidObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.addMetric({
          id: `fid_${Date.now()}`,
          name: 'first_input_delay',
          value: (entry as any).processingStart - entry.startTime,
          unit: 'ms',
          timestamp: new Date(),
          page: window.location.pathname
        });
      }
    });

    try {
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // FID not supported in this browser
    }
  }

  /**
   * Track API response times
   */
  trackAPIPerformance(endpoint: string, startTime: number, endTime: number, success: boolean) {
    const responseTime = endTime - startTime;

    this.addMetric({
      id: `api_${Date.now()}`,
      name: 'api_response_time',
      value: responseTime,
      unit: 'ms',
      timestamp: new Date(),
      metadata: {
        endpoint,
        success,
        status: success ? 'success' : 'error'
      }
    });
  }

  /**
   * Track form conversion funnel
   */
  trackFormStep(step: string, formId: string, sessionId: string) {
    this.addMetric({
      id: `form_step_${Date.now()}`,
      name: 'form_step_completion',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      sessionId,
      metadata: {
        step,
        formId,
        funnel_position: step
      }
    });
  }

  /**
   * Track page view and session metrics
   */
  trackPageView(path: string, sessionId: string) {
    const currentViews = this.pageViews.get(path) || 0;
    this.pageViews.set(path, currentViews + 1);

    this.sessionStartTimes.set(sessionId, Date.now());

    this.addMetric({
      id: `page_view_${Date.now()}`,
      name: 'page_view',
      value: 1,
      unit: 'count',
      timestamp: new Date(),
      page: path,
      sessionId
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(type: string, value: number, sessionId: string, metadata?: Record<string, any>) {
    const conversions = this.conversions.get(type) || 0;
    this.conversions.set(type, conversions + 1);

    this.addMetric({
      id: `conversion_${Date.now()}`,
      name: 'conversion',
      value: value,
      unit: 'currency',
      timestamp: new Date(),
      sessionId,
      metadata: {
        conversionType: type,
        ...metadata
      }
    });
  }

  /**
   * Calculate conversion rates
   */
  getConversionMetrics(page: string): ConversionMetrics {
    const pageViews = this.pageViews.get(page) || 0;
    const conversionCount = this.metrics.filter(m => 
      m.name === 'conversion' && m.page === page
    ).length;

    const sessionMetrics = this.getSessionMetrics(page);

    return {
      page,
      visitors: pageViews,
      conversions: conversionCount,
      conversionRate: pageViews > 0 ? (conversionCount / pageViews) * 100 : 0,
      bounceRate: sessionMetrics.bounceRate,
      avgTimeOnPage: sessionMetrics.avgTimeOnPage,
      topExitPoints: sessionMetrics.topExitPoints
    };
  }

  /**
   * Get system performance metrics
   */
  getSystemMetrics(): SystemMetrics {
    const apiMetrics = this.metrics.filter(m => m.name === 'api_response_time');
    const errorCount = this.metrics.filter(m => 
      m.metadata?.success === false
    ).length;

    const avgResponseTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.value, 0) / apiMetrics.length
      : 0;

    return {
      apiResponseTime: Math.round(avgResponseTime),
      dbQueryTime: 0, // Would be tracked separately
      errorRate: apiMetrics.length > 0 ? (errorCount / apiMetrics.length) * 100 : 0,
      uptime: 99.9, // Would be calculated from uptime monitoring
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: 0 // Would require server-side monitoring
    };
  }

  /**
   * Get Core Web Vitals summary
   */
  getWebVitalsSummary() {
    const lcpMetrics = this.metrics.filter(m => m.name === 'largest_contentful_paint');
    const fidMetrics = this.metrics.filter(m => m.name === 'first_input_delay');
    const clsMetrics = this.metrics.filter(m => m.name === 'cumulative_layout_shift');

    return {
      lcp: {
        value: lcpMetrics.length > 0 ? lcpMetrics[lcpMetrics.length - 1].value : 0,
        threshold: 2500,
        status: lcpMetrics.length > 0 && lcpMetrics[lcpMetrics.length - 1].value < 2500 ? 'good' : 'needs_improvement'
      },
      fid: {
        value: fidMetrics.length > 0 ? fidMetrics[fidMetrics.length - 1].value : 0,
        threshold: 100,
        status: fidMetrics.length > 0 && fidMetrics[fidMetrics.length - 1].value < 100 ? 'good' : 'needs_improvement'
      },
      cls: {
        value: clsMetrics.length > 0 ? clsMetrics[clsMetrics.length - 1].value : 0,
        threshold: 0.1,
        status: clsMetrics.length > 0 && clsMetrics[clsMetrics.length - 1].value < 0.1 ? 'good' : 'needs_improvement'
      }
    };
  }

  /**
   * Performance optimization recommendations
   */
  getOptimizationRecommendations() {
    const webVitals = this.getWebVitalsSummary();
    const systemMetrics = this.getSystemMetrics();
    const recommendations: string[] = [];

    if (webVitals.lcp.status !== 'good') {
      recommendations.push('Optimize Largest Contentful Paint: Compress images, use CDN, optimize server response time');
    }

    if (webVitals.fid.status !== 'good') {
      recommendations.push('Reduce First Input Delay: Minimize JavaScript execution time, break up long tasks');
    }

    if (webVitals.cls.status !== 'good') {
      recommendations.push('Improve Cumulative Layout Shift: Set image dimensions, avoid dynamic content insertion');
    }

    if (systemMetrics.apiResponseTime > 1000) {
      recommendations.push('Optimize API response times: Add caching, optimize database queries, use connection pooling');
    }

    if (systemMetrics.errorRate > 5) {
      recommendations.push('Reduce error rate: Improve error handling, add validation, monitor third-party services');
    }

    return recommendations;
  }

  // Private helper methods
  private addMetric(metric: Omit<PerformanceMetric, 'id'> & { id: string }) {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  private getMetricValue(entries: PerformanceEntry[], name: string): number {
    const entry = entries.find(e => e.name === name);
    return entry ? entry.startTime : 0;
  }

  private getSessionMetrics(page: string) {
    // Simplified session metrics calculation
    return {
      bounceRate: 35, // Would be calculated from actual session data
      avgTimeOnPage: 120000, // 2 minutes in ms
      topExitPoints: ['/quote', '/contact'] // Would be calculated from exit data
    };
  }

  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / memory.totalJSHeapSize) * 100);
    }
    return 0;
  }

  /**
   * Export metrics for analytics
   */
  exportMetrics(startDate?: Date, endDate?: Date) {
    let filteredMetrics = this.metrics;
    
    if (startDate || endDate) {
      filteredMetrics = this.metrics.filter(metric => {
        const metricDate = metric.timestamp;
        if (startDate && metricDate < startDate) return false;
        if (endDate && metricDate > endDate) return false;
        return true;
      });
    }

    return {
      metrics: filteredMetrics,
      summary: {
        totalMetrics: filteredMetrics.length,
        dateRange: {
          start: startDate?.toISOString(),
          end: endDate?.toISOString()
        },
        webVitals: this.getWebVitalsSummary(),
        systemMetrics: this.getSystemMetrics(),
        recommendations: this.getOptimizationRecommendations()
      }
    };
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();