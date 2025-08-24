'use client';

import { useState, useEffect } from 'react';
import { CustomerAuthData } from '@/lib/auth/auth-client';
import ProjectStatusTracker from './ProjectStatusTracker';
import PhotoGallery from './PhotoGallery';
import InvoiceManager from './InvoiceManager';
import MilestoneProgress from './MilestoneProgress';
import { 
  BuildingOffice2Icon,
  PhotoIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';

interface ProjectDashboardProps {
  user: CustomerAuthData;
  projectId: string | null;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'on_hold';
  start_date: string;
  estimated_completion: string;
  actual_completion?: string;
  total_cost: number;
  paid_amount: number;
  current_milestone: string;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export default function ProjectDashboard({ user, projectId }: ProjectDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'photos' | 'invoices'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [user.id]);

  useEffect(() => {
    if (projectId && projects.length > 0) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setSelectedProject(project);
      }
    } else if (projects.length > 0) {
      setSelectedProject(projects[0]);
    }
  }, [projectId, projects]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      
      // Simulate loading customer projects
      const mockProjects: Project[] = [
        {
          id: 'proj_1',
          name: 'Basement Drywall Installation',
          description: 'Complete drywall installation and finishing for basement renovation',
          status: 'in_progress',
          start_date: '2025-01-15',
          estimated_completion: '2025-02-15',
          total_cost: 8500,
          paid_amount: 2550, // 30% deposit
          current_milestone: 'Drywall Installation',
          completion_percentage: 45,
          created_at: '2025-01-10T00:00:00Z',
          updated_at: '2025-01-23T00:00:00Z'
        },
        {
          id: 'proj_2',
          name: 'Kitchen Ceiling Repair',
          description: 'Repair water damage and retexture kitchen ceiling',
          status: 'planning',
          start_date: '2025-02-01',
          estimated_completion: '2025-02-05',
          total_cost: 1200,
          paid_amount: 0,
          current_milestone: 'Project Planning',
          completion_percentage: 0,
          created_at: '2025-01-20T00:00:00Z',
          updated_at: '2025-01-23T00:00:00Z'
        }
      ];

      setProjects(mockProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'planning': return 'text-yellow-600 bg-yellow-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'on_hold': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your projects...</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-gray-600">Your Project Portal</p>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <BuildingOffice2Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Once we start working on your project, you'll be able to track progress here.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}!</h1>
                <p className="text-gray-600">Your Project Portal</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Cog6ToothIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Project Selector */}
            {projects.length > 1 && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Project
                </label>
                <select
                  value={selectedProject?.id || ''}
                  onChange={(e) => {
                    const project = projects.find(p => p.id === e.target.value);
                    setSelectedProject(project || null);
                  }}
                  className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'progress'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 mr-2" />
                  Progress
                </div>
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'photos'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2" />
                  Photos
                </div>
              </button>
              <button
                onClick={() => setActiveTab('invoices')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'invoices'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 mr-2" />
                  Invoices & Payments
                </div>
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedProject && (
          <>
            {/* Project Overview Section */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Project Header */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{selectedProject.name}</h2>
                      <p className="text-gray-600 mt-1">{selectedProject.description}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProject.status)}`}>
                      {selectedProject.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Project Progress</span>
                      <span>{selectedProject.completion_percentage}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedProject.completion_percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Timeline</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Started: {formatDate(selectedProject.start_date)}</p>
                      <p className="text-sm text-gray-600">Est. Completion: {formatDate(selectedProject.estimated_completion)}</p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Financial</h3>
                    <div className="mt-2">
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(selectedProject.total_cost)}</p>
                      <p className="text-sm text-gray-600">
                        Paid: {formatCurrency(selectedProject.paid_amount)} ({Math.round((selectedProject.paid_amount / selectedProject.total_cost) * 100)}%)
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Current Phase</h3>
                    <div className="mt-2">
                      <p className="text-lg font-semibold text-gray-900">{selectedProject.current_milestone}</p>
                      <p className="text-sm text-gray-600">Last updated: {formatDate(selectedProject.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Milestone Progress */}
                <MilestoneProgress project={selectedProject} />
              </div>
            )}

            {/* Progress Tab */}
            {activeTab === 'progress' && (
              <ProjectStatusTracker project={selectedProject} />
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <PhotoGallery projectId={selectedProject.id} />
            )}

            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <InvoiceManager projectId={selectedProject.id} totalCost={selectedProject.total_cost} />
            )}
          </>
        )}
      </main>
    </div>
  );
}