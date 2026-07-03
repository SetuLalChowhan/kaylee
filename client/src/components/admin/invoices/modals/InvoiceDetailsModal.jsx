import React from 'react';
import { X, Printer, Receipt, DollarSign, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';

const InvoiceDetailsModal = ({ isOpen, onClose, invoice }) => {
  const user = useSelector(selectCurrentUser);

  if (!isOpen || !invoice) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const amountStr = (invoice.amount || '').startsWith('$') ? invoice.amount : `$${invoice.amount || '0.00'}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        {/* Print Styles */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #printable-invoice-area, #printable-invoice-area * {
              visibility: visible !important;
            }
            #printable-invoice-area {
              position: fixed !important;
              left: 0 !important;
              top: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              background: white !important;
              color: black !important;
              padding: 40px !important;
              box-shadow: none !important;
              border: none !important;
              z-index: 999999 !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}} />

        {/* Modal Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/25 backdrop-blur-sm no-print"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 md:p-8 border-b border-gray-50 bg-white relative z-20 no-print">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-Primary" />
              <h2 className="text-lg font-bold text-[#1A1A1A]">Invoice Details</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 bg-Primary/5 text-Primary text-xs font-bold rounded-xl hover:bg-Primary/10 transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                Print / Download
              </button>
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 bg-white cursor-pointer"
              >
                <X className="w-4 h-4 md:w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Invoice Body - Scrollable inside Modal */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
            
            {/* The actual printable area */}
            <div id="printable-invoice-area" className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
              
              {/* Top Banner / Billing Info */}
              <div className="flex flex-col md:flex-row justify-between gap-6 pb-8 border-b border-gray-100">
                {/* Creator Details */}
                <div>
                  <h3 className="text-xl font-black text-Primary tracking-tight mb-2">
                    {user?.displayName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'STAKD Creator'}
                  </h3>
                  <p className="text-xs text-gray-400 font-semibold">{user?.email}</p>
                  {user?.servicesOffered && (
                    <p className="text-xs text-gray-400 mt-1 max-w-xs">{user.servicesOffered}</p>
                  )}
                </div>

                {/* Invoice Metadata */}
                <div className="md:text-right">
                  <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider ${
                    invoice.status === 'Paid' ? 'bg-green-50 text-green-500' :
                    invoice.status === 'Pending' ? 'bg-orange-50 text-orange-500' :
                    'bg-red-50 text-red-500'
                  }`}>
                    {invoice.status}
                  </span>
                  <h4 className="text-base font-bold text-[#1A1A1A] mb-1">{invoice.invoiceNo}</h4>
                  <div className="flex items-center md:justify-end gap-1.5 text-xs text-gray-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    Issued: {formatDate(invoice.issueDate)}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="py-8 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">Billed To</p>
                <h4 className="text-sm font-bold text-[#1A1A1A]">{invoice.campaign || 'Campaign Client'}</h4>
                <p className="text-xs text-gray-400 mt-1 font-semibold">UGC Campaign Deliverables</p>
              </div>

              {/* Invoice Table / Items */}
              <div className="py-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 text-left">
                      <th className="pb-3 text-[10px] text-gray-400 uppercase tracking-wider font-bold">Description</th>
                      <th className="pb-3 text-right text-[10px] text-gray-400 uppercase tracking-wider font-bold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 text-xs font-bold text-[#1A1A1A] pr-4">
                        Campaign deliverables completed for "{invoice.campaign}"
                      </td>
                      <td className="py-4 text-right text-sm font-black text-[#1A1A1A] whitespace-nowrap">
                        {amountStr}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-5 md:p-6 mt-4">
                <div>
                  <p className="text-xs text-[#1A1A1A] font-bold">Total Amount</p>
                  <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Due date: {formatDate(invoice.dueDate)}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg md:text-xl font-black text-Primary">{amountStr}</p>
                </div>
              </div>

            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoiceDetailsModal;
