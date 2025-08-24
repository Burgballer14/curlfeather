# Payment Transparency System - Setup Guide

**Curl Feather Inc. Autonomous Drywall Platform**  
**Phase 2: Complete Implementation Guide**

---

## 📋 **Overview**

This guide will walk you through setting up the complete Payment Transparency System for your drywall contractor business. The system provides customers with real-time project visibility, secure payment processing, and automated communications.

### **System Components:**
- ✅ Customer Portal with Authentication
- ✅ Real-time Project Tracking
- ✅ FreshBooks Accounting Integration
- ✅ Stripe Payment Processing
- ✅ Email & SMS Automation

---

## 🎯 **Prerequisites Checklist**

### **Business Accounts Required:**
- [ ] **Supabase Account** - Customer authentication and database
- [ ] **FreshBooks Account** - Accounting and invoicing
- [ ] **Stripe Account** - Payment processing
- [ ] **SendGrid Account** - Email automation
- [ ] **Twilio Account** - SMS automation
- [ ] **Domain Name** - For production deployment

### **Development Environment:**
- [ ] Node.js 18+ installed
- [ ] Git repository access
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/command line access

---

## 🚀 **Phase 1: Environment Setup**

### **Step 1.1: Clone and Install** ⏱️ *Est. 10 minutes*
- [ ] Clone the repository to your local machine
- [ ] Run `npm install` to install dependencies
- [ ] Verify the development server starts with `npm run dev`
- [ ] Confirm the application loads at `http://localhost:3000`

**Progress Notes:**
```
Date Started: ___________
Issues Encountered: ___________
Completed: ___________
```

### **Step 1.2: Environment Variables Setup** ⏱️ *Est. 15 minutes*
- [ ] Create `.env.local` file in the project root
- [ ] Add the following template variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# FreshBooks Configuration
FRESHBOOKS_CLIENT_ID=your_freshbooks_client_id
FRESHBOOKS_CLIENT_SECRET=your_freshbooks_client_secret
FRESHBOOKS_REDIRECT_URI=http://localhost:3000/api/freshbooks/callback

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Application Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

**Progress Notes:**
```
Date Started: ___________
Variables Added: _____ / 15
Issues Encountered: ___________
Completed: ___________
```

---

## 🗄️ **Phase 2: Supabase Database Setup**

### **Step 2.1: Create Supabase Project** ⏱️ *Est. 20 minutes*
- [ ] Sign up for Supabase at https://supabase.com
- [ ] Create a new project
- [ ] Copy the project URL and anon key to your `.env.local`
- [ ] Enable Row Level Security (RLS) in the Authentication settings

### **Step 2.2: Database Schema Setup** ⏱️ *Est. 30 minutes*
- [ ] Navigate to the SQL Editor in Supabase
- [ ] Create the following tables:

**Customer Portal Tables:**
```sql
-- Customers table
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  name VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'planning',
  start_date DATE,
  estimated_completion DATE,
  total_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Project milestones table
CREATE TABLE project_milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR DEFAULT 'pending',
  target_date DATE,
  completed_date DATE,
  invoice_amount DECIMAL(10,2),
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Project photos table
CREATE TABLE project_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  milestone_id UUID REFERENCES project_milestones(id),
  url VARCHAR NOT NULL,
  caption TEXT,
  category VARCHAR DEFAULT 'progress',
  uploaded_at TIMESTAMP DEFAULT NOW()
);

-- Invoices table
CREATE TABLE invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  freshbooks_invoice_id VARCHAR,
  invoice_number VARCHAR,
  amount DECIMAL(10,2),
  status VARCHAR DEFAULT 'draft',
  due_date DATE,
  paid_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Communication preferences table
CREATE TABLE communication_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  email_project_updates BOOLEAN DEFAULT true,
  email_payment_reminders BOOLEAN DEFAULT true,
  sms_urgent_only BOOLEAN DEFAULT false,
  preferred_contact_start TIME DEFAULT '09:00',
  preferred_contact_end TIME DEFAULT '18:00',
  timezone VARCHAR DEFAULT 'America/Denver'
);
```

### **Step 2.3: Row Level Security (RLS) Policies** ⏱️ *Est. 20 minutes*
- [ ] Enable RLS on all tables
- [ ] Create policies for customer data access:

```sql
-- Customers can only see their own data
CREATE POLICY "Customers can view own data" ON customers
  FOR SELECT USING (auth.jwt() ->> 'email' = email);

-- Similar policies for projects, milestones, photos, invoices
CREATE POLICY "Customers can view own projects" ON projects
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
    )
  );
```

**Progress Notes:**
```
Date Started: ___________
Tables Created: _____ / 7
RLS Policies Added: _____ / 5
Issues Encountered: ___________
Completed: ___________
```

---

