'use client';

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PaperAirplaneIcon,
  EyeIcon,
  ArrowPathIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface ProjectMilestone {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'invoiced' | 'paid';
  amount: number;
  dueDate: string;
  completedDate?: string;
  stripeInvoiceId?: string;
  lineItems: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    category: 'labor' | 'materials' | 'equipment' | 'permit' | 'other';
  }>;
}

interface Project {
  id: string;
  name: string;
  customerName: string;
  customerEmail: string;
  status: 'planning' | 'in_progress' | 'completed';
  milestones: ProjectMilestone[];
}

interface FinancialReport {
  totalProjectValue: number;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
  milestoneStatus: {
    pending: number;
    completed: number;
    invoiced: number;
    paid: number;
  };
}

interface ProjectInvoiceManagerProps {
  projectId: string;
}

export default function ProjectInvoiceManager({ projectId }: ProjectInvoiceManagerProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [financialReport, setFinancialReport] = useState<FinancialReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    loadProjectData();
    loadFinancialReport();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      setLoading(true);
      
      // Mock project data for demo
      const mockProject: Project = {
        id: projectId,
        name: 'Basement Drywall Installation',
        customerName: 'John Smith',
        customerEmail: 'john.smith@email.com',
        status: 'in_progress',
        milestones: [
          {
            id: 'milestone_1',
            title: 'Project Planning & Preparation',
            description: 'Initial site assessment, material calculations, and project scheduling',
            status: 'paid',
            amount: 500.00,
            dueDate: '2025-01-20',
            completedDate: '2025-01-22',
            stripeInvoiceId: 'in_1234567890',
            lineItems: [
              { description: 'Site assessment', quantity: 1, unitPrice: 200.00, category: 'labor' },
              { description: 'Material calculations', quantity: 1, unitPrice: 150.00, category: 'labor' },
              { description: 'Project scheduling', quantity: 1, unitPrice: 150.00, category: 'labor' }
            ]
          },
          {
            id: 'milestone_2',
            title: 'Material Procurement & Delivery',
            description: 'Purchase and delivery of all required materials',
            status: 'paid',
            amount: 350.00,
            dueDate: '2025-01-23',
            completedDate: '2025-01-23',
            stripeInvoiceId: 'in_1234567891',
            lineItems: [
              { description: 'Drywall sheets (4x8 ft)', quantity: 12, unitPrice: 15.00, category: 'materials' },
              { description: 'Joint compound', quantity: 3, unitPrice: 25.00, category: 'materials' },
              { description: 'Screws and fasteners', quantity: 1, unitPrice: 45.00, category: 'materials' },
              { description: 'Delivery and staging', quantity: 1, unitPrice: 50.00, category: 'labor' }
            ]
          },
          {
            id: 'milestone_3',
            title: 'Drywall Installation',
            description: 'Install drywall sheets and corner beading',
            status: 'completed',
            amount: 400.00,
            dueDate: '2025-01-28',
            completedDate: '2025-01-25',
            lineItems: [
              { description: 'Drywall installation', quantity: 8, unitPrice: 35.00, category: 'labor' },
              { description: 'Corner bead installation', quantity: 4, unitPrice: 20.00, category: 'labor' },
              { description: 'Electrical outlet cutouts', quantity: 6, unitPrice: 10.00, category: 'labor' }
            ]
          },
          {
            id: 'milestone_4',
            title: 'Finishing & Quality Assurance',
            description: 'Taping, mudding, sanding, and final finishing',
            status: 'pending',
            amount: 350.00,
            dueDate: '2025-01-30',
            lineItems: [
              { description: 'Taping joints', quantity: 1, unitPrice: 120.00, category: 'labor' },
              { description: 'Mudding and sanding', quantity: 1, unitPrice: 150.00, category: 'labor' },
              { description: 'Primer application', quantity: 1, unitPrice: 80.00, category: 'labor' }
            ]
          }
        ]
      };

      setProject(mockProject);
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFinancialReport = async () => {
    try {
      // Mock financial report for demo
      const mockReport: FinancialReport = {
        totalProjectValue: 1600.00,
        totalInvoiced: 1250.00,
        totalPaid: 850.00,
        outstanding: 400.00,
        milestoneStatus: {
          pending: 1,
          completed: 1,
          invoiced: 0,
          paid: 2
        }
      };

      setFinancialReport(mockReport);
    } catch (error) {
      console.error('Error loading financial report:', error);
    }
  };

  const handleCompleteMilestone = async (milestoneId: string) => {
    try {
      setActionLoading(`complete_${milestoneId}`);
      
      // Mock API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update milestone status
      if (project) {
        const updatedMilestones = project.milestones.map(m => 
          m.id === milestoneId 
            ? { ...m, status: 'invoiced' as const, stripeInvoiceId: 'in_1234567892' }
            : m
        );
        setProject({ ...project, milestones: updatedMilestones });
      }

      // Refresh financial report
      await loadFinancialReport();
      
    } catch (error) {
      console.error('Error completing milestone:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateInvoice = async (milestoneId: string) => {
    try {
      setActionLoading(`invoice_${milestoneId}`);
      
      // Mock API call for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update milestone status
      if (project) {
        const updatedMilestones = project.milestones.map(m => 
          m.id === milestoneId 
            ? { ...m, status: 'invoiced' as const, stripeInvoiceId: 'in_1234567893' }
            : m
        );
        setProject({ ...project, milestones: updatedMilestones });
      }

      await loadFinancialReport();
      
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSyncPayments = async () => {
    try {
      setActionLoading('sync_payments');
      
      // Mock API call for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await loadFinancialReport();
      
    } catch (error) {
      console.error('Error syncing payments:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'invoiced':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-orange-500" />;
      case 'in_progress':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'invoiced': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-orange-100 text-orange-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
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
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center text-gray-500">Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
            <p className="text-sm text-gray-600">Customer: {project.customerName} ({project.customerEmail})</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncPayments}
              disabled={!!actionLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              <ArrowPathIcon className={`h-4 w-4 ${actionLoading === 'sync_payments' ? 'animate-spin' : ''}`} />
              <span>Sync Payments</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      {financialReport && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(financialReport.totalProjectValue)}</div>
              <div className="text-sm text-blue-700">Total Value</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatCurrency(financialReport.totalPaid)}</div>
              <div className="text-sm text-green-700">Total Paid</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(financialReport.totalInvoiced)}</div>
              <div className="text-sm text-yellow-700">Total Invoiced</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{formatCurrency(financialReport.outstanding)}</div>
              <div className="text-sm text-red-700">Outstanding</div>
            </div>
          </div>
        </div>
      )}

      {/* Milestones */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project Milestones</h3>
        </div>

        <div className="divide-y divide-gray-200">
          {project.milestones.map((milestone) => (
            <div key={milestone.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(milestone.status)}
                    <h4 className="text-sm font-medium text-gray-900">{milestone.title}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(milestone.status)}`}>
                      {milestone.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mt-1 text-sm text-gray-600">
                    {milestone.description}
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <CurrencyDollarIcon className="h-3 w-3" />
                      <span>Amount: {formatCurrency(milestone.amount)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ClockIcon className="h-3 w-3" />
                      <span>Due: {formatDate(milestone.dueDate)}</span>
                    </div>
                    {milestone.completedDate && (
                      <div className="flex items-center space-x-1">
                        <CheckCircleIcon className="h-3 w-3" />
                        <span>Completed: {formatDate(milestone.completedDate)}</span>
                      </div>
                    )}
                    {milestone.stripeInvoiceId && (
                      <div className="flex items-center space-x-1">
                        <DocumentTextIcon className="h-3 w-3" />
                        <span>Invoice {milestone.stripeInvoiceId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedMilestone(milestone)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>

                  {milestone.status === 'in_progress' && (
                    <button
                      onClick={() => handleCompleteMilestone(milestone.id)}
                      disabled={!!actionLoading}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === `complete_${milestone.id}` ? 'Processing...' : 'Complete & Invoice'}
                    </button>
                  )}

                  {milestone.status === 'completed' && (
                    <button
                      onClick={() => handleCreateInvoice(milestone.id)}
                      disabled={!!actionLoading}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {actionLoading === `invoice_${milestone.id}` ? 'Creating...' : 'Create Invoice'}
                    </button>
                  )}

                  {(milestone.status === 'invoiced' || milestone.status === 'paid') && milestone.stripeInvoiceId && (
                    <button
                      onClick={() => window.open(`https://dashboard.stripe.com/test/invoices/${milestone.stripeInvoiceId}`, '_blank')}
                      className="px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                    >
                      View Invoice
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Milestone Details</h3>
                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedMilestone.title}</h4>
                  <p className="text-gray-600 mt-1">{selectedMilestone.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedMilestone.status)}`}>
                      {selectedMilestone.status.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="ml-2 font-medium">{formatCurrency(selectedMilestone.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Due Date:</span>
                    <span className="ml-2">{formatDate(selectedMilestone.dueDate)}</span>
                  </div>
                  {selectedMilestone.completedDate && (
                    <div>
                      <span className="text-gray-600">Completed:</span>
                      <span className="ml-2">{formatDate(selectedMilestone.completedDate)}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-3">Line Items</h5>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedMilestone.lineItems.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">{item.description}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 text-sm text-gray-900 text-right font-medium">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}