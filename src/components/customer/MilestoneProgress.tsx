/**
 * Milestone Progress Component
 * Visual representation of project milestones and progress
 */

'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  CalendarDaysIcon,
  CurrencyDollarIcon,
  DocumentIcon,
  PlayIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  completion_percentage: number;
  current_milestone: string;
}

interface MilestoneProgressProps {
  project: Project;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'upcoming';
  target_date: string;
  completed_date?: string;
  estimated_hours: number;
  actual_hours?: number;
  invoice_amount?: number;
  is_invoiced: boolean;
  deliverables: string[];
}

export default function MilestoneProgress({ project }: MilestoneProgressProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Generate milestone data based on project
  const getMilestones = (): Milestone[] => {
    const baseDate = new Date('2025-01-15');
    
    return [
      {
        id: 'ms1',
        title: 'Project Planning & Permits',
        description: 'Initial planning, material estimation, and permit acquisition',
        status: 'completed',
        target_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 8,
        actual_hours: 6,
        is_invoiced: false,
        deliverables: ['Project plan', 'Material list', 'Permit documentation']
      },
      {
        id: 'ms2',
        title: 'Site Preparation',
        description: 'Protect furniture, lay drop cloths, and prepare work area',
        status: 'completed',
        target_date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 4,
        actual_hours: 4,
        is_invoiced: false,
        deliverables: ['Protected work area', 'Material staging']
      },
      {
        id: 'ms3',
        title: 'Material Delivery & Setup',
        description: 'Delivery of drywall materials and staging for installation',
        status: 'completed',
        target_date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 6,
        actual_hours: 5,
        invoice_amount: 2550,
        is_invoiced: true,
        deliverables: ['Drywall sheets', 'Joint compound', 'Tape and fasteners']
      },
      {
        id: 'ms4',
        title: 'Drywall Installation',
        description: 'Install drywall sheets and secure to wall and ceiling framing',
        status: 'in_progress',
        target_date: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 24,
        actual_hours: 16,
        is_invoiced: false,
        deliverables: ['Installed drywall sheets', 'Secured fastening', 'Rough electrical cutouts']
      },
      {
        id: 'ms5',
        title: 'Taping & First Coat',
        description: 'Apply tape and first coat of joint compound to all seams',
        status: 'pending',
        target_date: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 16,
        invoice_amount: 1700,
        is_invoiced: false,
        deliverables: ['Taped seams', 'First mud coat', 'Corner beading']
      },
      {
        id: 'ms6',
        title: 'Second & Third Coats',
        description: 'Apply second and third coats of joint compound for smooth finish',
        status: 'upcoming',
        target_date: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 12,
        is_invoiced: false,
        deliverables: ['Smooth joint compound', 'Feathered edges', 'Level surfaces']
      },
      {
        id: 'ms7',
        title: 'Sanding & Finish Prep',
        description: 'Sand all surfaces smooth and prepare for texture/paint',
        status: 'upcoming',
        target_date: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 10,
        is_invoiced: false,
        deliverables: ['Sanded surfaces', 'Dust removal', 'Surface inspection']
      },
      {
        id: 'ms8',
        title: 'Texture Application',
        description: 'Apply desired texture pattern to match existing walls',
        status: 'upcoming',
        target_date: new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 8,
        is_invoiced: false,
        deliverables: ['Applied texture', 'Consistent pattern', 'Blended transitions']
      },
      {
        id: 'ms9',
        title: 'Final Inspection & Cleanup',
        description: 'Quality inspection, touch-ups, and complete site cleanup',
        status: 'upcoming',
        target_date: new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        estimated_hours: 6,
        invoice_amount: 1700,
        is_invoiced: false,
        deliverables: ['Quality inspection', 'Touch-up work', 'Complete cleanup']
      }
    ];
  };

  const milestones = getMilestones();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-8 w-8 text-green-600" />;
      case 'in_progress':
        return (
          <div className="relative">
            <ClockIcon className="h-8 w-8 text-blue-600" />
            <div className="absolute inset-0 border-2 border-blue-600 rounded-full animate-pulse"></div>
          </div>
        );
      case 'pending':
        return <div className="h-8 w-8 rounded-full border-2 border-yellow-400 bg-yellow-50 flex items-center justify-center">
          <div className="h-4 w-4 rounded-full bg-yellow-400"></div>
        </div>;
      default:
        return <div className="h-8 w-8 rounded-full border-2 border-gray-300 bg-gray-50"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const calculateProgress = () => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    const inProgress = milestones.filter(m => m.status === 'in_progress').length * 0.5;
    return Math.round(((completed + inProgress) / milestones.length) * 100);
  };

  const getTotalHours = () => {
    return milestones.reduce((sum, m) => sum + (m.actual_hours || m.estimated_hours), 0);
  };

  const getCompletedHours = () => {
    return milestones
      .filter(m => m.status === 'completed')
      .reduce((sum, m) => sum + (m.actual_hours || m.estimated_hours), 0);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
            <p className="text-gray-600 mt-1">Track progress through each project phase</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{calculateProgress()}%</div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Completed</span>
            </div>
            <div className="text-lg font-semibold text-green-700 mt-1">
              {milestones.filter(m => m.status === 'completed').length} of {milestones.length}
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-800">Hours Worked</span>
            </div>
            <div className="text-lg font-semibold text-blue-700 mt-1">
              {getCompletedHours()} of {getTotalHours()}
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="h-5 w-5 text-purple-600 mr-2" />
              <span className="text-sm font-medium text-purple-800">Invoiced</span>
            </div>
            <div className="text-lg font-semibold text-purple-700 mt-1">
              {milestones.filter(m => m.is_invoiced).length} milestones
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {milestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline line */}
              {index < milestones.length - 1 && (
                <div className="absolute left-4 top-12 w-0.5 h-16 bg-gray-200"></div>
              )}
              
              <div className="flex items-start space-x-4">
                {/* Status icon */}
                <div className="flex-shrink-0">
                  {getStatusIcon(milestone.status)}
                </div>
                
                {/* Milestone content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-base font-medium text-gray-900">{milestone.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      
                      {/* Milestone details */}
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <div className="flex items-center">
                          <CalendarDaysIcon className="h-4 w-4 mr-1" />
                          Target: {formatDate(milestone.target_date)}
                        </div>
                        
                        {milestone.completed_date && (
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Completed: {formatDate(milestone.completed_date)}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {milestone.actual_hours || milestone.estimated_hours}h
                        </div>
                        
                        {milestone.invoice_amount && (
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {formatCurrency(milestone.invoice_amount)}
                          </div>
                        )}
                      </div>

                      {/* Deliverables preview */}
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <DocumentIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {milestone.deliverables.length} deliverable{milestone.deliverables.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {milestone.status === 'in_progress' && (
                        <div className="flex items-center text-blue-600">
                          <PlayIcon className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Active</span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => setSelectedMilestone(milestone)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedMilestone.title}</h3>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedMilestone.status)}`}>
                    {selectedMilestone.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-700">{selectedMilestone.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Target Date</h4>
                    <p className="text-gray-700">{formatDate(selectedMilestone.target_date)}</p>
                  </div>
                  
                  {selectedMilestone.completed_date && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Completed Date</h4>
                      <p className="text-gray-700">{formatDate(selectedMilestone.completed_date)}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Estimated Hours</h4>
                    <p className="text-gray-700">{selectedMilestone.estimated_hours}h</p>
                  </div>
                  
                  {selectedMilestone.actual_hours && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-1">Actual Hours</h4>
                      <p className="text-gray-700">{selectedMilestone.actual_hours}h</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Deliverables</h4>
                  <ul className="space-y-1">
                    {selectedMilestone.deliverables.map((deliverable, index) => (
                      <li key={index} className="flex items-center text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                        {deliverable}
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedMilestone.invoice_amount && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Invoice Amount</span>
                      <span className="text-lg font-semibold text-blue-700">
                        {formatCurrency(selectedMilestone.invoice_amount)}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      {selectedMilestone.is_invoiced ? 'Invoice sent' : 'Invoice pending'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}