'use client';

import { useState, useEffect } from 'react';
import { Appointment } from '@/lib/calendar/calendar-engine';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  source: 'quote_form' | 'chatbot' | 'appointment';
  projectType: string;
  address?: string;
  estimatedCost?: number;
  leadScore: number;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'closed';
  createdAt: Date;
  notes?: string;
  appointmentDate?: string;
  appointmentTime?: string;
}

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  scheduledAppointments: number;
  conversionRate: number;
  averageLeadScore: number;
  recentActivity: number;
}

export default function LeadDashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    newLeads: 0,
    scheduledAppointments: 0,
    conversionRate: 0,
    averageLeadScore: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'leads' | 'appointments'>('overview');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name'>('date');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load leads data (simulated for now)
      const mockLeads: Lead[] = [
        {
          id: 'lead_1',
          name: 'John Smith',
          email: 'john@example.com',
          phone: '(555) 123-4567',
          source: 'quote_form',
          projectType: 'New Construction',
          address: '123 Main St, Denver, CO',
          estimatedCost: 8500,
          leadScore: 85,
          status: 'qualified',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          notes: 'Interested in basement finishing project'
        },
        {
          id: 'lead_2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          phone: '(555) 987-6543',
          source: 'chatbot',
          projectType: 'Repair Work',
          address: '456 Oak Ave, Boulder, CO',
          leadScore: 72,
          status: 'new',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          notes: 'Emergency repair needed - ceiling damage'
        },
        {
          id: 'lead_3',
          name: 'Mike Wilson',
          email: 'mike@example.com',
          phone: '(555) 456-7890',
          source: 'appointment',
          projectType: 'Texture Work',
          address: '789 Pine St, Aurora, CO',
          leadScore: 95,
          status: 'converted',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          appointmentDate: '2024-01-25',
          appointmentTime: '10:00',
          notes: 'Commercial project - multiple rooms'
        }
      ];

      setLeads(mockLeads);

      // Calculate stats
      const newLeadsCount = mockLeads.filter(lead => lead.status === 'new').length;
      const appointmentsCount = mockLeads.filter(lead => lead.source === 'appointment').length;
      const convertedCount = mockLeads.filter(lead => lead.status === 'converted').length;
      const conversionRate = mockLeads.length > 0 ? (convertedCount / mockLeads.length) * 100 : 0;
      const averageScore = mockLeads.reduce((sum, lead) => sum + lead.leadScore, 0) / mockLeads.length;

      setStats({
        totalLeads: mockLeads.length,
        newLeads: newLeadsCount,
        scheduledAppointments: appointmentsCount,
        conversionRate: Math.round(conversionRate),
        averageLeadScore: Math.round(averageScore),
        recentActivity: mockLeads.filter(lead => 
          new Date(lead.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'quote_form':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'chatbot':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'appointment':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-yellow-100 text-yellow-800',
      contacted: 'bg-blue-100 text-blue-800',
      qualified: 'bg-green-100 text-green-800',
      converted: 'bg-purple-100 text-purple-800',
      closed: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getLeadScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const filteredLeads = leads
    .filter(lead => filterStatus === 'all' || lead.status === filterStatus)
    .sort((a, b) => {
      switch (sortBy) {
        case 'score':
          return b.leadScore - a.leadScore;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and manage your leads and appointments</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
            <p className="text-2xl font-bold text-gray-900">{stats.totalLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">New Leads</h3>
            <p className="text-2xl font-bold text-yellow-600">{stats.newLeads}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Appointments</h3>
            <p className="text-2xl font-bold text-purple-600">{stats.scheduledAppointments}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-green-600">{stats.conversionRate}%</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Avg Lead Score</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.averageLeadScore}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Recent Activity</h3>
            <p className="text-2xl font-bold text-indigo-600">{stats.recentActivity}</p>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="converted">Converted</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'name')}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>

            <button
              onClick={loadDashboardData}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Leads Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getSourceIcon(lead.source)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {lead.source.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{lead.projectType}</div>
                      {lead.address && <div className="text-sm text-gray-500">{lead.address}</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLeadScoreColor(lead.leadScore)}`}>
                        {lead.leadScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(lead.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.estimatedCost ? `$${lead.estimatedCost.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                      <button className="text-green-600 hover:text-green-900 mr-3">Contact</button>
                      <button className="text-purple-600 hover:text-purple-900">Schedule</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredLeads.length === 0 && (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-sm text-gray-500">No leads match your current filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}