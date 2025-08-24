/**
 * Communication Settings Admin Component
 * Manages email/SMS automation configuration and testing
 */

'use client';

import React, { useState, useEffect } from 'react';

interface CommunicationStatus {
  emailService: string;
  smsService: string;
  orchestrator: string;
  lastHealthCheck: string;
}

interface TestResult {
  success: boolean;
  emailTest?: boolean;
  smsTest?: boolean;
  errors: string[];
}

interface EmailTemplate {
  id: string;
  name: string;
  description: string;
}

interface SMSTemplate {
  id: string;
  name: string;
  description: string;
}

export default function CommunicationSettings() {
  const [status, setStatus] = useState<CommunicationStatus | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([]);
  const [smsTemplates, setSMSTemplates] = useState<SMSTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPhone, setTestPhone] = useState('');
  const [activeTab, setActiveTab] = useState('settings');

  // Communication preferences
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSMSEnabled] = useState(true);
  const [automatedReminders, setAutomatedReminders] = useState(true);

  useEffect(() => {
    loadCommunicationStatus();
    loadEmailTemplates();
    loadSMSTemplates();
  }, []);

  const loadCommunicationStatus = async () => {
    try {
      const response = await fetch('/api/communications/orchestrator?action=status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error loading communication status:', error);
    }
  };

  const loadEmailTemplates = async () => {
    try {
      const response = await fetch('/api/communications/email?action=templates');
      const data = await response.json();
      
      if (data.success) {
        setEmailTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading email templates:', error);
    }
  };

  const loadSMSTemplates = async () => {
    try {
      const response = await fetch('/api/communications/sms?action=templates');
      const data = await response.json();
      
      if (data.success) {
        setSMSTemplates(data.templates);
      }
    } catch (error) {
      console.error('Error loading SMS templates:', error);
    }
  };

  const testCommunicationSystem = async () => {
    setLoading(true);
    setTestResult(null);
    
    try {
      const response = await fetch('/api/communications/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_system' }),
      });
      
      const result = await response.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        errors: [error instanceof Error ? error.message : 'Test failed'],
      });
    } finally {
      setLoading(false);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/communications/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_welcome',
          data: {
            name: 'Test Customer',
            email: testEmail,
            projectName: 'Test Project',
            projectManagerName: 'John Smith',
            projectManagerEmail: 'john@curlfeather.com',
            projectPortalUrl: 'https://portal.curlfeather.com/demo',
            estimatedStartDate: new Date().toLocaleDateString(),
            estimatedCompletion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          },
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Test email sent successfully!');
      } else {
        alert(`Test email failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Test email failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const sendTestSMS = async () => {
    if (!testPhone) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/communications/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_welcome',
          data: {
            customerName: 'Test Customer',
            customerPhone: testPhone,
            projectName: 'Test Project',
            projectManagerName: 'John Smith',
            projectPortalUrl: 'https://portal.curlfeather.com/demo',
          },
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Test SMS sent successfully!');
      } else {
        alert(`Test SMS failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Test SMS failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const scheduleReminders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/communications/orchestrator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'schedule_reminders' }),
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Successfully scheduled ${result.scheduled} reminders`);
      } else {
        alert(`Failed to schedule reminders: ${result.errors.join(', ')}`);
      }
    } catch (error) {
      alert(`Failed to schedule reminders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (serviceStatus: string) => {
    switch (serviceStatus) {
      case 'operational':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✅ Operational</span>;
      case 'degraded':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">⚠️ Degraded</span>;
      case 'down':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">❌ Down</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Settings</h2>
          <p className="text-gray-600">Manage automated email and SMS communications</p>
        </div>
        <button 
          onClick={testCommunicationSystem} 
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🧪 Test System
        </button>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">📊 System Status</h3>
        <p className="text-gray-600 mb-4">Current status of communication services</p>
        
        {status ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email Service</span>
                {getStatusBadge(status.emailService)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SMS Service</span>
                {getStatusBadge(status.smsService)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Orchestrator</span>
                {getStatusBadge(status.orchestrator)}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">Loading system status...</p>
          </div>
        )}
      </div>

      {/* Test Results */}
      {testResult && (
        <div className={`rounded-lg border p-4 ${testResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          {testResult.success ? (
            <div className="space-y-2">
              <p className="font-medium text-green-800">✅ Communication system test completed successfully!</p>
              <div className="text-sm text-green-700">
                <p>Email Service: {testResult.emailTest ? '✅ Working' : '❌ Failed'}</p>
                <p>SMS Service: {testResult.smsTest ? '✅ Working' : '❌ Failed'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="font-medium text-red-800">❌ Communication system test failed</p>
              {testResult.errors.length > 0 && (
                <div className="text-sm text-red-700">
                  <p>Errors:</p>
                  <ul className="list-disc list-inside">
                    {testResult.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'settings', label: 'Settings', icon: '⚙️' },
              { id: 'templates', label: 'Templates', icon: '📄' },
              { id: 'testing', label: 'Testing', icon: '🧪' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚙️ Communication Preferences</h3>
                <p className="text-gray-600 mb-6">Configure global communication settings</p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-900">📧 Email Notifications</label>
                      <p className="text-sm text-gray-500">Send automated email notifications to customers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailEnabled}
                      onChange={(e) => setEmailEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-900">📱 SMS Notifications</label>
                      <p className="text-sm text-gray-500">Send automated SMS notifications to customers</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSMSEnabled(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <label className="text-sm font-medium text-gray-900">⏰ Automated Reminders</label>
                      <p className="text-sm text-gray-500">Automatically send payment and appointment reminders</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={automatedReminders}
                      onChange={(e) => setAutomatedReminders(e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    onClick={scheduleReminders}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ⏰ Schedule Automated Reminders
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📧 Email Templates</h3>
                <p className="text-gray-600 mb-4">Available email templates for automation</p>
                
                <div className="space-y-3">
                  {emailTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 SMS Templates</h3>
                <p className="text-gray-600 mb-4">Available SMS templates for automation</p>
                
                <div className="space-y-3">
                  {smsTemplates.map((template) => (
                    <div key={template.id} className="border rounded-lg p-3">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'testing' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📧 Test Email</h3>
                <p className="text-gray-600 mb-4">Send a test welcome email</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="test@example.com"
                      value={testEmail}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={sendTestEmail} 
                    disabled={loading || !testEmail}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📧 Send Test Email
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">📱 Test SMS</h3>
                <p className="text-gray-600 mb-4">Send a test welcome SMS</p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1234567890"
                      value={testPhone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTestPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button 
                    onClick={sendTestSMS} 
                    disabled={loading || !testPhone}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    📱 Send Test SMS
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}