import { z } from 'zod';

// Quote Form Schema
export const quoteFormSchema = z.object({
  // Contact Information
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  
  address: z.string()
    .min(10, 'Please enter a complete address')
    .max(500, 'Address is too long'),
  
  // Project Details
  project_type: z.enum(['installation', 'repair', 'finishing', 'commercial'], {
    message: 'Please select a project type',
  }),
  
  room_length: z.coerce.number()
    .min(1, 'Room length must be at least 1 foot')
    .max(1000, 'Room length must be less than 1000 feet'),
  
  room_width: z.coerce.number()
    .min(1, 'Room width must be at least 1 foot')
    .max(1000, 'Room width must be less than 1000 feet'),
  
  ceiling_height: z.coerce.number()
    .min(7, 'Ceiling height must be at least 7 feet')
    .max(20, 'Ceiling height must be less than 20 feet'),
  
  project_timeline: z.enum([
    'Within 1 week',
    'Within 2 weeks',
    'Within 1 month',
    'Flexible'
  ], {
    message: 'Please select a timeline',
  }),
  
  project_budget: z.enum([
    'Under $2000',
    '$2000-$5000',
    '$5000-$10000',
    'Over $10000'
  ], {
    message: 'Please select a budget range',
  }),
  
  // Services
  services: z.object({
    installation: z.boolean(),
    taping: z.boolean(),
    texture: z.enum(['spray', 'hand', 'smooth', 'none']),
  }).refine(
    (data) => data.installation || data.taping || data.texture !== 'none',
    {
      message: 'Please select at least one service',
      path: ['services'],
    }
  ),
  
  // Contact Preferences
  contact_method: z.enum(['email', 'phone'], {
    message: 'Please select a contact method',
  }),
  
  preferred_times: z.array(z.string())
    .min(1, 'Please select at least one preferred contact time'),
  
  // Additional Information
  additional_notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  
  // UTM and tracking parameters (optional)
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
  gclid: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// Contact Form Schema (for simple contact page)
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters'),
  
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  phone: z.string()
    .min(10, 'Please enter a valid phone number')
    .max(20, 'Phone number is too long')
    .optional(),
  
  subject: z.string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject must be less than 200 characters'),
  
  message: z.string()
    .min(20, 'Message must be at least 20 characters')
    .max(2000, 'Message must be less than 2000 characters'),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Newsletter Signup Schema
export const newsletterSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
});

export type NewsletterData = z.infer<typeof newsletterSchema>;

// Lead Update Schema (for admin use)
export const leadUpdateSchema = z.object({
  status: z.enum([
    'new',
    'contacted',
    'quoted',
    'follow_up',
    'won',
    'lost',
    'nurturing'
  ]),
  
  notes: z.string()
    .max(2000, 'Notes must be less than 2000 characters')
    .optional(),
  
  estimated_value: z.number()
    .min(0, 'Estimated value must be positive')
    .max(1000000, 'Estimated value is too high')
    .optional(),
  
  follow_up_date: z.string()
    .datetime()
    .optional(),
});

export type LeadUpdateData = z.infer<typeof leadUpdateSchema>;

// Project Creation Schema
export const projectCreateSchema = z.object({
  name: z.string()
    .min(5, 'Project name must be at least 5 characters')
    .max(200, 'Project name must be less than 200 characters'),
  
  description: z.string()
    .min(20, 'Description must be at least 20 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  
  estimated_value: z.number()
    .min(100, 'Estimated value must be at least $100')
    .max(1000000, 'Estimated value is too high'),
  
  start_date: z.string()
    .datetime()
    .optional(),
  
  milestones: z.array(z.object({
    name: z.string().min(3, 'Milestone name is required'),
    description: z.string().min(10, 'Milestone description is required'),
    percentage: z.number().min(1).max(100),
    amount: z.number().min(0),
    due_date: z.string().datetime().optional(),
  }))
  .min(1, 'At least one milestone is required'),
});

export type ProjectCreateData = z.infer<typeof projectCreateSchema>;

// Form Constants
export const PROJECT_TYPES = [
  { value: 'installation', label: 'New Installation' },
  { value: 'repair', label: 'Repair & Patch Work' },
  { value: 'finishing', label: 'Finishing & Texturing' },
  { value: 'commercial', label: 'Commercial Project' }
] as const;

export const CEILING_HEIGHTS = [
  { value: '8', label: '8 Foot Ceiling' },
  { value: '9', label: '9 Foot Ceiling' },
  { value: '10', label: '10 Foot Ceiling' },
  { value: '12', label: '12 Foot Ceiling' }
] as const;

export const TIMELINE_OPTIONS = [
  'Within 1 week',
  'Within 2 weeks',
  'Within 1 month',
  'Flexible'
] as const;

export const BUDGET_RANGES = [
  'Under $2000',
  '$2000-$5000',
  '$5000-$10000',
  'Over $10000'
] as const;

export const TEXTURE_OPTIONS = [
  { value: 'spray', label: 'Spray Texture' },
  { value: 'hand', label: 'Hand Trowel' },
  { value: 'smooth', label: 'Smooth Finish' },
  { value: 'none', label: 'No Texture' }
] as const;

export const PREFERRED_TIMES = [
  { value: 'morning', label: 'Morning (8AM-12PM)' },
  { value: 'afternoon', label: 'Afternoon (12PM-4PM)' },
  { value: 'evening', label: 'Evening (4PM-6PM)' }
] as const;