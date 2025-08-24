/**
 * Project Status Tracker Component
 * Displays detailed project timeline and milestone progression
 */

'use client';

import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  estimated_completion: string;
  completion_percentage: number;
  current_milestone: string;
}

interface ProjectStatusTrackerProps {
  project: Project;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending' | 'delayed';
  target_date: string;
  completed_date?: string;
  duration_days: number;
}

export default function ProjectStatusTracker({ project }: ProjectStatusTrackerProps) {
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);

  // Mock milestone data based on project type
  const getMilestones = (): Milestone[] => {
    const baseDate = new Date(project.start_date);
    
    return [
      {
        id: 'milestone_1',
        title: 'Project Planning & Permits',
        description: 'Finalize project scope, obtain necessary permits, and schedule materials',
        status: 'completed',
        target_date: new Date(baseDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(baseDate.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 2
      },
      {
        id: 'milestone_2', 
        title: 'Material Delivery & Site Prep',
        description: 'Deliver materials and prepare work area for installation',
        status: 'completed',
        target_date: new Date(baseDate.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        completed_date: new Date(baseDate.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 3
      },
      {
        id: 'milestone_3',
        title: 'Drywall Installation',
        description: 'Install drywall sheets and secure to framing',
        status: 'in_progress',
        target_date: new Date(baseDate.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 5
      },
      {
        id: 'milestone_4',
        title: 'Taping & Mudding',
        description: 'Apply tape and joint compound to seams',
        status: 'pending',
        target_date: new Date(baseDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 3
      },
      {
        id: 'milestone_5',
        title: 'Sanding & Finishing',
        description: 'Sand surfaces smooth and apply finish texture',
        status: 'pending',
        target_date: new Date(baseDate.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 4
      },
      {
        id: 'milestone_6',
        title: 'Prime & Paint Ready',
        description: 'Apply primer and prepare surface for final painting',
        status: 'pending',
        target_date: new Date(baseDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 2
      },
      {
        id: 'milestone_7',
        title: 'Final Inspection & Cleanup',
        description: 'Quality inspection and site cleanup',
        status: 'pending',
        target_date: new Date(baseDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString(),
        duration_days: 1
      }
    ];
  };

  const milestones = getMilestones();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
      case 'in_progress':
        return <ClockIcon className="h-6 w-6 text-blue-600" />;
      case 'delayed':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300"></div>;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateProgress = () => {
    const completed = milestones.filter(m => m.status === 'completed').length;
    return Math.round((completed / milestones.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Project Timeline Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Project Timeline</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-lg font-semibold text-gray-900">{calculateProgress()}%</p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>

        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>Started {formatDate(project.start_date)}</span>
          <span>Est. Completion {formatDate(project.estimated_completion)}</span>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Project Milestones</h3>
          
          <div className="space-y-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative">
                {/* Timeline line */}
                {index < milestones.length - 1 && (
                  <div className="absolute left-3 top-10 w-0.5 h-16 bg-gray-200"></div>
                )}
                
                <div className="flex items-start space-x-4">
                  {/* Status icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(milestone.status)}
                  </div>
                  
                  {/* Milestone content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                          {milestone.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedMilestone(milestone)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                    
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
                        {milestone.duration_days} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Current Phase</p>
            <p className="text-lg font-semibold text-gray-900">{project.current_milestone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Project Manager</p>
            <div className="flex items-center">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-gray-900">John Smith</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900">Latest Update</h4>
          <p className="text-sm text-blue-800 mt-1">
            Drywall installation is progressing well. We've completed the main living areas and are now working on the bedroom walls. 
            Expect to finish this phase by end of week.
          </p>
          <p className="text-xs text-blue-600 mt-2">Updated 2 hours ago</p>
        </div>
      </div>

      {/* Milestone Detail Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{selectedMilestone.title}</h3>
              <button
                onClick={() => setSelectedMilestone(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMilestone.status)}`}>
                  {selectedMilestone.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-900">{selectedMilestone.description}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-500">Timeline</p>
                <p className="text-gray-900">Target: {formatDate(selectedMilestone.target_date)}</p>
                {selectedMilestone.completed_date && (
                  <p className="text-gray-900">Completed: {formatDate(selectedMilestone.completed_date)}</p>
                )}
                <p className="text-gray-900">Duration: {selectedMilestone.duration_days} days</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}