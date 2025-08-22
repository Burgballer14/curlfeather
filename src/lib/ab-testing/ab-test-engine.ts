/**
 * A/B Testing Engine for Conversion Rate Optimization
 * Handles test creation, variant assignment, and results tracking
 */

export interface ABTestVariant {
  id: string;
  name: string;
  description: string;
  config: Record<string, any>;
  traffic: number; // percentage of traffic (0-100)
  active: boolean;
}

export interface ABTest {
  id: string;
  name: string;
  description: string;
  type: 'landing_page' | 'quote_form' | 'chatbot' | 'cta_button' | 'pricing_display';
  status: 'draft' | 'running' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  variants: ABTestVariant[];
  goals: string[]; // conversion goals to track
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTestResult {
  testId: string;
  variantId: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  conversions: Record<string, boolean>; // goal_name: achieved
  metadata?: Record<string, any>;
}

export interface ABTestMetrics {
  variantId: string;
  variantName: string;
  impressions: number;
  conversions: Record<string, number>;
  conversionRates: Record<string, number>;
  confidence: number;
  isWinner?: boolean;
}

class ABTestEngine {
  private tests: Map<string, ABTest> = new Map();
  private results: ABTestResult[] = [];
  private userAssignments: Map<string, Map<string, string>> = new Map(); // userId -> testId -> variantId

  constructor() {
    this.initializeDefaultTests();
  }

  /**
   * Initialize default A/B tests for the drywall contractor business
   */
  private initializeDefaultTests() {
    // Landing Page Hero Section Test
    this.createTest({
      id: 'hero_section_test',
      name: 'Hero Section Optimization',
      description: 'Test different hero section approaches for better engagement',
      type: 'landing_page',
      variants: [
        {
          id: 'hero_control',
          name: 'Control - Problem Focused',
          description: 'Current hero focusing on drywall problems',
          config: {
            headline: 'Professional Drywall Services in Bozeman',
            subheadline: 'Get your drywall project done right the first time',
            ctaText: 'Get Free Quote',
            backgroundImage: 'professional',
            emphasizeSpeed: false
          },
          traffic: 50,
          active: true
        },
        {
          id: 'hero_speed',
          name: 'Variant A - Speed Focused', 
          description: 'Hero emphasizing fast response and completion',
          config: {
            headline: 'Same-Day Drywall Estimates in Bozeman',
            subheadline: 'Fast response, quality work, competitive pricing',
            ctaText: 'Get Instant Quote',
            backgroundImage: 'action',
            emphasizeSpeed: true
          },
          traffic: 50,
          active: true
        }
      ],
      goals: ['quote_form_start', 'quote_form_complete', 'chatbot_engagement'],
      startDate: new Date(),
      status: 'running'
    });

    // Quote Form Layout Test
    this.createTest({
      id: 'quote_form_layout',
      name: 'Quote Form Layout Optimization',
      description: 'Test single-page vs multi-step form approach',
      type: 'quote_form',
      variants: [
        {
          id: 'form_multistep',
          name: 'Control - Multi-Step',
          description: 'Current multi-step progressive disclosure',
          config: {
            layout: 'multi_step',
            steps: 4,
            progressBar: true,
            stepTitles: ['Project Type', 'Room Details', 'Timeline', 'Contact Info']
          },
          traffic: 50,
          active: true
        },
        {
          id: 'form_single',
          name: 'Variant A - Single Page',
          description: 'All form fields on one page',
          config: {
            layout: 'single_page',
            compactMode: true,
            sectionHeaders: true,
            estimatePreview: true
          },
          traffic: 50,
          active: true
        }
      ],
      goals: ['form_completion', 'form_abandonment_rate', 'lead_quality_score'],
      startDate: new Date(),
      status: 'running'
    });

    // CTA Button Test
    this.createTest({
      id: 'cta_button_test',
      name: 'Call-to-Action Button Optimization',
      description: 'Test different CTA button text and styling',
      type: 'cta_button',
      variants: [
        {
          id: 'cta_control',
          name: 'Control - Get Free Quote',
          description: 'Current CTA text',
          config: {
            text: 'Get Free Quote',
            color: 'blue',
            size: 'large',
            urgency: false
          },
          traffic: 33,
          active: true
        },
        {
          id: 'cta_urgency',
          name: 'Variant A - Urgency',
          description: 'CTA with urgency messaging',
          config: {
            text: 'Get Same-Day Estimate',
            color: 'green',
            size: 'large',
            urgency: true,
            subtext: 'Response within 2 hours'
          },
          traffic: 33,
          active: true
        },
        {
          id: 'cta_value',
          name: 'Variant B - Value Prop',
          description: 'CTA emphasizing free service',
          config: {
            text: 'Free Estimate + Quote',
            color: 'orange',
            size: 'large',
            subtext: 'No hidden fees'
          },
          traffic: 34,
          active: true
        }
      ],
      goals: ['cta_click', 'quote_form_start'],
      startDate: new Date(),
      status: 'running'
    });
  }