## 💳 **Phase 3: Stripe Payment Setup**

### **Step 3.1: Stripe Account Configuration** ⏱️ *Est. 25 minutes*
- [ ] Sign up for Stripe at https://stripe.com
- [ ] Complete business verification
- [ ] Get your publishable and secret keys from the dashboard
- [ ] Add keys to your `.env.local` file

### **Step 3.2: Webhook Configuration** ⏱️ *Est. 15 minutes*
- [ ] In Stripe Dashboard, go to Developers > Webhooks
- [ ] Add endpoint: `http://localhost:3000/api/stripe/webhook`
- [ ] Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
- [ ] Copy the webhook secret to your `.env.local`

### **Step 3.3: Test Payment Integration** ⏱️ *Est. 20 minutes*
- [ ] Start your development server
- [ ] Navigate to the customer portal demo
- [ ] Test payment form with Stripe test card: `4242424242424242`
- [ ] Verify webhook receives payment confirmation

**Progress Notes:**
```
Date Started: ___________
Stripe Account Setup: ___________
Webhook Configured: ___________
Test Payment Successful: ___________
Completed: ___________
```

---

## 📚 **Phase 4: FreshBooks Integration**

### **Step 4.1: FreshBooks App Registration** ⏱️ *Est. 30 minutes*
- [ ] Sign up for FreshBooks at https://www.freshbooks.com
- [ ] Go to FreshBooks Developer Portal
- [ ] Create a new app registration
- [ ] Set redirect URI to: `http://localhost:3000/api/freshbooks/callback`
- [ ] Copy Client ID and Secret to `.env.local`

