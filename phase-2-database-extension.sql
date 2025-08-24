-- 🚀 PHASE 2: Payment Transparency System - Database Extensions
-- Run this in Supabase SQL Editor AFTER the main schema is deployed

-- ========================================
-- PHASE 2.1: DATABASE SCHEMA EXTENSION
-- ========================================

-- 1. CREATE CUSTOMER PROFILES TABLE FOR AUTHENTICATION
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    phone VARCHAR,
    project_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. ENHANCE PROJECTS TABLE FOR CUSTOMER PORTAL
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS customer_email VARCHAR,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS estimated_completion DATE;

-- Update existing status column to have more specific values
-- (keeping existing 'planning' status, adding new ones)

-- 3. ENHANCE PROJECT MILESTONES TABLE FOR FRESHBOOKS INTEGRATION
ALTER TABLE project_milestones 
ADD COLUMN IF NOT EXISTS title VARCHAR,
ADD COLUMN IF NOT EXISTS freshbooks_invoice_id INTEGER,
ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS line_items JSONB DEFAULT '[]';

-- Rename 'name' to 'title' if it exists (for consistency)
-- DO $$ 
-- BEGIN
--     IF EXISTS(SELECT * FROM information_schema.columns WHERE table_name='project_milestones' AND column_name='name') THEN
--         ALTER TABLE project_milestones RENAME COLUMN name TO title;
--     END IF;
-- END $$;

-- Update status check constraint to include payment statuses
ALTER TABLE project_milestones DROP CONSTRAINT IF EXISTS project_milestones_status_check;
ALTER TABLE project_milestones ADD CONSTRAINT project_milestones_status_check 
CHECK (status IN ('pending', 'in_progress', 'completed', 'invoiced', 'paid'));

-- 4. CREATE PROJECT PHOTOS TABLE
CREATE TABLE IF NOT EXISTS project_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL,
    url VARCHAR NOT NULL,
    caption TEXT,
    category VARCHAR DEFAULT 'progress' CHECK (category IN ('before', 'progress', 'completed', 'detail')),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploaded_by VARCHAR -- admin user who uploaded
);

-- 5. ENHANCE INVOICES TABLE FOR STRIPE INTEGRATION
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR,
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR,
ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue', 'cancelled'));

-- 6. CREATE COMMUNICATION PREFERENCES TABLE
CREATE TABLE IF NOT EXISTS communication_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT true,
    email_project_updates BOOLEAN DEFAULT true,
    email_payment_reminders BOOLEAN DEFAULT true,
    sms_urgent_only BOOLEAN DEFAULT false,
    preferred_contact_start TIME DEFAULT '09:00',
    preferred_contact_end TIME DEFAULT '18:00',
    timezone VARCHAR DEFAULT 'America/Denver',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- CREATE PERFORMANCE INDEXES
-- ========================================

-- Customer profiles indexes
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_project_ids ON customer_profiles USING GIN(project_ids);

-- Enhanced project indexes
CREATE INDEX IF NOT EXISTS idx_projects_customer_email ON projects(customer_email);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_total_amount ON projects(total_amount);

-- Enhanced milestone indexes
CREATE INDEX IF NOT EXISTS idx_milestones_project_id ON project_milestones(project_id);
CREATE INDEX IF NOT EXISTS idx_milestones_status ON project_milestones(status);
CREATE INDEX IF NOT EXISTS idx_milestones_freshbooks_id ON project_milestones(freshbooks_invoice_id);
CREATE INDEX IF NOT EXISTS idx_milestones_order_index ON project_milestones(order_index);

-- Project photos indexes
CREATE INDEX IF NOT EXISTS idx_photos_project_id ON project_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_milestone_id ON project_photos(milestone_id);
CREATE INDEX IF NOT EXISTS idx_photos_category ON project_photos(category);

-- Enhanced invoice indexes
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

-- Communication preferences indexes
CREATE INDEX IF NOT EXISTS idx_comm_prefs_customer_id ON communication_preferences(customer_id);

-- ========================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on new tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;

-- ========================================
-- CREATE CUSTOMER-SPECIFIC RLS POLICIES
-- ========================================

-- Customer profiles: Users can only see their own profile
CREATE POLICY "Customers can view own profile" ON customer_profiles
    FOR ALL USING (auth.jwt() ->> 'email' = email);

