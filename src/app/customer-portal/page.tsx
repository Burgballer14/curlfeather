'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-client';
import AuthModal from '@/components/auth/AuthModal';
import ProjectDashboard from '@/components/customer/ProjectDashboard';
import { useSearchParams } from 'next/navigation';

export default function CustomerPortalPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project');

  useEffect(() => {
    // If user is not logged in, show auth modal
    if (!loading && !user) {
      setShowAuthModal(true);
    }
  }, [user, loading]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your project portal...</p>
        </div>
      </div>
    );
  }

  // Show welcome page if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Curl Feather Inc.</h1>
                <p className="text-gray-600">Customer Project Portal</p>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 text-blue-600 font-medium hover:text-blue-700 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Welcome to Your Project Portal
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Track your drywall project progress in real-time, view photos, manage payments, 
              and communicate with our team - all in one secure place.
            </p>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Real-Time Progress</h3>
                <p className="text-gray-600">
                  See exactly what stage your project is in with live updates and milestone tracking.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Photo Gallery</h3>
                <p className="text-gray-600">
                  View before, during, and after photos of your project as work progresses.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Easy Payments</h3>
                <p className="text-gray-600">
                  View invoices and make secure payments online with detailed cost breakdowns.
                </p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Ready to access your project?
              </h3>
              <p className="text-gray-600 mb-6">
                Sign in to your existing account or create a new one to get started.
              </p>
              <div className="space-x-4">
                <button
                  onClick={() => {
                    setAuthMode('signin');
                    setShowAuthModal(true);
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign In to Your Portal
                </button>
                <button
                  onClick={() => {
                    setAuthMode('signup');
                    setShowAuthModal(true);
                  }}
                  className="px-6 py-3 border border-blue-600 text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
                >
                  Create New Account
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white py-8 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-gray-300">
              Need help? Contact us at <a href="tel:+14066007903" className="text-blue-400 hover:text-blue-300">(406) 600-7903</a> or{' '}
              <a href="mailto:admin@curlfeather.com" className="text-blue-400 hover:text-blue-300">admin@curlfeather.com</a>
            </p>
          </div>
        </footer>

        {/* Auth Modal */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
          projectId={projectId || undefined}
        />
      </div>
    );
  }

  // Show project dashboard for authenticated users
  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectDashboard user={user} projectId={projectId} />
    </div>
  );
}