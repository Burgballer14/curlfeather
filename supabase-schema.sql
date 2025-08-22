-- 🗄️ Curl Feather Autonomous Platform - Database Schema
-- Run this in Supabase SQL Editor to create all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CUSTOMERS TABLE
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. LEADS TABLE (Most Important for Quote Forms)
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    project_type TEXT NOT NULL,
    room_length DECIMAL NOT NULL,
    room_width DECIMAL NOT NULL,
    ceiling_height DECIMAL NOT NULL DEFAULT 8.0,
    project_timeline TEXT NOT NULL,
    project_budget TEXT NOT NULL,
    services JSONB NOT NULL DEFAULT '{}',
    contact_method TEXT NOT NULL DEFAULT 'email',
    preferred_times TEXT[] DEFAULT ARRAY[]::TEXT[],
    additional_notes TEXT,
    lead_source TEXT DEFAULT 'website',
    utm_campaign TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    gclid TEXT,
    lead_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'new',
    estimated_value DECIMAL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    lead_id UUID REFERENCES leads(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT DEFAULT 'planning',
    estimated_value DECIMAL NOT NULL,
    actual_cost DECIMAL,
    start_date DATE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. PROJECT MILESTONES TABLE
CREATE TABLE IF NOT EXISTS project_milestones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    percentage DECIMAL NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'pending',
    due_date DATE,
    completed_date DATE,
    invoice_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. INVOICES TABLE
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id),
    milestone_id UUID REFERENCES project_milestones(id),
    freshbooks_invoice_id TEXT,
    amount DECIMAL NOT NULL,
    status TEXT DEFAULT 'draft',
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. CONVERSION EVENTS TABLE (For Analytics)
CREATE TABLE IF NOT EXISTS conversion_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    customer_id UUID REFERENCES customers(id),
    event_type TEXT NOT NULL,
    event_value DECIMAL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. COMMUNICATION LOGS TABLE (For Email/SMS tracking)
CREATE TABLE IF NOT EXISTS communication_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id),
    customer_id UUID REFERENCES customers(id),
    type TEXT NOT NULL, -- 'email', 'sms', 'call'
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    content TEXT NOT NULL,
    metadata JSONB,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE
);

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_projects_customer_id ON projects(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_lead_id ON conversion_events(lead_id);

-- ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_logs ENABLE ROW LEVEL SECURITY;

-- BASIC RLS POLICIES (Allow all for now - can be restricted later)
CREATE POLICY "Allow all operations on customers" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on leads" ON leads FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on projects" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on project_milestones" ON project_milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on conversion_events" ON conversion_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on communication_logs" ON communication_logs FOR ALL USING (true) WITH CHECK (true);

-- UPDATE TRIGGERS FOR updated_at COLUMNS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON project_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SUCCESS MESSAGE
SELECT 'Database schema created successfully! All tables, indexes, RLS policies, and triggers are now ready.' as result;