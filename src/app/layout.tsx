import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import GoogleAdsTracking from '@/components/GoogleAdsTracking'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Professional Drywall Services in Bozeman, MT | Curl Feather Inc',
  description: 'Expert drywall installation, taping, finishing, and repairs in Bozeman, Montana. Get your free quote in 60 seconds. Licensed & insured with 100% satisfaction guarantee.',
  keywords: 'drywall contractor Bozeman, drywall installation Montana, drywall repair Bozeman, taping finishing Montana, texture application Bozeman',
  authors: [{ name: 'Curl Feather Inc' }],
  openGraph: {
    title: 'Professional Drywall Services in Bozeman, MT | Curl Feather Inc',
    description: 'Expert drywall installation, taping, finishing, and repairs in Bozeman, Montana. Get your free quote in 60 seconds.',
    url: 'https://curlfeather.com',
    siteName: 'Curl Feather Inc',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Curl Feather Inc - Professional Drywall Services in Bozeman, MT'
      }
    ],
    locale: 'en_US',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Drywall Services in Bozeman, MT | Curl Feather Inc',
    description: 'Expert drywall installation, taping, finishing, and repairs in Bozeman, Montana. Get your free quote in 60 seconds.',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  verification: {
    google: 'your-google-verification-code'
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        
        {/* Business Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HomeAndConstructionBusiness",
              "name": "Curl Feather Inc",
              "image": "https://curlfeather.com/logo.jpg",
              "description": "Professional drywall installation, taping, finishing, and repair services in Bozeman, Montana and surrounding areas.",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "123 Main St",
                "addressLocality": "Bozeman",
                "addressRegion": "MT",
                "postalCode": "59718",
                "addressCountry": "US"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 45.6770,
                "longitude": -111.0429
              },
              "telephone": "(406) 555-0123",
              "email": "info@curlfeather.com",
              "url": "https://curlfeather.com",
              "priceRange": "$$",
              "openingHours": "Mo-Fr 08:00-17:00",
              "serviceArea": {
                "@type": "GeoCircle",
                "geoMidpoint": {
                  "@type": "GeoCoordinates",
                  "latitude": 45.6770,
                  "longitude": -111.0429
                },
                "geoRadius": "50000"
              },
              "hasOfferCatalog": {
                "@type": "OfferCatalog",
                "name": "Drywall Services",
                "itemListElement": [
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Drywall Installation"
                    }
                  },
                  {
                    "@type": "Offer", 
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Drywall Repair"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service", 
                      "name": "Taping & Finishing"
                    }
                  },
                  {
                    "@type": "Offer",
                    "itemOffered": {
                      "@type": "Service",
                      "name": "Texture Application"
                    }
                  }
                ]
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "5.0",
                "reviewCount": "127"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {/* Google Ads and Analytics Tracking */}
        <GoogleAdsTracking />
        
        {/* Main Application */}
        {children}
        
        {/* Additional tracking scripts can go here */}
      </body>
    </html>
  )
}
