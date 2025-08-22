// Core Business Types
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  customer_id?: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  project_type: ProjectType;
  room_length: number;
  room_width: number;
  ceiling_height: number;
  project_timeline: string;
  project_budget: string;
  services: ProjectServices;
  contact_method: 'email' | 'phone';
  preferred_times: string[];
  additional_notes?: string;
  lead_source: string;
  utm_campaign?: string;
  utm_source?: string;
  utm_medium?: string;
  gclid?: string;
  lead_score: number;
  status: LeadStatus;
  estimated_value?: number;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  customer_id: string;
  lead_id?: string;
  name: string;
  description: string;
  status: ProjectStatus;
  estimated_value: number;
  actual_cost?: number;
  start_date?: string;
  completion_date?: string;
  milestones: ProjectMilestone[];
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  percentage: number;
  amount: number;
  status: MilestoneStatus;
  due_date?: string;
  completed_date?: string;
  invoice_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  project_id: string;
  milestone_id?: string;
  freshbooks_invoice_id?: string;
  amount: number;
  status: InvoiceStatus;
  due_date: string;
  paid_date?: string;
  payment_url?: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface QuoteFormData {
  // Contact Information
  name: string;
  email: string;
  phone: string;
  address: string;
  
  // Project Details
  project_type: ProjectType;
  room_length: string;
  room_width: string;
  ceiling_height: string;
  project_timeline: string;
  project_budget: string;
  
  // Services Needed
  services: ProjectServices;
  
  // Contact Preferences
  contact_method: 'email' | 'phone';
  preferred_times: string[];
  
  // Additional Information
  additional_notes: string;
  
  // Photo uploads
  project_photos?: FileList;
}

export interface ProjectServices {
  installation: boolean;
  taping: boolean;
  texture: TextureType;
}

// Enums
export type ProjectType = 'installation' | 'repair' | 'finishing' | 'commercial';

export type TextureType = 'spray' | 'hand' | 'smooth' | 'none';

export type LeadStatus = 
  | 'new'
  | 'contacted'
  | 'quoted'
  | 'follow_up'
  | 'won'
  | 'lost'
  | 'nurturing';

export type ProjectStatus = 
  | 'quoted'
  | 'approved'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type MilestoneStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'skipped';

export type InvoiceStatus = 
  | 'draft'
  | 'sent'
  | 'paid'
  | 'overdue'
  | 'cancelled';

// Analytics Types
export interface ConversionEvent {
  id: string;
  lead_id?: string;
  customer_id?: string;
  event_type: ConversionEventType;
  event_value?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export type ConversionEventType = 
  | 'page_view'
  | 'quote_started'
  | 'quote_completed'
  | 'phone_click'
  | 'email_click'
  | 'photo_upload'
  | 'booking_scheduled'
  | 'payment_made'
  | 'project_completed'
  | 'review_left'
  | 'referral_made';

// Communication Types
export interface CommunicationLog {
  id: string;
  lead_id?: string;
  customer_id?: string;
  type: CommunicationType;
  direction: 'inbound' | 'outbound';
  content: string;
  metadata?: Record<string, any>;
  sent_at: string;
  delivered_at?: string;
  read_at?: string;
}

export type CommunicationType = 
  | 'email'
  | 'sms'
  | 'phone'
  | 'system_notification';

// Pricing Types
export interface PricingCalculation {
  square_footage: number;
  services: ProjectServices;
  labor_cost: number;
  material_cost: number;
  total_cost: number;
  breakdown: {
    installation?: number;
    taping?: number;
    texture?: number;
    materials?: number;
  };
}

// Integration Types
export interface FreshBooksClient {
  id: string;
  organization: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
}

export interface FreshBooksEstimate {
  id: string;
  client_id: string;
  status: string;
  amount: number;
  lines: Array<{
    name: string;
    description: string;
    quantity: number;
    unit_cost: number;
  }>;
  created_at: string;
  estimate_url?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Configuration Types
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  analytics: {
    gaId: string;
    googleAdsId: string;
  };
  business: {
    name: string;
    phone: string;
    email: string;
    address: string;
  };
  pricing: {
    baseRates: {
      installation: number;
      taping: number;
      spray_texture: number;
      hand_texture: number;
      smooth_texture: number;
    };
    materialRates: {
      half_inch: number;
      five_eighth: number;
    };
  };
}