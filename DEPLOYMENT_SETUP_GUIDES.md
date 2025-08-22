# 🚀 Curl Feather Autonomous Platform - Deployment Setup Guides

**Purpose:** Step-by-step guides for services requiring your account setup  
**Status:** Pre-deployment preparation  
**Next Review:** Before production deployment  

---

## 📧 EMAIL AUTOMATION SETUP (SendGrid)

### Prerequisites
- Business email address for sending from
- SendGrid account (free tier available)

### Step-by-Step Setup

#### 1. Create SendGrid Account
1. Go to https://sendgrid.com
2. Sign up with your business email
3. Verify your email address
4. Complete account setup

#### 2. Domain Authentication (Recommended)
1. In SendGrid Dashboard → Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Enter your domain (e.g., curlfeather.com)
4. Follow DNS setup instructions
5. Verify domain ownership

#### 3. Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "Autonomous Platform Production"
4. Select "Restricted Access"
5. Grant permissions:
   - Mail Send: Full Access
   - Template Engine: Full Access
   - Suppressions: Full Access
6. **Save the API key securely - you'll only see it once**

#### 4. Environment Variables Needed
```bash
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@curlfeather.com
SENDGRID_FROM_NAME=Curl Feather Inc
```

#### 5. Verification Steps
- [ ] Account created and verified
- [ ] Domain authenticated (if applicable)
- [ ] API key created with proper permissions
- [ ] Test email sent successfully

---

## 📱 SMS AUTOMATION SETUP (Twilio)

### Prerequisites
- Phone number for Twilio account
- Credit card for account verification

### Step-by-Step Setup

#### 1. Create Twilio Account
1. Go to https://twilio.com
2. Sign up and verify phone number
3. Complete account verification
4. Add payment method (required even for trial)

#### 2. Get Phone Number
1. In Twilio Console → Phone Numbers → Manage → Buy a number
2. Search for local Bozeman area code (406) if available
3. Purchase number with SMS capabilities
4. Note your Twilio phone number

#### 3. Find Account Credentials
1. Go to Twilio Console Dashboard
2. Note your Account SID
3. Note your Auth Token
4. Find your Twilio phone number

#### 4. Environment Variables Needed
```bash
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14065551234
```

#### 5. Verification Steps
- [ ] Account created and verified
- [ ] Phone number purchased
- [ ] Account SID and Auth Token noted
- [ ] Test SMS sent successfully

---

## 🎯 GOOGLE ADS SETUP

### Prerequisites
- Google Account with billing enabled
- Business verification documents
- Monthly advertising budget ($500-2000 recommended)

### Step-by-Step Setup

#### 1. Create Google Ads Account
1. Go to https://ads.google.com
2. Sign in with Google Account
3. Create new advertising account
4. Select business type: Small Business
5. Set up billing information

#### 2. Google Ads Conversion Tracking
1. In Google Ads → Tools → Conversions
2. Create new conversion action:
   - Type: Website
   - Category: Submit lead form
   - Name: "Quote Form Submission"
   - Value: Use different values for each conversion
   - Count: One per click

#### 3. Google Tag Manager Setup
1. Go to https://tagmanager.google.com
2. Create new account for curlfeather.com
3. Install GTM container on website
4. Configure Google Ads conversion tracking

#### 4. Google My Business Optimization
1. Claim/verify Google My Business listing
2. Add business hours, photos, services
3. Enable messaging and appointment booking
4. Request customer reviews

#### 5. Environment Variables Needed
```bash
GOOGLE_ADS_CONVERSION_ID=your_conversion_id_here
GOOGLE_ADS_CONVERSION_LABEL=your_conversion_label_here
GOOGLE_ANALYTICS_ID=GA4_measurement_id_here
```

#### 6. Verification Steps
- [ ] Google Ads account created
- [ ] Billing information added
- [ ] Conversion tracking configured
- [ ] Google My Business optimized
- [ ] Initial campaigns created

---

## 🗄️ SUPABASE PRODUCTION SETUP

### Prerequisites
- Supabase account
- Database deployment plan

### Step-by-Step Setup

#### 1. Create Production Project
1. Go to https://supabase.com
2. Create new project
3. Choose region closest to Bozeman (US West)
4. Set strong database password
5. Wait for project to provision

#### 2. Database Configuration
1. Enable Row Level Security (RLS)
2. Create necessary tables (leads, customers, projects)
3. Set up authentication policies
4. Configure real-time subscriptions

#### 3. Environment Variables Needed
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

#### 4. Verification Steps
- [ ] Production project created
- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Environment variables secured

---

## 🔧 DEPLOYMENT ENVIRONMENT VARIABLES

### Complete .env.local File Template
```bash
# Next.js
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your_random_secret_here

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@curlfeather.com
SENDGRID_FROM_NAME=Curl Feather Inc

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+14065551234

# Google Services
GOOGLE_ADS_CONVERSION_ID=your_conversion_id_here
GOOGLE_ADS_CONVERSION_LABEL=your_conversion_label_here
GOOGLE_ANALYTICS_ID=GA4_measurement_id_here

# Business Configuration
BUSINESS_PHONE=(406) 555-0123
BUSINESS_EMAIL=info@curlfeather.com
BUSINESS_ADDRESS=123 Main St, Bozeman, MT 59718
```

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### External Services Setup
- [ ] SendGrid account created and configured
- [ ] Twilio account created with phone number
- [ ] Google Ads account with conversion tracking
- [ ] Supabase production project ready
- [ ] All environment variables collected

### Domain & Hosting
- [ ] Domain name configured
- [ ] SSL certificate installed
- [ ] Vercel/Netlify deployment configured
- [ ] Custom domain pointed to deployment

### Testing & Verification
- [ ] All API integrations tested
- [ ] Email automation working
- [ ] SMS automation working
- [ ] Form submissions saving to database
- [ ] Google Ads conversion tracking active

### Business Setup
- [ ] Google My Business optimized
- [ ] Initial ad campaigns created
- [ ] Customer support workflows ready
- [ ] Team trained on new system

---

**Next Steps:** Return to this guide before production deployment to complete all external service setups.

**Estimated Setup Time:** 2-3 hours for all services  
**Cost:** ~$50-100/month for all services combined