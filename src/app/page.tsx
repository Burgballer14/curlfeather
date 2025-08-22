'use client';

import QuoteForm from '@/components/QuoteForm';
import Chatbot from '@/components/Chatbot';
import ConversionOptimizer, {
  OptimizedCTAButton,
  useConversionTracking,
  ConversionRateDisplay
} from '@/components/ConversionOptimizer';
import { PhoneIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { businessTracker } from '@/lib/tracking/google-ads';
import { useHeroSectionTest } from '@/hooks/useABTesting';

function MainPageContent() {
  const { config: heroConfig, trackConversion: trackHeroConversion } = useHeroSectionTest();
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Quote Form */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Value Proposition */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                  {heroConfig.headline || 'Professional Drywall Services in Bozeman'}
                  {!heroConfig.headline && <span className="text-green-200"> Bozeman</span>}
                </h1>
                <p className="text-xl text-green-100 mt-6">
                  {heroConfig.subheadline || 'Get your free quote in 60 seconds. Expert installation, finishing, and repairs with transparent pricing.'}
                </p>
                {heroConfig.emphasizeSpeed && (
                  <div className="bg-yellow-400 text-yellow-900 px-4 py-2 rounded-lg inline-block mt-4 font-semibold">
                    ⚡ Same-Day Response Guaranteed
                  </div>
                )}
              </div>

              {/* Trust Signals */}
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-300 mr-2" />
                  <span className="text-green-100">Licensed & Insured</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-300 mr-2" />
                  <span className="text-green-100">5+ Years Experience</span>
                </div>
                <div className="flex items-center">
                  <CheckCircleIcon className="h-6 w-6 text-green-300 mr-2" />
                  <span className="text-green-100">Free Estimates</span>
                </div>
              </div>

              {/* Contact Options */}
              <div className="space-y-4">
                <p className="text-lg font-semibold">Prefer to talk? Call us now:</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="tel:+14065550123"
                    className="flex items-center justify-center bg-white text-green-800 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                    onClick={() => {
                      businessTracker.trackPhoneClick('hero_section');
                      trackHeroConversion('phone_click');
                    }}
                  >
                    <PhoneIcon className="h-5 w-5 mr-2" />
                    (406) 555-0123
                  </a>
                  <a
                    href="mailto:info@curlfeather.com"
                    className="flex items-center justify-center border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-800 transition-colors"
                    onClick={() => {
                      businessTracker.trackEmailClick('hero_section');
                      trackHeroConversion('email_click');
                    }}
                  >
                    <EnvelopeIcon className="h-5 w-5 mr-2" />
                    Send Email
                  </a>
                </div>
              </div>
            </div>

            {/* Right side - Quote Form */}
            <div className="bg-white rounded-xl shadow-2xl p-8">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Get Your Free Quote
                </h2>
                <p className="text-gray-600">
                  Instant estimate • No obligation • 5-minute response
                </p>
              </div>
              
              <QuoteForm
                onSuccess={(leadData) => {
                  console.log('Quote submitted successfully:', leadData);
                  trackHeroConversion('quote_form_complete', {
                    estimatedValue: leadData.estimated_value
                  });
                  // Track successful quote submission
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'conversion', {
                      'send_to': 'quote_completed',
                      'value': leadData.estimated_value,
                      'currency': 'USD'
                    });
                  }
                }}
                onStart={() => {
                  trackHeroConversion('quote_form_start');
                }}
                className="space-y-4"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Why Bozeman Homeowners Choose Curl Feather
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We've completed over 500 drywall projects in the Bozeman area with a 100% satisfaction guarantee.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600">
                Every project comes with our 100% satisfaction guarantee. We don't leave until you're completely happy.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PhoneIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Fast Response</h3>
              <p className="text-gray-600">
                Get your quote within 5 minutes and start your project within 2 weeks. No long waits.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <EnvelopeIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Transparent Pricing</h3>
              <p className="text-gray-600">
                No hidden fees or surprises. You'll know exactly what you're paying before we start.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Drywall Services
            </h2>
            <p className="text-lg text-gray-600">
              From new installations to complex repairs, we handle it all.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              {
                title: "New Installation",
                description: "Complete drywall installation for new construction and renovations"
              },
              {
                title: "Taping & Finishing",
                description: "Professional taping and smooth finishing for perfect walls"
              },
              {
                title: "Texture Application",
                description: "Spray, hand trowel, or smooth texture finishes"
              },
              {
                title: "Repairs & Patches",
                description: "Fix holes, cracks, and water damage professionally"
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{service.title}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
          
          {/* Optimized CTA Button */}
          <div className="text-center">
            <OptimizedCTAButton
              onClick={() => {
                document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' });
                businessTracker.trackCTAClick('Quote Button', 'Services Section');
              }}
              testId="services_cta"
              className="text-lg shadow-lg"
            />
            <p className="text-sm text-gray-600 mt-4">
              Free estimate • No obligation • 5-minute response
            </p>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              What Our Bozeman Customers Say
            </h2>
            <p className="text-xl text-gray-300">
              Over 500 satisfied customers across the Bozeman area
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-200 mb-4">
                "Curl Feather did an amazing job on our basement renovation. Professional, clean, and the pricing was exactly what they quoted - no surprises!"
              </p>
              <p className="text-gray-400 font-semibold">
                - Sarah M., Bozeman
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-200 mb-4">
                "Fast response, quality work, and they cleaned up everything when done. Would definitely use them again for future projects."
              </p>
              <p className="text-gray-400 font-semibold">
                - Mike R., Four Corners
              </p>
            </div>

            <div className="bg-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-200 mb-4">
                "The texture work they did looks perfect. You can't even tell where the repairs were made. True professionals!"
              </p>
              <p className="text-gray-400 font-semibold">
                - Jennifer L., Belgrade
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="flex items-center justify-center space-x-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">500+</div>
                <div className="text-gray-300">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">100%</div>
                <div className="text-gray-300">Satisfaction Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">5★</div>
                <div className="text-gray-300">Average Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Chatbot for 24/7 Lead Qualification */}
      <Chatbot />
      
      {/* Development-only conversion metrics */}
      <ConversionRateDisplay />
    </div>
  );
}

export default function HomePage() {
  return (
    <ConversionOptimizer>
      <MainPageContent />
    </ConversionOptimizer>
  );
}
