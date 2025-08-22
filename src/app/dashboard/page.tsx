'use client';

import { useState } from 'react';
import LeadDashboard from '@/components/LeadDashboard';
import CalendarBooking from '@/components/CalendarBooking';
import LaunchDashboard from '@/components/LaunchDashboard';

export default function DashboardPage() {
  const [activeView, setActiveView] = useState<'leads' | 'calendar' | 'launch'>('leads');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Curl Feather Inc. - Business Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setActiveView('leads')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'leads'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lead Management
              </button>
              <button
                onClick={() => setActiveView('calendar')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'calendar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Schedule Appointment
              </button>
              <button
                onClick={() => setActiveView('launch')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeView === 'launch'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                🚀 Launch Dashboard
              </button>
              <a
                href="/"
                className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Back to Website
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        {activeView === 'leads' && <LeadDashboard />}
        {activeView === 'calendar' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <CalendarBooking
              onAppointmentBooked={(appointment) => {
                console.log('Appointment booked:', appointment);
                // You could redirect to confirmation page or show success message
              }}
            />
          </div>
        )}
        {activeView === 'launch' && <LaunchDashboard />}
      </main>
    </div>
  );
}