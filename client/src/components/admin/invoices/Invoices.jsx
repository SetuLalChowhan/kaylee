import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import InvoiceCard from './InvoiceCard';
import InvoiceModal from './modals/InvoiceModal';
import DeleteInvoiceModal from './modals/DeleteInvoiceModal';

const Invoices = () => {
  const [invoices, setInvoices] = useState([
    { id: 1, invoiceNo: 'INV-1023', campaign: 'Nike UGC Shoot', issueDate: 'May 06, 2025', dueDate: 'May 20, 2025', status: 'Pending', amount: '$500.00' },
    { id: 2, invoiceNo: 'INV-1024', campaign: 'Nike UGC Shoot', issueDate: 'May 06, 2025', dueDate: 'May 20, 2025', status: 'Overdue', amount: '$500.00' },
    { id: 3, invoiceNo: 'INV-1025', campaign: 'Nike UGC Shoot', issueDate: 'May 06, 2025', dueDate: 'May 20, 2025', status: 'Paid', amount: '$500.00' },
    { id: 4, invoiceNo: 'INV-1026', campaign: 'Summer Skincare Promo', issueDate: 'May 06, 2025', dueDate: 'May 20, 2025', status: 'Paid', amount: '$500.00' },
    { id: 5, invoiceNo: 'INV-1026', campaign: 'Summer Skincare Promo', issueDate: 'May 06, 2025', dueDate: 'May 20, 2025', status: 'Paid', amount: '$500.00' },
  ]);

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
    if (modalType === 'create') {
      const newInvoice = {
        id: Date.now(),
        ...data,
      };
      setInvoices([...invoices, newInvoice]);
    } else {
      setInvoices(invoices.map(inv => inv.id === selectedInvoice.id ? { ...inv, ...data } : inv));
    }
    setIsInvoiceModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    setInvoices(invoices.filter(inv => inv.id !== selectedInvoice.id));
    setIsDeleteModalOpen(false);
  };

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {invoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onEdit={handleEditInvoice}
            onDelete={handleDeleteInvoice}
          />
        ))}
      </div>

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