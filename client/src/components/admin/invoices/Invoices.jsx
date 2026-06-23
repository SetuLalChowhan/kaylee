import React, { useState } from 'react';
import { Plus, Loader2, DollarSign, Clock, Receipt } from 'lucide-react';
import InvoiceCard from './InvoiceCard';
import InvoiceModal from './modals/InvoiceModal';
import DeleteInvoiceModal from './modals/DeleteInvoiceModal';
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-1">Invoices</h1>
          <p className="text-gray-400 text-sm font-medium">Track payments across all your campaigns</p>
        </div>

        <button
          onClick={handleCreateInvoice}
          className="flex items-center gap-2 bg-Primary text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
        >
          <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
            <Plus className="w-3 h-3" />
          </div>
          Create Invoice
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Paid Invoices (Blue Card) */}
        <div className="bg-Primary text-white rounded-[32px] p-8 shadow-xl shadow-Primary/20 relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight">
              {formatCurrency(stats.paidAmount)}
            </h2>
            <p className="text-white/80 text-sm font-semibold mt-1">
              {stats.paidCount || 0} Paid invoice{stats.paidCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Card 2: Outstanding Invoices (White Card) */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div className="w-12 h-12 bg-Primary/5 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6 text-Primary" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
              {formatCurrency(stats.outstandingAmount)}
            </h2>
            <p className="text-gray-400 text-sm font-semibold mt-1">
              {stats.outstandingCount || 0} Outstanding invoice{stats.outstandingCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Card 3: Total Invoices (White Card) */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[180px]">
          <div className="w-12 h-12 bg-Primary/5 rounded-2xl flex items-center justify-center">
            <Receipt className="w-6 h-6 text-Primary" />
          </div>
          <div className="mt-4">
            <h2 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">
              {formatCurrency(stats.totalAmount)}
            </h2>
            <p className="text-gray-400 text-sm font-semibold mt-1">
              {stats.totalCount || 0} Total invoice{stats.totalCount !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-4 mb-8 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-6 py-3 rounded-2xl text-xs md:text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-white border border-gray-200 text-Primary shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
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
      />

      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default Invoices;