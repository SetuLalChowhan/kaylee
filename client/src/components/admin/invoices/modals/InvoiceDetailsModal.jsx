import React from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Printer,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  const user = useSelector(selectCurrentUser);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (!invoice) return null;

  const rawAmount = typeof invoice.amount === 'string'
    ? parseFloat(invoice.amount.replace(/[^0-9.-]+/g, '') || 0)
    : Number(invoice.amount || 0);

  const formattedAmount = (invoice?.amount || '').startsWith('$')
    ? invoice.amount
    : `$${rawAmount ? rawAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : (invoice?.amount || '0.00')}`;

  const creatorName =
    user?.displayName ||
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    'STAKD Creator';

  const campaignTitle =
    invoice.campaignName || invoice.campaign || 'Campaign Deliverables';

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
        return {
          pill: 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
          dot: 'bg-emerald-500',
          label: 'PAID',
        };
      case 'Pending':
        return {
          pill: 'bg-amber-50 text-amber-700 border border-amber-200/60',
          dot: 'bg-amber-500',
          label: 'PENDING',
        };
      case 'Overdue':
        return {
          pill: 'bg-rose-50 text-rose-700 border border-rose-200/60',
          dot: 'bg-rose-500',
          label: 'OVERDUE',
        };
      default:
        return {
          pill: 'bg-gray-50 text-gray-700 border border-gray-200',
          dot: 'bg-gray-400',
          label: status || 'DRAFT',
        };
    }
  };

  const statusBadge = getStatusBadge(invoice.status);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div
          id="invoice-print-portal"
          key="invoice-details-modal"
          className="fixed inset-0 z-[1000] flex items-center justify-center p-3 sm:p-5 md:p-6"
        >
          {/* High-End Clean A4 Print Stylesheet */}
          <style
            dangerouslySetInnerHTML={{
              __html: `
              @media print {
                @page {
                  size: A4 portrait;
                  margin: 15mm 18mm;
                }
                
                /* Hide everything outside the invoice portal */
                #root, body > *:not(#invoice-print-portal) {
                  display: none !important;
                }

                html, body {
                  background: #ffffff !important;
                  color: #0f172a !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  overflow: visible !important;
                  height: auto !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }

                #invoice-print-portal {
                  display: block !important;
                  position: static !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                  background: #ffffff !important;
                  overflow: visible !important;
                }

                .invoice-modal-card {
                  position: static !important;
                  transform: none !important;
                  max-width: 100% !important;
                  max-height: none !important;
                  height: auto !important;
                  overflow: visible !important;
                  box-shadow: none !important;
                  border: none !important;
                  border-radius: 0 !important;
                  background: #ffffff !important;
                  padding: 0 !important;
                }

                .invoice-scroll-area {
                  overflow: visible !important;
                  max-height: none !important;
                  height: auto !important;
                  padding: 0 !important;
                }

                #printable-invoice-area {
                  border: none !important;
                  border-radius: 0 !important;
                  padding: 0 !important;
                  box-shadow: none !important;
                  background: #ffffff !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                }

                .no-print {
                  display: none !important;
                }
              }
            `,
            }}
          />

          {/* Modal Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm no-print cursor-pointer"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="invoice-modal-card relative w-full max-w-2xl bg-white rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] z-10 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Toolbar */}
            <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-4.5 border-b border-gray-100 bg-[#FAFAFA] relative z-20 no-print">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-Primary" />
                <h2 className="text-sm md:text-base font-bold text-[#1A1A1A]">
                  Invoice Details
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-Primary text-white text-xs font-semibold rounded-lg hover:bg-Primary/90 active:scale-95 transition-all shadow-xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-gray-200/60 rounded-lg transition-colors text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Container with Clean A4 Document Body */}
            <div className="invoice-scroll-area flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 md:p-10 bg-white">
              {/* THE CLEAN TECH A4 INVOICE SHEET (No outer box/shadow) */}
              <div
                id="printable-invoice-area"
                className="w-full bg-white text-slate-900 font-sans"
              >
                {/* 1. Header Row */}
                <div className="flex justify-between items-start pb-8 border-b border-gray-200">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                      {creatorName}
                    </h3>
                    <p className="text-xs text-slate-500 font-normal mt-1">
                      {user?.email || 'creator@stakd.io'}
                    </p>
                    {user?.servicesOffered && (
                      <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                        {user.servicesOffered}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-lg font-black tracking-wider text-slate-900">
                        INVOICE
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${statusBadge.pill}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                        {statusBadge.label}
                      </span>
                    </div>
                    <p className="text-sm font-mono font-semibold text-slate-700">
                      {invoice.invoiceNo}
                    </p>
                  </div>
                </div>

                {/* 2. Metadata Strip (Clean 4-column tech layout) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-b border-gray-200 text-xs">
                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Invoice Date
                    </span>
                    <span className="font-semibold text-slate-900 mt-1 block">
                      {formatDate(invoice.issueDate)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Due Date
                    </span>
                    <span className="font-semibold text-slate-900 mt-1 block">
                      {formatDate(invoice.dueDate)}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Billed To
                    </span>
                    <span className="font-semibold text-slate-900 mt-1 block truncate">
                      {campaignTitle}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount Due
                    </span>
                    <span className="font-bold text-slate-900 mt-1 block">
                      {formattedAmount}
                    </span>
                  </div>
                </div>

                {/* 3. Clean Table */}
                <div className="py-6">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="pb-3 w-1/2">Description</th>
                        <th className="pb-3 text-center">Qty</th>
                        <th className="pb-3 text-right">Unit Price</th>
                        <th className="pb-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-xs">
                      <tr>
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-slate-900">
                            Campaign Deliverables — {campaignTitle}
                          </p>
                          <p className="text-[11px] text-slate-500 font-normal mt-0.5">
                            High-resolution UGC content creation, editing, and commercial licensing.
                          </p>
                        </td>
                        <td className="py-4 text-center font-medium text-slate-600">
                          1
                        </td>
                        <td className="py-4 text-right font-medium text-slate-600">
                          {formattedAmount}
                        </td>
                        <td className="py-4 text-right font-bold text-slate-900">
                          {formattedAmount}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 4. Financial Totals (Right-aligned, clean) */}
                <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start gap-6">
                  <div className="text-xs text-slate-400 max-w-xs space-y-1">
                    <p className="font-semibold text-slate-600 uppercase text-[10px] tracking-wider">
                      Payment Details
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Payment due on receipt. Thank you for your partnership!
                    </p>
                  </div>

                  <div className="w-full sm:w-56 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">{formattedAmount}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Platform Fee</span>
                      <span className="font-semibold text-slate-900">$0.00</span>
                    </div>
                    <div className="h-px bg-gray-200 my-1.5" />
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-slate-900">Total</span>
                      <span className="font-black text-slate-900">{formattedAmount}</span>
                    </div>
                  </div>
                </div>

                {/* 5. Minimal Footer */}
                <div className="mt-12 pt-6 border-t border-gray-100 flex justify-between items-center text-[10px] text-slate-400">
                  <span>Generated via STAKD Platform</span>
                  <span>Page 1 of 1</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : null;
};

export default InvoiceDetailsModal;
