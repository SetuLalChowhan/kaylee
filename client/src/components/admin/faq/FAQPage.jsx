import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Plus, X } from 'lucide-react';
import FAQItem from './components/FAQItem';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import { useForm } from 'react-hook-form';
import { useFaqs, useCreateFaq, useUpdateFaq, useDeleteFaq } from '@/api/apiHooks/useFaq';
import { motion, AnimatePresence } from 'motion/react';

const FAQPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const user = useSelector(selectCurrentUser);
  const isAdmin = user?.role === 'admin';

  // React Query Hooks
  const { data: faqs = [], isLoading } = useFaqs();
  const createFaqMutation = useCreateFaq();
  const updateFaqMutation = useUpdateFaq();
  const deleteFaqMutation = useDeleteFaq();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  // Open modal for Create
  const handleAddFaq = () => {
    setEditingFaq(null);
    reset({ category: '', question: '', answer: '' });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditFaq = (faq) => {
    setEditingFaq(faq);
    reset({
      category: faq.category,
      question: faq.question,
      answer: faq.answer
    });
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDeleteFaq = (faqId) => {
    if (window.confirm("Are you sure you want to delete this FAQ?")) {
      deleteFaqMutation.mutate(faqId);
    }
  };

  const onSubmit = (data) => {
    if (editingFaq) {
      updateFaqMutation.mutate(
        { id: editingFaq.id, faqData: data },
        {
          onSuccess: () => setIsModalOpen(false)
        }
      );
    } else {
      createFaqMutation.mutate(data, {
        onSuccess: () => setIsModalOpen(false)
      });
    }
  };

  // Group faqs by category dynamically
  const groupedFaqs = React.useMemo(() => {
    const groups = {};
    const filtered = faqs.filter(faq => 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    filtered.forEach(faq => {
      const categoryUpper = faq.category.toUpperCase();
      if (!groups[categoryUpper]) {
        groups[categoryUpper] = [];
      }
      groups[categoryUpper].push(faq);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items
    }));
  }, [faqs, searchQuery]);

  return (
    <div className="py-2">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-6 md:mb-10">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-1.5 md:mb-2">FAQ</h1>
          <p className="text-gray-500 text-xs md:text-sm">Everything you need to know about STAKD and other information.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 w-full md:w-80">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search your questions.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-2.5 md:py-3 pl-11 pr-5 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm"
            />
          </div>
          {isAdmin && (
            <button
              onClick={handleAddFaq}
              className="bg-Primary text-white px-5 py-3 md:px-6 md:py-3.5 rounded-xl md:rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-Primary/20 hover:bg-Primary/90 transition-all text-xs md:text-sm w-full sm:w-auto cursor-pointer"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              Add FAQ
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-Primary"></div>
        </div>
      ) : groupedFaqs.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-3xl border border-gray-50">
          <p className="text-gray-400 text-sm font-bold">No FAQs found matching your query.</p>
        </div>
      ) : (
        /* FAQ Sections */
        <div className="lg:space-y-8 space-y-4">
          {groupedFaqs.map((section, idx) => (
            <div key={idx} className="space-y-6">
              <h2 className="text-sm font-bold text-Primary uppercase tracking-tight ml-2">
                {section.category}
              </h2>
              <div className="space-y-0">
                {section.items.map((item) => (
                  <FAQItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    isAdmin={isAdmin}
                    onEdit={() => handleEditFaq(item)}
                    onDelete={() => handleDeleteFaq(item.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl md:rounded-[40px] shadow-2xl p-6 md:p-10 z-10"
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 md:top-8 md:right-8 p-1.5 md:p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 border border-gray-100 bg-white"
              >
                <X className="w-5 h-5 md:w-6 md:h-6" />
              </button>

              <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-6">
                {editingFaq ? 'Edit FAQ' : 'Add FAQ'}
              </h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2">Category</label>
                  <input
                    {...register('category', { required: 'Category is required' })}
                    type="text"
                    placeholder="e.g. GETTING STARTED"
                    className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
                  />
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2">Question</label>
                  <input
                    {...register('question', { required: 'Question is required' })}
                    type="text"
                    placeholder="e.g. How do I get started?"
                    className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A]"
                  />
                  {errors.question && <p className="text-xs text-red-500 mt-1">{errors.question.message}</p>}
                </div>

                <div>
                  <label className="block text-xs md:text-sm font-bold text-[#1A1A1A] mb-2">Answer</label>
                  <textarea
                    {...register('answer', { required: 'Answer is required' })}
                    rows={4}
                    placeholder="Enter answer..."
                    className="w-full bg-white border border-gray-100 rounded-xl md:rounded-2xl py-3 px-4 focus:border-Primary focus:outline-none transition-all text-xs md:text-sm text-[#1A1A1A] resize-none"
                  />
                  {errors.answer && <p className="text-xs text-red-500 mt-1">{errors.answer.message}</p>}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-xl md:rounded-2xl font-bold hover:bg-gray-100 transition-colors text-xs md:text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-Primary text-white py-3 rounded-xl md:rounded-2xl font-bold hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20 text-xs md:text-sm"
                  >
                    {createFaqMutation.isPending || updateFaqMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQPage;