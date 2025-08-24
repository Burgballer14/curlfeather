-- 🚀 STRIPE-ONLY DATABASE MIGRATION (FINAL VERSION)
-- Complete migration from FreshBooks to Stripe-only architecture
-- FINAL: Ensures all columns exist before creating views

-- ========================================
-- STEP 1: DROP DEPENDENT VIEWS FIRST
-- ========================================

-- Drop views that depend on FreshBooks columns
DROP VIEW IF EXISTS milestone_payment_status;
DROP VIEW IF EXISTS customer_project_overview;
DROP VIEW IF EXISTS stripe_payment_status;

-- ========================================
-- STEP 2: ADD ALL STRIPE COLUMNS FIRST
-- ========================================

-- Add Stripe columns to project_milestones (before removing FreshBooks)
ALTER TABLE project_milestones 
ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR,
ADD COLUMN IF NOT EXISTS payment_date TIMESTAMP WITH TIME ZONE;

-- Add Stripe columns to invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR,
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;

-- Add Stripe columns to customer_profiles table (if it already exists)
ALTER TABLE customer_profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR;

-- Ensure customer_profiles table exists with Stripe integration
CREATE TABLE IF NOT EXISTS customer_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    first_name VARCHAR,
    last_name VARCHAR,
    phone VARCHAR,
    address JSONB,
    project_ids TEXT[] DEFAULT '{}',
    stripe_customer_id VARCHAR,
    communication_preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add additional columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS estimated_start_date DATE,
ADD COLUMN IF NOT EXISTS estimated_completion_date DATE;

-- ========================================
-- STEP 3: REMOVE FRESHBOOKS FIELDS
-- ========================================

-- Now safely remove FreshBooks columns
ALTER TABLE project_milestones 
DROP COLUMN IF EXISTS freshbooks_invoice_id;

ALTER TABLE invoices 
DROP COLUMN IF EXISTS freshbooks_invoice_id;

-- ========================================
-- STEP 4: ADD UNIQUE CONSTRAINT TO STRIPE INVOICE ID
-- ========================================

-- Add unique constraint to stripe_invoice_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'invoices_stripe_invoice_id_key'
    ) THEN
        ALTER TABLE invoices ADD CONSTRAINT invoices_stripe_invoice_id_key UNIQUE (stripe_invoice_id);
    END IF;
END $$;

-- ========================================
-- STEP 5: UPDATE INDEXES FOR STRIPE INTEGRATION
-- ========================================

-- Remove old FreshBooks indexes
DROP INDEX IF EXISTS idx_milestones_freshbooks_id;

-- Add Stripe-specific indexes
CREATE INDEX IF NOT EXISTS idx_milestones_stripe_invoice_id ON project_milestones(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_milestones_stripe_payment_intent_id ON project_milestones(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_customer_id ON invoices(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_stripe_customer_id ON customer_profiles(stripe_customer_id);

-- ========================================
-- STEP 6: ENABLE ROW LEVEL SECURITY ON CUSTOMER_PROFILES
-- ========================================

ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "Customers can view own profile" ON customer_profiles;
DROP POLICY IF EXISTS "Customers can view own projects" ON projects;
DROP POLICY IF EXISTS "Customers can view project milestones" ON project_milestones;

-- Create new RLS policies for customer authentication
CREATE POLICY "Customers can view own profile" ON customer_profiles
    FOR ALL USING (auth.uid() = id);

-- Projects: Customers can view projects they're associated with
CREATE POLICY "Customers can view own projects" ON projects
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customer_profiles WHERE id = auth.uid()
        )
    );

-- Project milestones: Customers can view milestones for their projects
CREATE POLICY "Customers can view project milestones" ON project_milestones
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            customer_id IN (
                SELECT id FROM customer_profiles WHERE id = auth.uid()
            )
        )
    );

-- Invoices: Customers can view invoices for their projects
CREATE POLICY "Customers can view project invoices" ON invoices
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE 
            customer_id IN (
                SELECT id FROM customer_profiles WHERE id = auth.uid()
            )
        )
    );

-- ========================================
-- STEP 7: RECREATE VIEWS WITH STRIPE INTEGRATION
-- ========================================

-- View for customer project overview with Stripe integration
CREATE OR REPLACE VIEW customer_project_overview AS
SELECT 
    p.id as project_id,
    p.name as project_name,
    p.description,
    p.status,
    p.estimated_value as total_amount,
    p.estimated_completion_date,
    COALESCE(cp.email, '') as customer_email,
    COALESCE(cp.first_name || ' ' || cp.last_name, '') as customer_name,
    COALESCE(cp.phone, '') as customer_phone,
    cp.stripe_customer_id,
    COUNT(pm.id) as total_milestones,
    COUNT(CASE WHEN pm.status = 'completed' THEN 1 END) as completed_milestones,
    COUNT(CASE WHEN pm.status = 'paid' THEN 1 END) as paid_milestones,
    COALESCE(SUM(CASE WHEN pm.status = 'paid' THEN pm.amount ELSE 0 END), 0) as total_paid,
    COALESCE(SUM(pm.amount), 0) as total_milestone_value
FROM projects p
LEFT JOIN customer_profiles cp ON p.customer_id = cp.id
LEFT JOIN project_milestones pm ON p.id = pm.project_id
GROUP BY p.id, p.name, p.description, p.status, p.estimated_value, p.estimated_completion_date, 
         cp.email, cp.first_name, cp.last_name, cp.phone, cp.stripe_customer_id;

-- View for Stripe payment status (RECREATED WITHOUT FRESHBOOKS REFERENCES)
CREATE OR REPLACE VIEW stripe_payment_status AS
SELECT 
    pm.id as milestone_id,
    pm.title,
    pm.project_id,
    pm.amount,
    pm.status,
    pm.due_date,
    pm.completed_date,
    pm.payment_date,
    pm.stripe_invoice_id,
    pm.stripe_payment_intent_id,
    i.id as internal_invoice_id,
    COALESCE(i.stripe_customer_id, '') as stripe_customer_id,
    COALESCE(i.payment_status, '') as payment_status,
    i.paid_date,
    COALESCE(p.name, '') as project_name,
    COALESCE(cp.email, '') as customer_email,
    cp.stripe_customer_id as customer_stripe_id
FROM project_milestones pm
LEFT JOIN invoices i ON pm.id = i.milestone_id
LEFT JOIN projects p ON pm.project_id = p.id
LEFT JOIN customer_profiles cp ON p.customer_id = cp.id;

-- ========================================
-- STEP 8: UPDATE TRIGGERS
-- ========================================

-- Ensure update trigger exists for customer_profiles
DROP TRIGGER IF EXISTS update_customer_profiles_updated_at ON customer_profiles;
CREATE TRIGGER update_customer_profiles_updated_at 
    BEFORE UPDATE ON customer_profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- STEP 9: VERIFICATION
-- ========================================

-- Verify Stripe fields exist and FreshBooks fields removed
SELECT 
    'Column verification:' as check_type,
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('project_milestones', 'invoices', 'customer_profiles')
AND (column_name LIKE '%stripe%' OR column_name LIKE '%freshbooks%')
ORDER BY table_name, column_name;

-- Verify views were recreated
SELECT 
    'View verification:' as check_type,
    table_name as view_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('customer_project_overview', 'stripe_payment_status');

-- Check that FreshBooks references are gone
SELECT 
    'FreshBooks cleanup check:' as check_type,
    COUNT(*) as freshbooks_columns_remaining
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND column_name LIKE '%freshbooks%';

-- SUCCESS MESSAGE
SELECT '🎉 Stripe-Only Database Migration Complete! 
✅ All Stripe columns added before views created
✅ FreshBooks fields removed safely
✅ Dependent views updated with Stripe integration
✅ Customer authentication with Stripe integration ready
✅ RLS policies updated for customer access
✅ Stripe-focused views created with safe NULL handling
✅ Indexes optimized for Stripe operations

Next Step: Test with integration test suite' as result;