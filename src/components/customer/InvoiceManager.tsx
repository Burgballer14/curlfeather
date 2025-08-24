/**
 * Invoice Manager Component
 * Displays project invoices with payment options
 */

'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCardIcon, 
  DocumentTextIcon, 
  CheckCircleIcon, 
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import StripePaymentForm from './StripePaymentForm';

interface InvoiceManagerProps {
  projectId: string;
  totalCost: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  milestone: string;
  description: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial';
  due_date: string;
  paid_date?: string;
  paid_amount?: number;
  created_at: string;
  payment_url?: string;
  pdf_url?: string;
}

interface PaymentHistory {
  id: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  paid_at: string;
  status: 'succeeded' | 'failed' | 'pending';
}

export default function InvoiceManager({ projectId, totalCost }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
    loadPaymentHistory();
  }, [projectId]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      
      // Mock invoice data - in real implementation, this would fetch from your API
      const mockInvoices: Invoice[] = [
        {
          id: 'inv_1',
          invoice_number: 'INV-2025-001',
          milestone: 'Project Initiation',
          description: 'Initial deposit for materials and project setup',
          amount: 2550.00, // 30% of $8500
          status: 'paid',
          due_date: '2025-01-20',
          paid_date: '2025-01-18',
          paid_amount: 2550.00,
          created_at: '2025-01-15T00:00:00Z',
          pdf_url: '/invoices/inv-2025-001.pdf'
        },
        {
          id: 'inv_2',
          invoice_number: 'INV-2025-002',
          milestone: 'Drywall Installation Complete',
          description: 'Payment for drywall installation and materials',
          amount: 3400.00, // 40% of $8500
          status: 'sent',
          due_date: '2025-01-25',
          created_at: '2025-01-20T00:00:00Z',
          payment_url: '/pay/inv-2025-002',
          pdf_url: '/invoices/inv-2025-002.pdf'
        },
        {
          id: 'inv_3',
          invoice_number: 'INV-2025-003',
          milestone: 'Project Completion',
          description: 'Final payment upon project completion',
          amount: 2550.00, // 30% of $8500
          status: 'draft',
          due_date: '2025-02-15',
          created_at: '2025-01-15T00:00:00Z'
        }
      ];

      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async () => {
    try {
      // Mock payment history data
      const mockPaymentHistory: PaymentHistory[] = [
        {
          id: 'pay_1',
          invoice_id: 'inv_1',
          amount: 2550.00,
          payment_method: 'Credit Card (**** 4242)',
          transaction_id: 'pi_1234567890',
          paid_at: '2025-01-18T14:30:00Z',
          status: 'succeeded'
        }
      ];

      setPaymentHistory(mockPaymentHistory);
    } catch (error) {
      console.error('Failed to load payment history:', error);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      case 'partial': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'sent':
        return <ClockIcon className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-600" />;
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

  const calculateTotalPaid = (): number => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + (invoice.paid_amount || invoice.amount), 0);
  };

  const calculateOutstanding = (): number => {
    return invoices
      .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'draft')
      .reduce((sum, invoice) => sum + invoice.amount, 0);
  };

  const handlePayInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedInvoice(null);
    loadInvoices(); // Refresh invoices after payment
    loadPaymentHistory(); // Refresh payment history
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Financial Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Project Financials</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Project Cost</h3>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalCost)}</p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600 uppercase tracking-wide">Total Paid</h3>
            <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(calculateTotalPaid())}</p>
            <p className="text-sm text-green-600 mt-1">
              {Math.round((calculateTotalPaid() / totalCost) * 100)}% completed
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-600 uppercase tracking-wide">Outstanding</h3>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatCurrency(calculateOutstanding())}</p>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-600 uppercase tracking-wide">Remaining</h3>
            <p className="text-2xl font-bold text-yellow-700 mt-1">
              {formatCurrency(totalCost - calculateTotalPaid())}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Payment Progress</span>
            <span>{Math.round((calculateTotalPaid() / totalCost) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${(calculateTotalPaid() / totalCost) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Project Invoices</h3>
          <p className="text-gray-600 mt-1">Track and pay your project milestones</p>
        </div>

        <div className="divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(invoice.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-sm font-medium text-gray-900">{invoice.invoice_number}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                        {invoice.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium text-gray-700 mt-1">{invoice.milestone}</p>
                    <p className="text-sm text-gray-600">{invoice.description}</p>
                    
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        Due: {formatDate(invoice.due_date)}
                      </div>
                      {invoice.paid_date && (
                        <div className="flex items-center">
                          <CheckCircleIcon className="h-4 w-4 mr-1" />
                          Paid: {formatDate(invoice.paid_date)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.amount)}</p>
                  {invoice.paid_amount && invoice.paid_amount < invoice.amount && (
                    <p className="text-sm text-gray-600">
                      Paid: {formatCurrency(invoice.paid_amount)}
                    </p>
                  )}
                  
                  <div className="flex items-center space-x-2 mt-2">
                    {invoice.pdf_url && (
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <EyeIcon className="h-3 w-3 mr-1" />
                        View
                      </button>
                    )}
                    
                    {invoice.pdf_url && (
                      <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                        Download
                      </button>
                    )}
                    
                    {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                      <button
                        onClick={() => handlePayInvoice(invoice)}
                        className="inline-flex items-center px-3 py-1 border border-transparent rounded-md text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <CreditCardIcon className="h-3 w-3 mr-1" />
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment History</h3>
            <p className="text-gray-600 mt-1">Record of all payments made</p>
          </div>

          <div className="divide-y divide-gray-200">
            {paymentHistory.map((payment) => {
              const invoice = invoices.find(inv => inv.id === payment.invoice_id);
              return (
                <div key={payment.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {invoice?.invoice_number} - {invoice?.milestone}
                      </h4>
                      <p className="text-sm text-gray-600">{payment.payment_method}</p>
                      <p className="text-xs text-gray-500">
                        Transaction ID: {payment.transaction_id}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">
                        {formatCurrency(payment.amount)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {formatDate(payment.paid_at)}
                      </p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {payment.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-full overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Pay Invoice</h3>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900">{selectedInvoice.invoice_number}</h4>
                <p className="text-sm text-gray-600">{selectedInvoice.milestone}</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {formatCurrency(selectedInvoice.amount)}
                </p>
              </div>

              <StripePaymentForm
                invoiceId={selectedInvoice.id}
                amount={Math.round(selectedInvoice.amount * 100)} // Convert to cents for Stripe
                description={`Payment for ${selectedInvoice.invoice_number} - ${selectedInvoice.milestone}`}
                projectId={projectId}
                milestoneId={selectedInvoice.milestone}
                customerEmail="customer@example.com" // TODO: Get from user context
                customerName="Customer Name" // TODO: Get from user context
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentError={(error: string) => {
                  console.error('Payment failed:', error);
                  alert('Payment failed. Please try again.');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}