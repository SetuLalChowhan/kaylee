import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  Loader2,
  DollarSign,
  Clock,
  Receipt,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);

  // Close floating action menu on window scroll or resize
  useEffect(() => {
    if (!activeMenu) return;
    const handleClose = () => setActiveMenu(null);
    window.addEventListener('scroll', handleClose, true);
    window.addEventListener('resize', handleClose);
    return () => {
      window.removeEventListener('scroll', handleClose, true);
      window.removeEventListener('resize', handleClose);
    };
  }, [activeMenu]);

  // Fetch invoices with status filter, pagination, search, and stats
  const { data: invoiceData, isLoading, isFetching } = useInvoices(statusFilter, page, limit, search);

  const invoices = invoiceData?.invoices || [];
  const pagination = invoiceData?.pagination || {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
  const stats = invoiceData?.stats || {
    totalCount: 0,
    totalAmount: 0,
    paidCount: 0,
    paidAmount: 0,
    outstandingCount: 0,
    outstandingAmount: 0,
    earnedPast30Days: 0,
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
    setActiveMenuId(null);
  };

  const handleDeleteInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
    setActiveMenuId(null);
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setIsDetailsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleStatusChange = (invoice, newStatus) => {
    updateMutation.mutate({
      id: invoice.id,
      invoiceData: { status: newStatus },
    });
    setActiveMenuId(null);
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

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-600">
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600">
            Pending
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-600">
            Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">
            {status || 'Pending'}
          </span>
        );
    }
  };

  const tabs = [
    { key: 'All', label: `All Invoices (${stats.totalCount || 0})` },
    { key: 'Paid', label: `Paid (${stats.paidCount || 0})` },
    { key: 'Pending', label: `Pending (${stats.pendingCount ?? Math.max(0, (stats.totalCount || 0) - (stats.paidCount || 0) - (stats.overdueCount || 0))})` },
    { key: 'Overdue', label: `Overdue (${stats.overdueCount || 0})` },
  ];

  const startIndex = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endIndex = Math.min(pagination.page * pagination.limit, pagination.total);

  const isInitialLoading = isLoading && invoices.length === 0;

  return (
    <div className="py-2 space-y-6 font-urbanist">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">Invoices</h1>
          <p className="text-gray-500 text-xs md:text-sm font-medium">Track and manage client invoice payments.</p>
        </div>

        <button
          onClick={handleCreateInvoice}
          className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full md:w-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 md:w-5 md:h-5" />
          Create Invoice
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

      {/* Filter and Search Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Tabs Filter */}
        <div className="flex items-center gap-1.5 p-1.5 bg-[#F4F6FA] border border-gray-200/70 rounded-2xl overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setStatusFilter(tab.key);
                  setPage(1);
                }}
                className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition-all cursor-pointer ${isActive
                    ? 'bg-white text-Primary shadow-sm ring-1 ring-black/5'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-white/60'
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Invoices Table View Container */}
      <div className="bg-white border border-gray-100 rounded-2xl md:rounded-3xl shadow-sm overflow-hidden relative">
        {/* Subtle background fetching progress bar */}
        {isFetching && !isInitialLoading && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-Primary/20 overflow-hidden z-10">
            <div className="h-full bg-Primary w-1/3 animate-[pulse_1s_ease-in-out_infinite]" />
          </div>
        )}

        <div className="overflow-x-auto min-h-[240px]">
          <table className={`w-full text-left border-collapse transition-opacity duration-200 ${isFetching && !isInitialLoading ? 'opacity-70' : 'opacity-100'}`}>
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice #</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Brand</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Issue Date</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                <th className="py-4 px-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isInitialLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="animate-pulse">
                    {/* Invoice # */}
                    <td className="py-4 px-5">
                      <div className="h-4 bg-gray-200/70 rounded-md w-24" />
                    </td>
                    {/* Brand */}
                    <td className="py-4 px-5">
                      <div className="h-4 bg-gray-200/70 rounded-md w-32" />
                    </td>
                    {/* Amount */}
                    <td className="py-4 px-5">
                      <div className="h-4 bg-gray-200/70 rounded-md w-16" />
                    </td>
                    {/* Status */}
                    <td className="py-4 px-5">
                      <div className="h-6 bg-gray-200/70 rounded-full w-20" />
                    </td>
                    {/* Issue Date */}
                    <td className="py-4 px-5">
                      <div className="h-4 bg-gray-200/70 rounded-md w-24" />
                    </td>
                    {/* Due Date */}
                    <td className="py-4 px-5">
                      <div className="h-4 bg-gray-200/70 rounded-md w-24" />
                    </td>
                    {/* Action */}
                    <td className="py-4 px-5 text-right">
                      <div className="h-7 w-7 bg-gray-200/70 rounded-lg ml-auto" />
                    </td>
                  </tr>
                ))
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16">
                    <Receipt className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm font-bold">No invoices found</p>
                    <p className="text-gray-400 text-xs mt-0.5">Try changing filters or create a new invoice.</p>
                  </td>
                </tr>
              ) : (
                invoices.map((invoice) => {
                  const isOverdue = invoice.status === 'Overdue';
                  const isMenuOpen = activeMenu?.id === invoice.id;
                  const formattedAmount = (invoice.amount || '').startsWith('$')
                    ? invoice.amount
                    : `$${parseFloat(invoice.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

                  return (
                    <tr
                      key={invoice.id}
                      onClick={() => handleViewInvoice(invoice)}
                      className="hover:bg-gray-50/70 transition-colors group cursor-pointer"
                    >
                      {/* Invoice # */}
                      <td className="py-4 px-5 text-sm font-bold text-[#1A1A1A]">
                        {invoice.invoiceNo}
                      </td>

                      {/* Brand / Campaign */}
                      <td className="py-4 px-5 text-sm font-semibold text-gray-700">
                        {invoice.campaignName || invoice.campaign || 'General'}
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-5 text-sm font-bold text-[#1A1A1A]">
                        {formattedAmount}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-5 text-sm">
                        {getStatusBadge(invoice.status)}
                      </td>

                      {/* Issue Date */}
                      <td className="py-4 px-5 text-xs text-gray-500 font-medium">
                        {formatDate(invoice.issueDate)}
                      </td>

                      {/* Due Date */}
                      <td className={`py-4 px-5 text-xs font-medium ${isOverdue ? 'text-rose-500 font-bold' : 'text-gray-500'}`}>
                        {formatDate(invoice.dueDate)}
                      </td>

                      {/* Action (3 dots dropdown) */}
                      <td
                        className="py-4 px-5 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMenu?.id === invoice.id) {
                              setActiveMenu(null);
                            } else {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const spaceBelow = window.innerHeight - rect.bottom;
                              const openUpward = spaceBelow < 250 && rect.top > 250;
                              setActiveMenu({
                                id: invoice.id,
                                invoice,
                                top: openUpward ? undefined : rect.bottom + 6,
                                bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
                                right: Math.max(12, window.innerWidth - rect.right),
                              });
                            }
                          }}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-gray-100 text-[#1A1A1A]' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Floating Portal Action Menu */}
        {typeof document !== 'undefined' && createPortal(
          <AnimatePresence>
            {activeMenu && (
              <>
                {/* Backdrop to close */}
                <div
                  className="fixed inset-0 z-[9998] bg-transparent"
                  onClick={() => setActiveMenu(null)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    setActiveMenu(null);
                  }}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: activeMenu.bottom !== undefined ? 5 : -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: activeMenu.bottom !== undefined ? 5 : -5 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'fixed',
                    top: activeMenu.top,
                    bottom: activeMenu.bottom,
                    right: activeMenu.right,
                    zIndex: 9999,
                  }}
                  className="w-44 bg-white border border-gray-100 rounded-xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.18)] py-1.5 text-left overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      handleViewInvoice(activeMenu.invoice);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-Primary transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>View Details</span>
                  </button>
                  <button
                    onClick={() => {
                      handleEditInvoice(activeMenu.invoice);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-Primary transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-gray-400" />
                    <span>Edit Invoice</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1" />

                  {activeMenu.invoice.status !== 'Paid' && (
                    <button
                      onClick={() => {
                        handleStatusChange(activeMenu.invoice, 'Paid');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Mark as Paid</span>
                    </button>
                  )}

                  {activeMenu.invoice.status !== 'Pending' && (
                    <button
                      onClick={() => {
                        handleStatusChange(activeMenu.invoice, 'Pending');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Mark as Pending</span>
                    </button>
                  )}

                  {activeMenu.invoice.status !== 'Overdue' && (
                    <button
                      onClick={() => {
                        handleStatusChange(activeMenu.invoice, 'Overdue');
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>Mark as Overdue</span>
                    </button>
                  )}

                  <div className="h-px bg-gray-100 my-1" />

                  <button
                    onClick={() => {
                      handleDeleteInvoice(activeMenu.invoice);
                      setActiveMenu(null);
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50/70 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Pagination Footer */}
        {pagination.total > 0 && (
          <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white">
            <p className="text-xs text-gray-500 font-medium">
              Showing <span className="font-bold text-[#1A1A1A]">{startIndex}</span> to{' '}
              <span className="font-bold text-[#1A1A1A]">{endIndex}</span> of{' '}
              <span className="font-bold text-[#1A1A1A]">{pagination.total}</span> invoices
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page <= 1 || isLoading}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => {
                // Show first, last, and neighboring pages if many pages
                if (
                  pagination.totalPages > 6 &&
                  pageNum !== 1 &&
                  pageNum !== pagination.totalPages &&
                  Math.abs(pageNum - page) > 1
                ) {
                  if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                    return <span key={pageNum} className="px-1 text-gray-300 text-xs">...</span>;
                  }
                  return null;
                }

                const isCurrent = pageNum === page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    disabled={isLoading}
                    className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${isCurrent
                        ? 'bg-Primary text-white shadow-sm shadow-Primary/20'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-[#1A1A1A]'
                      }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                disabled={page >= pagination.totalPages || isLoading}
                className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-[#1A1A1A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

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
        isDeleting={deleteMutation.isPending}
        invoiceNo={selectedInvoice?.invoiceNo}
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