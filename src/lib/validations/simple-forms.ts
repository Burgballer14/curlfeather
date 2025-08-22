import { z } from 'zod';

// Simplified Quote Form Schema that works with current setup
export const quoteFormSchema = z.object({
  // Contact Information
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  address: z.string().min(10, 'Please enter a complete address'),
  
  // Project Details
  project_type: z.string(),
  room_length: z.string(),
  room_width: z.string(),
  ceiling_height: z.string(),
  project_timeline: z.string(),
  project_budget: z.string(),
  
  // Services
  services: z.object({
    installation: z.boolean(),
    taping: z.boolean(),
    texture: z.string(),
  }),
  
  // Contact Preferences
  contact_method: z.string(),
  preferred_times: z.array(z.string()),
  
  // Additional Information
  additional_notes: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

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