import React, { useEffect } from 'react';
import { X, Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';

const InvoiceModal = ({ isOpen, onClose, onSubmit, invoice, type = 'create' }) => {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  useEffect(() => {
    if (invoice) {
      reset({
        invoiceNo: invoice.invoiceNo || '',
        campaign: invoice.campaign || '',
        issueDate: invoice.issueDate || '',
        dueDate: invoice.dueDate || '',
        amount: invoice.amount || '',
        status: invoice.status || 'Pending',
      });
    } else {
      reset({ invoiceNo: '', campaign: '', issueDate: '', dueDate: '', amount: '', status: 'Pending' });
    }
  }, [invoice, reset]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header - Fixed */}
          <div className="flex items-center justify-between p-10 border-b border-gray-50 bg-white relative z-20">
            <h2 className="text-2xl font-bold text-[#1A1A1A]">{type === 'create' ? 'Create Invoice' : 'Edit Invoice'}</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form - Scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <form onSubmit={handleSubmit(onSubmit)} className="p-10 space-y-8">
              {/* Invoice No */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Invoice No</label>
                <input
                  {...register('invoiceNo', type === 'create' ? { required: 'Invoice number is required' } : {})}
                  type="text"
                  placeholder="e.g. INV-1026"
                  className={`w-full bg-white border rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] placeholder:text-gray-300 ${type === 'create' && errors.invoiceNo ? 'border-red-500' : 'border-gray-100'}`}
                />
                {type === 'create' && errors.invoiceNo && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.invoiceNo.message}</p>}
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Campaign</label>
                <div className="relative group">
                  <select
                    {...register('campaign', type === 'create' ? { required: 'Please select a campaign' } : {})}
                    className={`w-full bg-white border rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] appearance-none ${type === 'create' && errors.campaign ? 'border-red-500' : 'border-gray-100'}`}
                  >
                    <option value="">Select a campaign</option>
                    <option value="Nike UGC Shoot">Nike UGC Shoot</option>
                    <option value="Summer Skincare Promo">Summer Skincare Promo</option>
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
                </div>
                {type === 'create' && errors.campaign && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.campaign.message}</p>}
              </div>

              {/* Dates Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Issue Date</label>
                  <div className="relative group">
                    <input
                      {...register('issueDate', type === 'create' ? { required: 'Required' } : {})}
                      type="date"
                      className={`w-full bg-white border rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] appearance-none ${type === 'create' && errors.issueDate ? 'border-red-500' : 'border-gray-100'}`}
                    />
                    <CalendarIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
                  </div>
                  {type === 'create' && errors.issueDate && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.issueDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Due Date</label>
                  <div className="relative group">
                    <input
                      {...register('dueDate', type === 'create' ? { required: 'Required' } : {})}
                      type="date"
                      className={`w-full bg-white border rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] appearance-none ${type === 'create' && errors.dueDate ? 'border-red-500' : 'border-gray-100'}`}
                    />
                    <CalendarIcon className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
                  </div>
                  {type === 'create' && errors.dueDate && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.dueDate.message}</p>}
                </div>
              </div>

              {/* Amount & Status Grid */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Amount</label>
                  <input
                    {...register('amount', type === 'create' ? { required: 'Required' } : {})}
                    type="text"
                    placeholder="Enter amount"
                    className={`w-full bg-white border rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] placeholder:text-gray-300 ${type === 'create' && errors.amount ? 'border-red-500' : 'border-gray-100'}`}
                  />
                  {type === 'create' && errors.amount && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#1A1A1A] mb-3">Status</label>
                  <div className="relative group">
                    <select
                      {...register('status')}
                      className="w-full bg-white border border-gray-100 rounded-2xl py-4 px-6 focus:border-Primary focus:outline-none transition-all text-[#1A1A1A] appearance-none"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 pointer-events-none group-focus-within:text-Primary transition-colors" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-gray-50 text-gray-500 py-5 rounded-2xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-Primary text-white py-5 rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
                >
                  {type === 'create' ? 'Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InvoiceModal;
