import { NextRequest, NextResponse } from 'next/server';
import { authClient } from '@/lib/auth/auth-client';
import { stripeInvoiceAutomationService } from '@/lib/services/stripe-invoice-automation';
import { stripeClient } from '@/lib/payments/stripe-client';
import { emailAutomationService } from '@/lib/communications/email-automation';
import { smsAutomationService } from '@/lib/communications/sms-automation';
import { supabase } from '@/lib/auth/auth-client';

/**
 * POST /api/system/integration-test
 * Comprehensive integration test for all platform systems
 */
export async function POST(request: NextRequest) {
  try {
    const { testType = 'complete' } = await request.json();
    
    const testResults: any = {
      testId: `test_${Date.now()}`,
      timestamp: new Date().toISOString(),
      testType,
      results: {},
      summary: {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
      }
    };

    switch (testType) {
      case 'complete':
        await runCompleteIntegrationTest(testResults);
        break;
      case 'database':
        await testDatabaseConnections(testResults);
        break;
      case 'stripe':
        await testStripeIntegration(testResults);
        break;
      case 'auth':
        await testAuthenticationSystem(testResults);
        break;
      case 'communications':
        await testCommunicationSystems(testResults);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Unknown test type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: testResults.summary.failedTests === 0,
      testResults
    });

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Integration test failed' 
      },
      { status: 500 }
    );
  }
}

async function runCompleteIntegrationTest(testResults: any) {
  await testDatabaseConnections(testResults);
  await testStripeIntegration(testResults);
  await testAuthenticationSystem(testResults);
  await testCommunicationSystems(testResults);
  await testEndToEndWorkflow(testResults);
}

async function testDatabaseConnections(testResults: any) {
  const tests = [
    {
      name: 'supabase_connection',
      test: async () => {
        const { data, error } = await supabase.from('customer_profiles').select('count').limit(1);
        if (error) throw error;
        return { success: true, message: 'Supabase connection successful' };
      }
    },
    {
      name: 'customer_profiles_table',
      test: async () => {
        const { data, error } = await supabase
          .from('customer_profiles')
          .select('id, email, first_name, last_name, stripe_customer_id')
          .limit(1);
        if (error) throw error;
        return { success: true, message: 'Customer profiles table accessible' };
      }
    },
    {
      name: 'projects_table',
      test: async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name, customer_id, status')
          .limit(1);
        if (error) throw error;
        return { success: true, message: 'Projects table accessible' };
      }
    },
    {
      name: 'project_milestones_table',
      test: async () => {
        const { data, error } = await supabase
          .from('project_milestones')
          .select('id, project_id, title, status, stripe_invoice_id')
          .limit(1);
        if (error) throw error;
        return { success: true, message: 'Project milestones table accessible' };
      }
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      testResults.results[test.name] = result;
      testResults.summary.passedTests++;
    } catch (error) {
      testResults.results[test.name] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      testResults.summary.failedTests++;
    }
    testResults.summary.totalTests++;
  }
}

async function testStripeIntegration(testResults: any) {
  const tests = [
    {
      name: 'stripe_customer_creation',
      test: async () => {
        const result = await stripeClient.createOrGetCustomer({
          email: 'test-integration@curlfeather.com',
          name: 'Integration Test Customer',
          phone: '(406) 555-0199'
        });
        if (!result.success) throw new Error(result.error);
        return { success: true, customerId: result.customer?.id, message: 'Stripe customer creation successful' };
      }
    },
    {
      name: 'stripe_invoice_creation',
      test: async () => {
        // First ensure we have a customer
        const customerResult = await stripeClient.createOrGetCustomer({
          email: 'test-integration@curlfeather.com',
          name: 'Integration Test Customer'
        });
        if (!customerResult.success) throw new Error(customerResult.error);

        const invoiceData = {
          customerId: customerResult.customer!.id,
          customerEmail: 'test-integration@curlfeather.com',
          customerName: 'Integration Test Customer',
          projectId: 'test-project-integration',
          milestoneId: 'test-milestone-integration',
          milestone: 'Integration Test Milestone',
          description: 'Test invoice for integration testing',
          lineItems: [
            {
              description: 'Integration test item',
              quantity: 1,
              unitPrice: 10000, // $100.00
              category: 'labor' as const
            }
          ]
        };

        const result = await stripeClient.createInvoice(invoiceData);
        if (!result.success) throw new Error(result.error);
        return { 
          success: true, 
          invoiceId: result.invoice?.id, 
          message: 'Stripe invoice creation successful' 
        };
      }
    },
    {
      name: 'stripe_webhook_verification',
      test: async () => {
        const testPayload = JSON.stringify({ test: 'webhook' });
        const testSignature = 'test_signature';
        const testSecret = process.env.STRIPE_WEBHOOK_SECRET || 'test_secret';
        
        // This will fail signature verification, but we're testing the structure
        const result = await stripeClient.handleWebhook(testPayload, testSignature, testSecret);
        
        // We expect this to fail signature verification, which means the webhook handler is working
        if (result.success === false && result.error?.includes('signature')) {
          return { success: true, message: 'Webhook verification mechanism working' };
        }
        throw new Error('Webhook verification test failed');
      }
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      testResults.results[test.name] = result;
      testResults.summary.passedTests++;
    } catch (error) {
      testResults.results[test.name] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      testResults.summary.failedTests++;
    }
    testResults.summary.totalTests++;
  }
}

