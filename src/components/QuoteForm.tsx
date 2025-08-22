'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { 
  BuildingOfficeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  CameraIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

import { quoteFormSchema, type QuoteFormData } from '@/lib/validations/simple-forms';
import {
  PROJECT_TYPES,
  CEILING_HEIGHTS,
  TIMELINE_OPTIONS,
  BUDGET_RANGES,
  TEXTURE_OPTIONS,
  PREFERRED_TIMES
} from '@/lib/validations/simple-forms';
import { trackConversion, calculateLeadScore, calculateProjectPricing } from '@/lib/supabase/client-simple';
import { businessTracker } from '@/lib/tracking/google-ads';

interface QuoteFormProps {
  onSuccess?: (data: any) => void;
  onStart?: () => void;
  className?: string;
}

export default function QuoteForm({ onSuccess, onStart, className = '' }: QuoteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isValid }
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    mode: 'onChange',
    defaultValues: {
      project_type: 'installation',
      ceiling_height: '9',
      room_length: '',
      room_width: '',
      project_timeline: 'Within 2 weeks',
      project_budget: '$2000-$5000',
      services: {
        installation: true,
        taping: true,
        texture: 'spray'
      },
      contact_method: 'email',
      preferred_times: ['morning'],
      additional_notes: ''
    }
  });

  const watchedServices = watch('services');
  const watchedRoomLength = watch('room_length');
  const watchedRoomWidth = watch('room_width');

  // Real-time pricing calculation
  const calculateRealTimePrice = () => {
    const formData = getValues();
    if (formData.room_length && formData.room_width) {
      try {
        return calculateProjectPricing(formData);
      } catch (error) {
        return null;
      }
    }
    return null;
  };

  const pricing = calculateRealTimePrice();

  const onSubmit = async (data: QuoteFormData) => {
    setIsSubmitting(true);
    
    try {
      // Calculate basic metrics for tracking
      const leadScore = calculateLeadScore(data);
      const pricingData = calculateProjectPricing(data);
      
      // Capture UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmData = {
        utm_source: urlParams.get('utm_source') || 'direct',
        utm_medium: urlParams.get('utm_medium') || 'website',
        utm_campaign: urlParams.get('utm_campaign') || 'quote_form',
        gclid: urlParams.get('gclid') || null
      };

      // Execute automation through API route
      const response = await fetch('/api/automation/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          leadData: data,
          metadata: utmData
        })
      });

      if (!response.ok) {
        throw new Error(`Automation API failed: ${response.status}`);
      }

      const automationResult = await response.json();

      // Enhanced Google Ads conversion tracking
      businessTracker.trackQuoteSubmission({
        leadId: automationResult.leadId,
        estimatedValue: automationResult.estimatedValue,
        leadScore: automationResult.leadScore,
        projectType: data.project_type,
        customerData: {
          email: data.email,
          phone: data.phone,
          name: data.name,
          address: data.address
        }
      });

      // Legacy tracking for compatibility
      await trackConversion('quote_completed', automationResult.leadId, automationResult.estimatedValue, {
        lead_score: automationResult.leadScore,
        project_type: data.project_type,
        estimated_value: automationResult.estimatedValue,
        utm_source: utmData.utm_source
      });

      // Log automation results
      console.log('🚀 Automation executed successfully:', automationResult);

      if (automationResult.success) {
        console.log('✅ Customer will receive:', {
          email: automationResult.automation.emailSent ? 'Professional quote email with pricing details' : 'Email failed to send',
          sms: automationResult.automation.smsSent ? 'Instant confirmation SMS' : 'SMS failed to send'
        });
        
        if (automationResult.leadScore >= 60) {
          console.log('🚨 Business owner notified:', {
            priority: automationResult.leadScore >= 80 ? 'HIGH PRIORITY' : 'MEDIUM PRIORITY'
          });
        }
      } else {
        console.error('❌ Automation errors:', automationResult.automation.errors);
      }

      setSubmitSuccess(true);
      onSuccess?.(automationResult);

    } catch (error) {
      console.error('Error submitting quote:', error);
      alert('There was an error submitting your quote. Please try again or call us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Track step completion with enhanced tracking
      businessTracker.trackQuoteFormStep(currentStep + 1, totalSteps);
      trackConversion('quote_step_completed', undefined, currentStep, {
        step: currentStep,
        total_steps: totalSteps
      });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (submitSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 rounded-lg border border-green-200"
      >
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-2">Quote Submitted Successfully!</h3>
        <p className="text-green-700 mb-4">
          Your detailed estimate is being prepared and will be sent to your email within 5 minutes.
        </p>
        <div className="bg-white p-4 rounded-lg border border-green-200 mb-4">
          <p className="text-lg font-semibold text-gray-800">
            📧 Check your email for your personalized quote
          </p>
          <p className="text-sm text-gray-600">
            Detailed pricing breakdown and next steps included
          </p>
        </div>
        <p className="text-sm text-green-600">
          We'll contact you within 2 hours to schedule your free consultation.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            className="bg-green-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Progress Encouragement */}
      {currentStep >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
        >
          <div className="text-center">
            <p className="text-sm text-green-700 mb-1">Almost Done!</p>
            <p className="text-lg font-semibold text-green-800">
              Your personalized quote is being prepared
            </p>
            <p className="text-sm text-green-600">
              We'll send you a detailed estimate within 5 minutes
            </p>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Contact Information */}
        {currentStep === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Get Your Free Quote</h2>
              <p className="text-gray-600">Let's start with your contact information</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="John Doe"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="(406) 555-0123"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Address *
                </label>
                <input
                  {...register('address')}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="123 Main St, Bozeman, MT"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Project Details */}
        {currentStep === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <BuildingOfficeIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Project Details</h2>
              <p className="text-gray-600">Tell us about your drywall project</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Type *
                </label>
                <select
                  {...register('project_type')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  {PROJECT_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.project_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_type.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ceiling Height *
                </label>
                <select
                  {...register('ceiling_height')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  {CEILING_HEIGHTS.map(height => (
                    <option key={height.value} value={height.value}>
                      {height.label}
                    </option>
                  ))}
                </select>
                {errors.ceiling_height && (
                  <p className="mt-1 text-sm text-red-600">{errors.ceiling_height.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Length (feet) *
                </label>
                <input
                  {...register('room_length')}
                  type="number"
                  step="0.1"
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="20"
                />
                {errors.room_length && (
                  <p className="mt-1 text-sm text-red-600">{errors.room_length.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Width (feet) *
                </label>
                <input
                  {...register('room_width')}
                  type="number"
                  step="0.1"
                  min="1"
                  max="1000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="15"
                />
                {errors.room_width && (
                  <p className="mt-1 text-sm text-red-600">{errors.room_width.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timeline *
                </label>
                <select
                  {...register('project_timeline')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  {TIMELINE_OPTIONS.map(timeline => (
                    <option key={timeline} value={timeline}>
                      {timeline}
                    </option>
                  ))}
                </select>
                {errors.project_timeline && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_timeline.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range *
                </label>
                <select
                  {...register('project_budget')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  {BUDGET_RANGES.map(budget => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
                {errors.project_budget && (
                  <p className="mt-1 text-sm text-red-600">{errors.project_budget.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Services Needed */}
        {currentStep === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Services Needed</h2>
              <p className="text-gray-600">Select the services you need</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <input
                  {...register('services.installation')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Drywall Installation
                </label>
              </div>

              <div className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <input
                  {...register('services.taping')}
                  type="checkbox"
                  className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                />
                <label className="ml-3 text-sm font-medium text-gray-700">
                  Taping & Finishing
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texture Type
                </label>
                <select
                  {...register('services.texture')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                >
                  {TEXTURE_OPTIONS.map(texture => (
                    <option key={texture.value} value={texture.value}>
                      {texture.label}
                    </option>
                  ))}
                </select>
                {errors.services && (
                  <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Contact Preferences & Submit */}
        {currentStep === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="text-center mb-6">
              <PhoneIcon className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">How Should We Contact You?</h2>
              <p className="text-gray-600">We'll send your quote within 5 minutes</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Preferred Contact Method *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
                    <input
                      {...register('contact_method')}
                      type="radio"
                      value="email"
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <EnvelopeIcon className="h-5 w-5 text-gray-400 ml-3 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </label>
                  <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
                    <input
                      {...register('contact_method')}
                      type="radio"
                      value="phone"
                      className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <PhoneIcon className="h-5 w-5 text-gray-400 ml-3 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Phone</span>
                  </label>
                </div>
                {errors.contact_method && (
                  <p className="mt-1 text-sm text-red-600">{errors.contact_method.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Best Time to Contact *
                </label>
                <div className="space-y-2">
                  {PREFERRED_TIMES.map(time => (
                    <label key={time.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 transition-colors cursor-pointer">
                      <input
                        {...register('preferred_times')}
                        type="checkbox"
                        value={time.value}
                        className="h-4 w-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                      />
                      <span className="ml-3 text-sm font-medium text-gray-700">{time.label}</span>
                    </label>
                  ))}
                </div>
                {errors.preferred_times && (
                  <p className="mt-1 text-sm text-red-600">{errors.preferred_times.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  {...register('additional_notes')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                  placeholder="Any special requirements or questions?"
                />
                {errors.additional_notes && (
                  <p className="mt-1 text-sm text-red-600">{errors.additional_notes.message}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:border-gray-400 transition-colors"
            >
              Previous
            </button>
          ) : (
            <div />
          )}

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Next Step
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending Quote...' : 'Get My Free Quote'}
            </button>
          )}
        </div>

        <div className="text-center pt-4">
          <p className="text-sm text-gray-500">
            🔒 Your information is secure and will never be shared
          </p>
        </div>
      </form>
    </div>
  );
}