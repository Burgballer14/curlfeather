'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-client';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  projectId?: string;
}

export default function AuthModal({ isOpen, onClose, initialMode = 'signin', projectId }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('error');
  
  const { signIn, signUp, resetPassword } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    confirmPassword: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setMessage(''); // Clear message when user types
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (result.success && result.data) {
        setMessage('Successfully signed in!');
        setMessageType('success');
        setTimeout(() => {
          onClose();
          // Redirect to customer portal
          window.location.href = `/customer-portal${projectId ? `?project=${projectId}` : ''}`;
        }, 1000);
      } else {
        setMessage(result.error || 'Sign in failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const result = await signUp({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        projectId
      });

      if (result.success) {
        if (result.needsVerification) {
          setMessage('Please check your email for verification link');
          setMessageType('success');
          setMode('signin');
        } else {
          setMessage('Account created successfully!');
          setMessageType('success');
          setTimeout(() => {
            onClose();
            window.location.href = `/customer-portal${projectId ? `?project=${projectId}` : ''}`;
          }, 1000);
        }
      } else {
        setMessage(result.error || 'Sign up failed');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await resetPassword(formData.email);

      if (result.success) {
        setMessage('Password reset email sent! Check your inbox.');
        setMessageType('success');
        setMode('signin');
      } else {
        setMessage(result.error || 'Failed to send reset email');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'signin' && 'Sign In to Your Project Portal'}
            {mode === 'signup' && 'Create Your Project Portal Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Message Display */}
          {message && (
            <div className={`mb-4 p-3 rounded-md text-sm ${
              messageType === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Forgot your password?
                </button>
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signup')}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign up
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="At least 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Confirm your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center">
                <div className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('signin')}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    Sign in
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Forgot Password Form */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
                <p className="text-sm text-gray-600 mt-1">
                  We'll send you a link to reset your password.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Reset Email'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-blue-600 hover:text-blue-500"
                >
                  Back to sign in
                </button>
              </div>
            </form>
          )}

          {/* Additional Info */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Your account gives you secure access to view your project progress,
              photos, invoices, and make payments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}