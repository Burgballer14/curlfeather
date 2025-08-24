'use client';

import { useState } from 'react';
import ProjectDashboard from '@/components/customer/ProjectDashboard';
import { CustomerAuthData } from '@/lib/auth/auth-client';

// Mock project data for demonstration
const mockProject = {
  id: 'proj_demo_001',
  name: 'Basement Drywall Installation',
  description: 'Complete drywall installation for finished basement renovation including all materials, labor, and finishing work.',
  status: 'in_progress',
  start_date: '2025-01-20',
  estimated_completion: '2025-01-30',
  completion_percentage: 75,
  customer: {
    id: 'cust_001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567'
  },
  address: {
    street: '123 Main Street',
    city: 'Denver',
    state: 'CO',
    zip: '80202'
  },
  current_milestone: 'Drywall Installation',
  next_milestone: 'Finishing & Quality Assurance',
  project_manager: {
    name: 'Sarah Johnson',
    email: 'sarah@curlfeather.com',
    phone: '(555) 987-6543'
  },
  crew_lead: {
    name: 'Mike Rodriguez',
    email: 'mike@curlfeather.com',
    phone: '(555) 456-7890'
  },
  total_amount: 1500.00,
  amount_paid: 850.00,
  milestones: [
    {
      id: 'milestone_1',
      title: 'Project Planning & Preparation',
      description: 'Initial site assessment, material calculations, and project scheduling',
      status: 'completed',
      start_date: '2025-01-20',
      completion_date: '2025-01-22',
      payment_amount: 500.00,
      payment_status: 'paid',
      tasks: [
        { id: 'task_1', name: 'Site assessment', status: 'completed', completion_date: '2025-01-20' },
        { id: 'task_2', name: 'Material calculations', status: 'completed', completion_date: '2025-01-21' },
        { id: 'task_3', name: 'Project scheduling', status: 'completed', completion_date: '2025-01-22' }
      ]
    },
    {
      id: 'milestone_2',
      title: 'Material Procurement & Delivery',
      description: 'Purchase and delivery of all required materials',
      status: 'completed',
      start_date: '2025-01-22',
      completion_date: '2025-01-23',
      payment_amount: 350.00,
      payment_status: 'paid',
      tasks: [
        { id: 'task_4', name: 'Material ordering', status: 'completed', completion_date: '2025-01-22' },
        { id: 'task_5', name: 'Delivery coordination', status: 'completed', completion_date: '2025-01-22' },
        { id: 'task_6', name: 'Material staging', status: 'completed', completion_date: '2025-01-23' }
      ]
    },
    {
      id: 'milestone_3',
      title: 'Site Preparation',
      description: 'Prepare work area and protect surrounding spaces',
      status: 'completed',
      start_date: '2025-01-21',
      completion_date: '2025-01-21',
      payment_amount: 0.00,
      payment_status: 'included',
      tasks: [
        { id: 'task_7', name: 'Area clearing', status: 'completed', completion_date: '2025-01-21' },
        { id: 'task_8', name: 'Floor protection', status: 'completed', completion_date: '2025-01-21' },
        { id: 'task_9', name: 'Outlet mapping', status: 'completed', completion_date: '2025-01-21' }
      ]
    },
    {
      id: 'milestone_4',
      title: 'Drywall Installation',
      description: 'Install drywall sheets and corner beading',
      status: 'in_progress',
      start_date: '2025-01-23',
      estimated_completion: '2025-01-25',
      payment_amount: 200.00,
      payment_status: 'pending',
      tasks: [
        { id: 'task_10', name: 'Measure and cut drywall', status: 'completed', completion_date: '2025-01-23' },
        { id: 'task_11', name: 'Install drywall sheets', status: 'in_progress' },
        { id: 'task_12', name: 'Install corner bead', status: 'pending' },
        { id: 'task_13', name: 'Electrical outlet cutouts', status: 'in_progress' }
      ]
    },
    {
      id: 'milestone_5',
      title: 'Finishing & Quality Assurance',
      description: 'Taping, mudding, sanding, and final finishing',
      status: 'pending',
      start_date: '2025-01-26',
      estimated_completion: '2025-01-30',
      payment_amount: 450.00,
      payment_status: 'pending',
      tasks: [
        { id: 'task_14', name: 'Taping joints', status: 'pending' },
        { id: 'task_15', name: 'Apply joint compound', status: 'pending' },
        { id: 'task_16', name: 'Sanding and smoothing', status: 'pending' },
        { id: 'task_17', name: 'Prime surfaces', status: 'pending' },
        { id: 'task_18', name: 'Final cleanup', status: 'pending' },
        { id: 'task_19', name: 'Quality inspection', status: 'pending' }
      ]
    }
  ]
};

export default function CustomerPortalDemo() {
  const [selectedProject] = useState(mockProject);

  // Mock user data for demonstration
  const mockUser: CustomerAuthData = {
    id: 'cust_001',
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '(555) 123-4567',
    created_at: '2025-01-15T00:00:00Z',
    project_ids: ['proj_demo_001']
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Portal</h1>
              <p className="text-sm text-gray-600">Welcome back, {mockProject.customer.name}!</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{mockProject.customer.name}</div>
                <div className="text-xs text-gray-500">{mockProject.customer.email}</div>
              </div>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {mockProject.customer.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Demo Mode Active
                </h3>
                <div className="mt-1 text-sm text-blue-700">
                  This is a demonstration of the customer portal. In production, this would show your actual project data.
                </div>
              </div>
            </div>
          </div>
        </div>

        <ProjectDashboard
          user={mockUser}
          projectId={selectedProject.id}
        />
      </div>
    </div>
  );
}