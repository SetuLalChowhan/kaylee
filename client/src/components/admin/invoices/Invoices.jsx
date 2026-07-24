import React, { useState } from 'react';
import { Plus, Loader2, DollarSign, Clock, Receipt } from 'lucide-react';
import InvoiceCard from './InvoiceCard';
import InvoiceModal from './modals/InvoiceModal';
import DeleteInvoiceModal from './modals/DeleteInvoiceModal';
import InvoiceDetailsModal from './modals/InvoiceDetailsModal';
import {
  useInvoices,
  useCreateInvoice,
  useUpdateInvoice,
  useDeleteInvoice,
} from '@/api/apiHooks/useInvoice';

const Invoices = () => {
  const [statusFilter, setStatusFilter] = useState('All');

  // Fetch invoices dynamically based on status filter (now returns { invoices, stats })
  const { data: invoiceData, isLoading } = useInvoices(statusFilter);
  
  const invoices = invoiceData?.invoices || [];
  const stats = invoiceData?.stats || {
    totalCount: 0,
    totalAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
  };

  // Mutation hooks
  const createMutation = useCreateInvoice();
  const updateMutation = useUpdateInvoice();
  const deleteMutation = useDeleteInvoice();

  // Modal States
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleCreateInvoice = () => {
    setModalType('create');
    setSelectedInvoice(null);
    setIsInvoiceModalOpen(true);
  };

  const handleEditInvoice = (invoice) => {
    setModalType('edit');
    setSelectedInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
  };

  const handleInvoiceSubmit = (data) => {
    const payload = {
      invoiceNo: data.invoiceNo,
      campaign: data.campaign,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      amount: data.amount,
      status: data.status,
    };

    if (modalType === 'create') {
      createMutation.mutate(payload, {
        onSuccess: () => setIsInvoiceModalOpen(false),
      });
    } else {
      updateMutation.mutate(
        { id: selectedInvoice.id, invoiceData: payload },
        {
          onSuccess: () => setIsInvoiceModalOpen(false),
        }
      );
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedInvoice) {
      deleteMutation.mutate(selectedInvoice.id, {
        onSuccess: () => setIsDeleteModalOpen(false),
      });
    }
  };

  const formatCurrency = (amount) => {
    const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const tabs = [
    { key: 'All', label: `All Invoices (${stats.totalCount || 0})` },
    { key: 'Paid', label: `Paid (${stats.paidCount || 0})` },
    { key: 'Outstanding', label: `Outstanding (${stats.outstandingCount || 0})` },
  ];

  return (
    <div className="py-2">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Invoices</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Track payments across all your campaigns.</p>
        </div>

        <button
          onClick={handleCreateInvoice}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* Card 1: Paid Invoices */}
        <div className="bg-white border border-gray-100 hover:border-Primary/30 shadow-sm text-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between h-36 transition-all duration-300">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-0.5 text-[#1A1A1A]">
              {formatCurrency(stats.paidAmount)}
            </h2>
            <p className="text-gray-500 text-xs font-medium">
              {stats.paidCount || 0} Paid invoice{stats.paidCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Card 2: Outstanding Invoices */}
        <div className="bg-white border border-gray-100 hover:border-Primary/30 shadow-sm text-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between h-36 transition-all duration-300">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-0.5 text-[#1A1A1A]">
              {formatCurrency(stats.outstandingAmount)}
            </h2>
            <p className="text-gray-500 text-xs font-medium">
              {stats.outstandingCount || 0} Outstanding invoice{stats.outstandingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Card 3: Past 30 Days */}
        <div className="bg-white border border-gray-100 hover:border-Primary/30 shadow-sm text-[#1A1A1A] rounded-2xl p-4 flex flex-col justify-between h-36 transition-all duration-300">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Receipt className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-0.5 text-[#1A1A1A]">
              {formatCurrency(stats.earnedPast30Days || 0)}
            </h2>
            <p className="text-gray-500 text-xs font-medium">
              Past 30 days (total earned)
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1.5 bg-[#F8FAFC] border border-gray-100 rounded-2xl w-full overflow-x-auto mb-6 scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`whitespace-nowrap lg:px-5 px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                isActive
                  ? 'bg-white text-Primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Grid Loader/Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-Primary animate-spin" />
        </div>
      ) : invoices.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
          <p className="text-gray-400 text-sm font-semibold">No invoices found for status "{statusFilter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {invoices.map((invoice) => (
            <InvoiceCard
              key={invoice.id}
              invoice={{
                ...invoice,
                campaign: invoice.campaignName, // display backend campaignName
              }}
              onEdit={handleEditInvoice}
              onDelete={handleDeleteInvoice}
              onView={handleViewInvoice}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSubmit={handleInvoiceSubmit}
        type={modalType}
        invoice={selectedInvoice}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <InvoiceDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice ? {
          ...selectedInvoice,
          campaign: selectedInvoice.campaignName || selectedInvoice.campaign,
        } : null}
      />
    </div>
  );
};

export default Invoices;