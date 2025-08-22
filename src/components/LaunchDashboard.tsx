'use client';

import { useState, useEffect } from 'react';
import { performanceMonitor } from '@/lib/performance/performance-monitor';

interface LaunchChecklist {
  category: string;
  items: {
    id: string;
    title: string;
    description: string;
    status: 'completed' | 'in_progress' | 'pending' | 'failed';
    priority: 'high' | 'medium' | 'low';
    automated?: boolean;
  }[];
}

interface CampaignMetrics {
  estimatedDailyBudget: number;
  expectedDailyLeads: number;
  targetCostPerLead: number;
  conversionRateGoal: number;
  revenueProjection: number;
}

export default function LaunchDashboard() {
  const [checklist, setChecklist] = useState<LaunchChecklist[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [campaignMetrics, setCampaignMetrics] = useState<CampaignMetrics>({
    estimatedDailyBudget: 150,
    expectedDailyLeads: 8,
    targetCostPerLead: 18.75,
    conversionRateGoal: 35,
    revenueProjection: 2800
  });
  const [launchReady, setLaunchReady] = useState(false);

  useEffect(() => {
    initializeLaunchChecklist();
    checkSystemHealth();
  }, []);

  const initializeLaunchChecklist = () => {
    const checklistData: LaunchChecklist[] = [
      {
        category: 'Technical Infrastructure',
        items: [
          {
            id: 'next_js_setup',
            title: 'Next.js 14 Platform',
            description: 'Modern React framework with TypeScript and App Router',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'automation_system',
            title: 'SMS/Email Automation',
            description: 'Twilio + SendGrid integration with professional templates',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'chatbot_system',
            title: 'AI Chatbot',
            description: '24/7 lead qualification with 100-point scoring system',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'calendar_system',
            title: 'Appointment Booking',
            description: 'Automated scheduling with availability management',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'ab_testing',
            title: 'A/B Testing System',
            description: 'Conversion optimization with multiple test variants',
            status: 'completed',
            priority: 'medium',
            automated: true
          },
          {
            id: 'performance_monitoring',
            title: 'Performance Monitoring',
            description: 'Web Vitals tracking and optimization recommendations',
            status: 'completed',
            priority: 'medium',
            automated: true
          }
        ]
      },
      {
        category: 'Google Ads Setup',
        items: [
          {
            id: 'conversion_tracking',
            title: 'Enhanced Conversion Tracking',
            description: '10+ tracking events with customer data integration',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'campaign_templates',
            title: 'Campaign Templates',
            description: 'Ready-to-deploy campaigns for "Drywall Contractor Bozeman"',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'keyword_research',
            title: 'Keyword Strategy',
            description: 'Comprehensive keyword research and negative keyword lists',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'ads_account_setup',
            title: 'Google Ads Account',
            description: 'Account creation and initial campaign setup',
            status: 'pending',
            priority: 'high'
          },
          {
            id: 'budget_allocation',
            title: 'Budget Allocation',
            description: 'Daily budget distribution across campaign types',
            status: 'pending',
            priority: 'medium'
          }
        ]
      },
      {
        category: 'Business Operations',
        items: [
          {
            id: 'lead_management',
            title: 'Lead Management Process',
            description: 'Dashboard for tracking and managing incoming leads',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'response_workflows',
            title: 'Response Workflows',
            description: 'Automated lead qualification and follow-up sequences',
            status: 'completed',
            priority: 'high',
            automated: true
          },
          {
            id: 'pricing_strategy',
            title: 'Competitive Pricing Protection',
            description: 'Private pricing delivery to maintain market advantage',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'staff_training',
            title: 'Staff Training',
            description: 'Training on new lead management and response processes',
            status: 'pending',
            priority: 'medium'
          },
          {
            id: 'backup_processes',
            title: 'Backup Processes',
            description: 'Manual processes in case of system downtime',
            status: 'pending',
            priority: 'low'
          }
        ]
      },
      {
        category: 'Quality Assurance',
        items: [
          {
            id: 'form_testing',
            title: 'Quote Form Testing',
            description: 'All form submissions tested across devices and browsers',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'automation_testing',
            title: 'Automation Testing',
            description: 'SMS/Email delivery and chatbot responses verified',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'mobile_optimization',
            title: 'Mobile Optimization',
            description: 'Full responsive design and mobile performance testing',
            status: 'completed',
            priority: 'high'
          },
          {
            id: 'load_testing',
            title: 'Load Testing',
            description: 'System performance under expected traffic loads',
            status: 'in_progress',
            priority: 'medium'
          },
          {
            id: 'security_audit',
            title: 'Security Audit',
            description: 'Data protection and form security verification',
            status: 'pending',
            priority: 'medium'
          }
        ]
      }
    ];

    setChecklist(checklistData);
    calculateLaunchReadiness(checklistData);
  };

  const checkSystemHealth = () => {
    const webVitals = performanceMonitor.getWebVitalsSummary();
    const systemMetrics = performanceMonitor.getSystemMetrics();
    const recommendations = performanceMonitor.getOptimizationRecommendations();

    setSystemHealth({
      webVitals,
      systemMetrics,
      recommendations,
      overallScore: calculateOverallScore(webVitals, systemMetrics)
    });
  };

  const calculateOverallScore = (webVitals: any, systemMetrics: any): number => {
    let score = 100;
    
    // Deduct points for poor Web Vitals
    if (webVitals.lcp.status !== 'good') score -= 15;
    if (webVitals.fid.status !== 'good') score -= 10;
    if (webVitals.cls.status !== 'good') score -= 10;
    
    // Deduct points for poor system metrics
    if (systemMetrics.apiResponseTime > 1000) score -= 20;
    if (systemMetrics.errorRate > 5) score -= 15;
    
    return Math.max(score, 0);
  };

  const calculateLaunchReadiness = (checklistData: LaunchChecklist[]) => {
    const allItems = checklistData.flatMap(category => category.items);
    const highPriorityItems = allItems.filter(item => item.priority === 'high');
    const completedHighPriority = highPriorityItems.filter(item => item.status === 'completed');
    
    const readiness = (completedHighPriority.length / highPriorityItems.length) * 100;
    setLaunchReady(readiness >= 90); // 90% of high priority items must be complete
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const completedItems = checklist.flatMap(cat => cat.items).filter(item => item.status === 'completed').length;
  const totalItems = checklist.flatMap(cat => cat.items).length;
  const completionRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Campaign Launch Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor system readiness and prepare for Google Ads campaign launch
          </p>
        </div>

        {/* Launch Readiness Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Launch Readiness</h3>
            <div className="flex items-center justify-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                launchReady ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
              }`}>
                {Math.round(completionRate)}%
              </div>
            </div>
            <p className={`text-center mt-4 font-semibold ${
              launchReady ? 'text-green-600' : 'text-yellow-600'
            }`}>
              {launchReady ? '🚀 READY TO LAUNCH' : '⚠️ PREPARATION NEEDED'}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            {systemHealth && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Overall Score:</span>
                  <span className={`font-semibold ${
                    systemHealth.overallScore >= 80 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {systemHealth.overallScore}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>LCP:</span>
                  <span className={systemHealth.webVitals.lcp.status === 'good' ? 'text-green-600' : 'text-yellow-600'}>
                    {systemHealth.webVitals.lcp.value.toFixed(0)}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>API Response:</span>
                  <span className={systemHealth.systemMetrics.apiResponseTime < 1000 ? 'text-green-600' : 'text-yellow-600'}>
                    {systemHealth.systemMetrics.apiResponseTime}ms
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span className={systemHealth.systemMetrics.errorRate < 5 ? 'text-green-600' : 'text-red-600'}>
                    {systemHealth.systemMetrics.errorRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Projections</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Daily Budget:</span>
                <span className="font-semibold">${campaignMetrics.estimatedDailyBudget}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Leads:</span>
                <span className="font-semibold">{campaignMetrics.expectedDailyLeads}/day</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per Lead:</span>
                <span className="font-semibold">${campaignMetrics.targetCostPerLead}</span>
              </div>
              <div className="flex justify-between">
                <span>Conversion Goal:</span>
                <span className="font-semibold">{campaignMetrics.conversionRateGoal}%</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Revenue:</span>
                <span className="font-semibold text-green-600">${campaignMetrics.revenueProjection.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Launch Checklist */}
        <div className="space-y-6">
          {checklist.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">{category.category}</h3>
                <p className="text-sm text-gray-600">
                  {category.items.filter(item => item.status === 'completed').length} of {category.items.length} completed
                </p>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-gray-50">
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status.replace('_', ' ').toUpperCase()}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                            {item.priority.toUpperCase()}
                          </span>
                          {item.automated && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                              AUTOMATED
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Launch Action */}
        <div className="mt-8 text-center">
          {launchReady ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-2">🎉 Ready for Launch!</h3>
              <p className="text-green-700 mb-4">
                All critical systems are operational and ready for campaign launch.
              </p>
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Launch Google Ads Campaigns
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Preparation Required</h3>
              <p className="text-yellow-700 mb-4">
                Complete remaining high-priority items before launching campaigns.
              </p>
              <button 
                className="bg-gray-400 text-white px-8 py-3 rounded-lg font-semibold cursor-not-allowed"
                disabled
              >
                Complete Setup First
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}