import React, { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
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

  // Fetch invoices dynamically based on status filter
  const { data: invoices = [], isLoading } = useInvoices(statusFilter);

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
    // Format payload to backend fields
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

  const tabs = ['All', 'Paid', 'Pending', 'Overdue'];

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

      {/* Tabs Filter */}
      <div className="flex gap-2 mb-8 border-b border-gray-100 pb-4 overflow-x-auto custom-scrollbar">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab;
          return (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-6 py-2.5 rounded-full text-xs md:text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-Primary text-white shadow-lg shadow-Primary/20'
                  : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
              }`}
            >
              {tab}
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