  /**
   * Create a new A/B test
   */
  createTest(testData: Omit<ABTest, 'createdAt' | 'updatedAt'>): ABTest {
    const test: ABTest = {
      ...testData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.tests.set(test.id, test);
    return test;
  }

  /**
   * Get variant assignment for a user
   */
  getVariantForUser(testId: string, userId: string): ABTestVariant | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'running') {
      return null;
    }

    // Check if user already has assignment
    const userAssignments = this.userAssignments.get(userId);
    if (userAssignments?.has(testId)) {
      const variantId = userAssignments.get(testId)!;
      return test.variants.find(v => v.id === variantId) || null;
    }

    // Assign variant based on traffic allocation
    const variant = this.assignVariant(test, userId);
    
    // Store assignment
    if (!this.userAssignments.has(userId)) {
      this.userAssignments.set(userId, new Map());
    }
    this.userAssignments.get(userId)!.set(testId, variant.id);

    return variant;
  }

  /**
   * Assign variant based on traffic allocation and user hash
   */
  private assignVariant(test: ABTest, userId: string): ABTestVariant {
    const activeVariants = test.variants.filter(v => v.active);
    
    // Simple hash-based assignment for consistent user experience
    const hash = this.hashString(userId + test.id);
    const bucket = hash % 100;
    
    let cumulativeTraffic = 0;
    for (const variant of activeVariants) {
      cumulativeTraffic += variant.traffic;
      if (bucket < cumulativeTraffic) {
        return variant;
      }
    }
    
    // Fallback to first variant
    return activeVariants[0];
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track conversion for A/B test
   */
  trackConversion(
    testId: string,
    variantId: string,
    userId: string,
    sessionId: string,
    goal: string,
    metadata?: Record<string, any>
  ): void {
    const existingResult = this.results.find(r => 
      r.testId === testId && 
      r.userId === userId && 
      r.sessionId === sessionId
    );

    if (existingResult) {
      // Update existing result
      existingResult.conversions[goal] = true;
      if (metadata) {
        existingResult.metadata = { ...existingResult.metadata, ...metadata };
      }
    } else {
      // Create new result
      const result: ABTestResult = {
        testId,
        variantId,
        userId,
        sessionId,
        timestamp: new Date(),
        conversions: { [goal]: true },
        metadata
      };
      this.results.push(result);
    }
  }

  /**
   * Get test results and metrics
   */
  getTestMetrics(testId: string): ABTestMetrics[] {
    const test = this.tests.get(testId);
    if (!test) return [];

    const testResults = this.results.filter(r => r.testId === testId);
    const metrics: ABTestMetrics[] = [];

    for (const variant of test.variants) {
      const variantResults = testResults.filter(r => r.variantId === variant.id);
      const impressions = variantResults.length;
      
      const conversions: Record<string, number> = {};
      const conversionRates: Record<string, number> = {};
      
      for (const goal of test.goals) {
        const goalConversions = variantResults.filter(r => r.conversions[goal]).length;
        conversions[goal] = goalConversions;
        conversionRates[goal] = impressions > 0 ? (goalConversions / impressions) * 100 : 0;
      }

      metrics.push({
        variantId: variant.id,
        variantName: variant.name,
        impressions,
        conversions,
        conversionRates,
        confidence: this.calculateConfidence(variant.id, testId)
      });
    }

    // Determine winner based on primary goal (first goal)
    if (test.goals.length > 0) {
      const primaryGoal = test.goals[0];
      const sortedMetrics = metrics.sort((a, b) => 
        b.conversionRates[primaryGoal] - a.conversionRates[primaryGoal]
      );
      
      if (sortedMetrics.length > 0) {
        sortedMetrics[0].isWinner = true;
      }
    }

    return metrics;
  }

  /**
   * Calculate statistical confidence (simplified)
   */
  private calculateConfidence(variantId: string, testId: string): number {
    // Simplified confidence calculation
    // In production, you'd use proper statistical methods
    const variantResults = this.results.filter(r => 
      r.testId === testId && r.variantId === variantId
    );
    
    const sampleSize = variantResults.length;
    if (sampleSize < 30) return 0;
    if (sampleSize < 100) return 60;
    if (sampleSize < 500) return 80;
    return 95;
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTest[] {
    return Array.from(this.tests.values()).filter(test => test.status === 'running');
  }

  /**
   * Get specific test
   */
  getTest(testId: string): ABTest | null {
    return this.tests.get(testId) || null;
  }

  /**
   * Update test status
   */
  updateTestStatus(testId: string, status: ABTest['status']): boolean {
    const test = this.tests.get(testId);
    if (!test) return false;

    test.status = status;
    test.updatedAt = new Date();
    return true;
  }

  /**
   * Generate user session ID for consistent experience
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique user ID for tracking
   */
  generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Global A/B testing engine instance
export const abTestEngine = new ABTestEngine();