-- Projects: Customers can view projects they're associated with
CREATE POLICY "Customers can view own projects" ON projects
    FOR SELECT USING (
        customer_email = auth.jwt() ->> 'email' OR
        customer_id IN (
            SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Project milestones: Customers can view milestones for their projects
CREATE POLICY "Customers can view project milestones" ON project_milestones
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            customer_email = auth.jwt() ->> 'email' OR
            customer_id IN (
                SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Project photos: Customers can view photos for their projects
CREATE POLICY "Customers can view project photos" ON project_photos
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            customer_email = auth.jwt() ->> 'email' OR
            customer_id IN (
                SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Invoices: Customers can view invoices for their projects
CREATE POLICY "Customers can view project invoices" ON invoices
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            customer_email = auth.jwt() ->> 'email' OR
            customer_id IN (
                SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
            )
        )
    );

-- Communication preferences: Customers can manage their own preferences
CREATE POLICY "Customers can manage own communication preferences" ON communication_preferences
    FOR ALL USING (
        customer_id IN (
            SELECT id FROM customers WHERE email = auth.jwt() ->> 'email'
        )
    );

-- ========================================
-- CREATE UPDATE TRIGGERS
-- ========================================

-- Add update triggers for new tables
CREATE TRIGGER update_customer_profiles_updated_at 
    BEFORE UPDATE ON customer_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_preferences_updated_at 
    BEFORE UPDATE ON communication_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- CREATE HELPFUL VIEWS
-- ========================================

-- View for customer project overview
CREATE OR REPLACE VIEW customer_project_overview AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.description,
    p.status,
    p.total_amount,
    p.estimated_completion,
    p.customer_email,
    c.name as customer_name,
    c.phone as customer_phone,
    COUNT(pm.id) as total_milestones,
    COUNT(CASE WHEN pm.status = 'completed' THEN 1 END) as completed_milestones,
    COUNT(CASE WHEN pm.status = 'paid' THEN 1 END) as paid_milestones,
    COALESCE(SUM(CASE WHEN pm.status = 'paid' THEN pm.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(pm.amount), 0) as total_milestone_value
FROM projects p
LEFT JOIN customers c ON p.customer_id = c.id
LEFT JOIN project_milestones pm ON p.id = pm.project_id
GROUP BY p.id, p.name, p.description, p.status, p.total_amount, p.estimated_completion, p.customer_email, c.name, c.phone;

-- View for milestone payment status
CREATE OR REPLACE VIEW milestone_payment_status AS
SELECT 
    pm.id as milestone_id,
    pm.title,
    pm.project_id,
    pm.amount,
    pm.status,
    pm.due_date,
    pm.completed_date,
    pm.freshbooks_invoice_id,
    i.id as invoice_id,
    i.stripe_payment_intent_id,
    i.payment_status,
    i.paid_date,
    p.name as project_name,
    p.customer_email
FROM project_milestones pm
LEFT JOIN invoices i ON pm.id = i.milestone_id
LEFT JOIN projects p ON pm.project_id = p.id;

-- ========================================
-- INSERT SAMPLE DATA FOR TESTING
-- ========================================

-- Insert sample customer profile (will be used for testing)
INSERT INTO customer_profiles (id, email, name, phone, project_ids, created_at) 
VALUES (
    gen_random_uuid(),
    'test@curlfeather.com',
    'John Doe Test Customer',
    '(406) 555-0123',
    '{}',
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Insert sample communication preferences for test customer
INSERT INTO communication_preferences (customer_id, email_enabled, sms_enabled, email_project_updates, email_payment_reminders)
SELECT c.id, true, true, true, true
FROM customers c 
WHERE c.email = 'test@curlfeather.com'
ON CONFLICT DO NOTHING;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================

-- Verify all tables exist
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'customer_profiles',
    'projects', 
    'project_milestones',
    'project_photos',
    'invoices',
    'communication_preferences'
)
ORDER BY tablename;

-- Verify RLS is enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true
ORDER BY tablename;

-- SUCCESS MESSAGE
SELECT '🎉 Phase 2 Database Extension Complete! 
✅ Customer authentication tables ready
✅ Enhanced project and milestone tracking
✅ Payment transparency features enabled
✅ RLS policies configured for customer access
✅ Photo gallery support added
✅ Communication preferences system ready

Next Step: Configure FreshBooks OAuth2 integration' as result;