async function testAuthenticationSystem(testResults: any) {
  const tests = [
    {
      name: 'auth_client_instance',
      test: async () => {
        if (!authClient) throw new Error('Auth client not initialized');
        return { success: true, message: 'Auth client available' };
      }
    },
    {
      name: 'customer_profile_creation_flow',
      test: async () => {
        // Test the structure of customer profile creation (without actually creating)
        const testData = {
          email: 'test-auth@curlfeather.com',
          password: 'testpassword123',
          name: 'Auth Test Customer',
          phone: '(406) 555-0188'
        };
        
        // Check if the signup method exists and is callable
        if (typeof authClient.signUp !== 'function') {
          throw new Error('Auth signup method not available');
        }
        
        return { success: true, message: 'Auth signup flow available' };
      }
    },
    {
      name: 'session_management',
      test: async () => {
        const session = await authClient.getSession();
        // Session can be null if no user is logged in, which is expected in tests
        return { success: true, message: 'Session management working', hasSession: !!session };
      }
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      testResults.results[test.name] = result;
      testResults.summary.passedTests++;
    } catch (error) {
      testResults.results[test.name] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      testResults.summary.failedTests++;
    }
    testResults.summary.totalTests++;
  }
}

async function testCommunicationSystems(testResults: any) {
  const tests = [
    {
      name: 'email_service_config',
      test: async () => {
        const sendgridKey = process.env.SENDGRID_API_KEY;
        const fromEmail = process.env.SENDGRID_FROM_EMAIL;
        
        if (!sendgridKey) throw new Error('SendGrid API key not configured');
        if (!fromEmail) throw new Error('SendGrid from email not configured');
        
        return { success: true, message: 'Email service configuration valid' };
      }
    },
    {
      name: 'sms_service_config',
      test: async () => {
        const twilioSid = process.env.TWILIO_ACCOUNT_SID;
        const twilioToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
        
        if (!twilioSid) throw new Error('Twilio account SID not configured');
        if (!twilioToken) throw new Error('Twilio auth token not configured');
        if (!twilioPhone) throw new Error('Twilio phone number not configured');
        
        return { success: true, message: 'SMS service configuration valid' };
      }
    },
    {
      name: 'email_automation_service',
      test: async () => {
        if (!emailAutomationService) throw new Error('Email automation service not available');
        
        // Test structure without sending actual email
        if (typeof emailAutomationService.sendPaymentConfirmation !== 'function') {
          throw new Error('Payment confirmation email method not available');
        }
        
        return { success: true, message: 'Email automation service available' };
      }
    },
    {
      name: 'sms_automation_service',
      test: async () => {
        if (!smsAutomationService) throw new Error('SMS automation service not available');
        
        // Test structure without sending actual SMS
        if (typeof smsAutomationService.sendProjectUpdate !== 'function') {
          throw new Error('Project update SMS method not available');
        }
        
        return { success: true, message: 'SMS automation service available' };
      }
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      testResults.results[test.name] = result;
      testResults.summary.passedTests++;
    } catch (error) {
      testResults.results[test.name] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      testResults.summary.failedTests++;
    }
    testResults.summary.totalTests++;
  }
}

async function testEndToEndWorkflow(testResults: any) {
  const tests = [
    {
      name: 'stripe_invoice_automation_service',
      test: async () => {
        if (!stripeInvoiceAutomationService) {
          throw new Error('Stripe invoice automation service not available');
        }
        
        // Test service methods exist
        const methods = ['completeMilestone', 'createMilestoneInvoice', 'getProjectFinancialReport'];
        for (const method of methods) {
          if (typeof (stripeInvoiceAutomationService as any)[method] !== 'function') {
            throw new Error(`Method ${method} not available in Stripe invoice automation service`);
          }
        }
        
        return { success: true, message: 'Stripe invoice automation service complete' };
      }
    },
    {
      name: 'integration_workflow_structure',
      test: async () => {
        // Test that all components needed for end-to-end workflow exist
        const components = [
          { name: 'authClient', obj: authClient },
          { name: 'stripeClient', obj: stripeClient },
          { name: 'stripeInvoiceAutomationService', obj: stripeInvoiceAutomationService },
          { name: 'emailAutomationService', obj: emailAutomationService },
          { name: 'smsAutomationService', obj: smsAutomationService }
        ];
        
        for (const component of components) {
          if (!component.obj) {
            throw new Error(`${component.name} not available`);
          }
        }
        
        return { success: true, message: 'All workflow components available' };
      }
    }
  ];

  for (const test of tests) {
    try {
      const result = await test.test();
      testResults.results[test.name] = result;
      testResults.summary.passedTests++;
    } catch (error) {
      testResults.results[test.name] = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
      testResults.summary.failedTests++;
    }
    testResults.summary.totalTests++;
  }
}

// GET endpoint for test status
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  
  if (action === 'status') {
    return NextResponse.json({
      success: true,
      message: 'Integration test endpoint ready',
      availableTests: ['complete', 'database', 'stripe', 'auth', 'communications'],
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({
    success: false,
    error: 'Use POST to run tests or GET with ?action=status for endpoint status'
  }, { status: 405 });
}