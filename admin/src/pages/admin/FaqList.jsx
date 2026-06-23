import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Plus, Search, Edit3, Trash2, X, Loader2, HelpCircle, BookOpen } from "lucide-react";
import { toast } from "react-toastify";

const FaqList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState(null);

  // Form fields
  const [category, setCategory] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Fetch FAQs
  const { data: faqsData, isLoading: faqsLoading } = useQuery({
    queryKey: ["adminFaqs"],
    queryFn: async () => {
      const res = await axiosSecure.get("/faq");
      return res.data?.data || res.data || [];
    }
  });

  // Create FAQ Mutation
  const createMutation = useMutation({
    mutationFn: async (faqData) => {
      const res = await axiosSecure.post("/faq", faqData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("FAQ created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create FAQ");
    }
  });

  // Update FAQ Mutation (Uses PUT /api/faq/:id as defined in backend router)
  const updateMutation = useMutation({
    mutationFn: async ({ id, faqData }) => {
      const res = await axiosSecure.put(`/faq/${id}`, faqData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("FAQ updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update FAQ");
    }
  });

  // Delete FAQ Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/faq/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("FAQ deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminFaqs"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete FAQ");
    }
  });

  const openCreateModal = () => {
    setSelectedFaq(null);
    setCategory("");
    setQuestion("");
    setAnswer("");
    setIsOpen(true);
  };

  const openEditModal = (faq) => {
    setSelectedFaq(faq);
    setCategory(faq.category || "");
    setQuestion(faq.question || "");
    setAnswer(faq.answer || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedFaq(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedFaq) {
      updateMutation.mutate({
        id: selectedFaq.id,
        faqData: { category, question, answer }
      });
    } else {
      createMutation.mutate({
        category,
        question,
        answer
      });
    }
  };

  const handleDelete = (id, ques) => {
    const preview = ques.length > 30 ? `${ques.slice(0, 30)}...` : ques;
    if (window.confirm(`Are you sure you want to delete FAQ: "${preview}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const faqs = Array.isArray(faqsData) ? faqsData : [];

  const filteredFaqs = faqs.filter((faq) => {
    const term = search.toLowerCase();
    const cat = (faq.category || "").toLowerCase();
    const q = (faq.question || "").toLowerCase();
    const a = (faq.answer || "").toLowerCase();
    return cat.includes(term) || q.includes(term) || a.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">FAQ Control</h1>
          <p className="text-slate-500 text-sm mt-1">Manage public Frequently Asked Questions, categories, and content answers.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="w-full sm:w-auto bg-[#005BD6] hover:bg-[#005BD6]/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#005BD6]/10 cursor-pointer"
        >
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search FAQs by category, question, or answer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total FAQs found: {filteredFaqs.length}
        </div>
      </div>

      {/* FAQs List Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {faqsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#005BD6] animate-spin" />
          </div>
        ) : filteredFaqs.length > 0 ? (
          <div className="overflow-x-auto w-full custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Category</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Question</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400">Answer Preview</th>
                  <th className="py-3 px-4 md:py-4 md:px-6 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm">
                      <span className="text-[10px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 bg-slate-100 text-slate-600 rounded-full uppercase tracking-wider">
                        {faq.category || "General"}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm font-bold text-slate-800 max-w-xs truncate">
                      {faq.question}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm font-medium text-slate-500 max-w-md truncate">
                      {faq.answer}
                    </td>
                    <td className="py-2.5 px-3 md:py-4 md:px-6 text-xs md:text-sm text-center">
                      <div className="flex items-center justify-center gap-1.5 md:gap-2">
                        <button
                          onClick={() => openEditModal(faq)}
                          className="p-1.5 text-slate-500 hover:text-[#005BD6] hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit FAQ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id, faq.question)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete FAQ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium text-sm">No FAQs found.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl md:rounded-[32px] w-full max-w-lg p-5 md:p-8 border border-slate-100 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute right-4 top-4 md:right-6 md:top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              {selectedFaq ? "Edit FAQ" : "Create FAQ"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedFaq ? "Modify public question and corresponding answer." : "Publish a new frequently asked question."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Category</label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. GETTING STARTED"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Question</label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g. How do I get paid?"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Answer Content</label>
                <textarea
                  required
                  rows={5}
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter detailed FAQ answer here..."
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-center transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#005BD6] hover:bg-[#005BD6]/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedFaq ? (
                    "Save Changes"
                  ) : (
                    "Create FAQ"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FaqList;