### **Step 4.2: OAuth2 Authentication** ⏱️ *Est. 20 minutes*
- [ ] Start your development server
- [ ] Navigate to the admin panel (you'll need to create this route)
- [ ] Click "Connect FreshBooks" button
- [ ] Complete OAuth2 authorization flow
- [ ] Verify connection shows "Connected" status

### **Step 4.3: Test Invoice Creation** ⏱️ *Est. 15 minutes*
- [ ] Create a test project in your system
- [ ] Add milestones with invoice amounts
- [ ] Trigger invoice creation through the admin interface
- [ ] Verify invoice appears in FreshBooks dashboard

**Progress Notes:**
```
Date Started: ___________
FreshBooks Account Created: ___________
OAuth2 Flow Completed: ___________
Test Invoice Created: ___________
Completed: ___________
```

---

## 📧 **Phase 5: Email Automation Setup**

### **Step 5.1: SendGrid Account Setup** ⏱️ *Est. 25 minutes*
- [ ] Sign up for SendGrid at https://sendgrid.com
- [ ] Verify your sending domain
- [ ] Create an API key with full access
- [ ] Add API key to `.env.local`

### **Step 5.2: Email Templates Configuration** ⏱️ *Est. 30 minutes*
- [ ] Create sender identity in SendGrid
- [ ] Test email configuration using the admin panel
- [ ] Send test welcome email to your email address
- [ ] Verify email delivery and formatting

### **Step 5.3: Email Automation Testing** ⏱️ *Est. 20 minutes*
- [ ] Test milestone completion email
- [ ] Test payment confirmation email  
- [ ] Test project completion email
- [ ] Test invoice reminder email

**Progress Notes:**
```
Date Started: ___________
SendGrid Account Setup: ___________
Domain Verified: ___________
Test Emails Sent: _____ / 4
Completed: ___________
```

---

## 📱 **Phase 6: SMS Automation Setup**

### **Step 6.1: Twilio Account Setup** ⏱️ *Est. 20 minutes*
- [ ] Sign up for Twilio at https://www.twilio.com
- [ ] Purchase a phone number for SMS sending
- [ ] Get Account SID and Auth Token
- [ ] Add credentials to `.env.local`

### **Step 6.2: SMS Testing** ⏱️ *Est. 15 minutes*
- [ ] Test SMS configuration using the admin panel
- [ ] Send test welcome SMS to your phone
- [ ] Verify SMS delivery and formatting

### **Step 6.3: SMS Automation Testing** ⏱️ *Est. 15 minutes*
- [ ] Test project update SMS
- [ ] Test payment reminder SMS
- [ ] Test appointment reminder SMS

**Progress Notes:**
```
Date Started: ___________
Twilio Account Setup: ___________
Phone Number Purchased: ___________
Test SMS Sent: _____ / 3
Completed: ___________
```

---

## 🎮 **Phase 7: Admin Interface Setup**

### **Step 7.1: Admin Authentication** ⏱️ *Est. 20 minutes*
- [ ] Create admin user in Supabase
- [ ] Set up admin role/permissions
- [ ] Create admin login route
- [ ] Test admin panel access

### **Step 7.2: Admin Panel Features** ⏱️ *Est. 30 minutes*
- [ ] Test FreshBooks settings panel
- [ ] Test communication settings panel
- [ ] Test project invoice manager
- [ ] Verify all integrations show connected status

**Progress Notes:**
```
Date Started: ___________
Admin User Created: ___________
Admin Panel Accessible: ___________
All Settings Panels Working: ___________
Completed: ___________
```

---

## 🔄 **Phase 8: End-to-End Testing**

### **Step 8.1: Complete Customer Journey** ⏱️ *Est. 45 minutes*
- [ ] Create a test customer in the system
- [ ] Create a test project with milestones
- [ ] Upload test photos to project gallery
- [ ] Generate invoice for completed milestone
- [ ] Process test payment through customer portal
- [ ] Verify all communications are sent (email + SMS)

### **Step 8.2: Admin Workflow Testing** ⏱️ *Est. 30 minutes*
- [ ] Test project milestone management
- [ ] Test invoice automation workflow
- [ ] Test communication system monitoring
- [ ] Verify all integrations are working properly

**Progress Notes:**
```
Date Started: ___________
Customer Journey Completed: ___________
Admin Workflow Tested: ___________
All Systems Verified: ___________
Completed: ___________
```

---

## 🚀 **Phase 9: Production Deployment**

### **Step 9.1: Production Environment Setup** ⏱️ *Est. 60 minutes*
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Set up production database in Supabase
- [ ] Configure production environment variables
- [ ] Set up custom domain

### **Step 9.2: Production Configuration** ⏱️ *Est. 45 minutes*
- [ ] Update Stripe webhooks for production URL
- [ ] Update FreshBooks redirect URI for production
- [ ] Configure SendGrid for production domain
- [ ] Test all integrations in production

### **Step 9.3: Go-Live Checklist** ⏱️ *Est. 30 minutes*
- [ ] Complete end-to-end test in production
- [ ] Set up monitoring and alerts
- [ ] Create customer onboarding documentation
- [ ] Train team on admin panel usage

**Progress Notes:**
```
Date Started: ___________
Production Deployed: ___________
All Integrations Working: ___________
Team Trained: ___________
Completed: ___________
```

---

## 🎯 **System Overview & Features**

### **Customer Portal Features:**
- ✅ Secure authentication with email/password
- ✅ Real-time project status and milestone tracking
- ✅ Photo gallery with progress documentation
- ✅ Invoice viewing and secure payment processing
- ✅ Communication preferences management

### **Admin Panel Features:**
- ✅ FreshBooks integration management
- ✅ Stripe payment processing oversight
- ✅ Communication system configuration
- ✅ Project and milestone management
- ✅ Customer relationship management

### **Automation Features:**
- ✅ Automated invoice creation tied to milestones
- ✅ Email notifications for all project events
- ✅ SMS alerts for time-sensitive communications
- ✅ Payment reminder workflows
- ✅ Customer onboarding sequences

---

## 🆘 **Troubleshooting Guide**

### **Common Issues & Solutions:**

**Database Connection Issues:**
- Verify Supabase URL and keys are correct
- Check RLS policies are properly configured
- Ensure database tables exist with correct schema

**Payment Processing Issues:**
- Verify Stripe keys match your account mode (test/live)
- Check webhook endpoint is accessible
- Confirm webhook secret is current

**Email Delivery Issues:**
- Verify SendGrid API key has send permissions
- Check sender identity is verified
- Ensure from email matches verified domain

**SMS Delivery Issues:**
- Verify Twilio credentials are correct
- Check phone number is verified for your account
- Ensure destination numbers are in correct format

---

## 📞 **Support & Next Steps**

### **Setup Complete Checklist:**
- [ ] All integrations tested and working
- [ ] Admin panel fully functional
- [ ] Customer portal provides full transparency
- [ ] Automated communications operational
- [ ] Production deployment successful
- [ ] Team trained on system usage

### **Business Benefits Achieved:**
- **Complete Payment Transparency** - Customers see all project details
- **Automated Workflow** - Reduced manual administrative work
- **Professional Image** - Integrated accounting and payment systems
- **Customer Trust** - Real-time project visibility and communication
- **Competitive Advantage** - Modern, transparent business operations

**Total Estimated Setup Time: 8-12 hours**  
**Recommended Timeline: 2-3 days with breaks**

---

## 📝 **Final Notes**

**Date Setup Started:** ___________  
**Date Setup Completed:** ___________  
**Total Time Invested:** ___________  
**Team Members Trained:** ___________  

**Next Phase Planning:**
- [ ] Plan Phase 3 features (if desired)
- [ ] Schedule regular system maintenance
- [ ] Plan customer onboarding campaign
- [ ] Set up performance monitoring

---

*This setup guide ensures your Payment Transparency System is fully operational and ready to provide your customers with the ultimate transparency experience while automating your business operations.*