import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Plus, Search, Edit3, Trash2, X, Loader2, FileText, Calendar, DollarSign } from "lucide-react";
import { toast } from "react-toastify";

const InvoiceList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal state
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Form fields
  const [invoiceNo, setInvoiceNo] = useState("");
  const [campaign, setCampaign] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("Pending");
  const [targetUserId, setTargetUserId] = useState("");

  // Fetch invoices
  const { data: invoicesData, isLoading: invoicesLoading } = useQuery({
    queryKey: ["adminInvoices"],
    queryFn: async () => {
      const res = await axiosSecure.get("/invoice");
      return res.data?.data || res.data || [];
    }
  });

  // Fetch users (to assign invoices to creators)
  const { data: usersData } = useQuery({
    queryKey: ["adminUsersForInvoices"],
    queryFn: async () => {
      const res = await axiosSecure.get("/user/admin/users");
      return res.data?.data || [];
    }
  });

  // Create Invoice Mutation
  const createMutation = useMutation({
    mutationFn: async (invoiceData) => {
      const res = await axiosSecure.post("/invoice", invoiceData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create invoice");
    }
  });

  // Update Invoice Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, invoiceData }) => {
      const res = await axiosSecure.patch(`/invoice/${id}`, invoiceData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Invoice updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
      closeModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update invoice");
    }
  });

  // Delete Invoice Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/invoice/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Invoice deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminInvoices"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete invoice");
    }
  });

  const openCreateModal = () => {
    setSelectedInvoice(null);
    setInvoiceNo(`INV-${Date.now().toString().slice(-6)}`);
    setCampaign("");
    setIssueDate("");
    setDueDate("");
    setAmount("");
    setStatus("Pending");
    setTargetUserId(usersData?.[0]?.id || "");
    setIsOpen(true);
  };

  const openEditModal = (inv) => {
    setSelectedInvoice(inv);
    setInvoiceNo(inv.invoiceNo || "");
    setCampaign(inv.campaignName || "");
    
    // Parse dates to YYYY-MM-DD
    const formatDate = (d) => {
      if (!d) return "";
      const dObj = new Date(d);
      return isNaN(dObj.getTime()) ? "" : dObj.toISOString().split("T")[0];
    };
    setIssueDate(formatDate(inv.issueDate));
    setDueDate(formatDate(inv.dueDate));
    setAmount(inv.amount || "");
    setStatus(inv.status || "Pending");
    setTargetUserId(inv.userId || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedInvoice(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedInvoice) {
      updateMutation.mutate({
        id: selectedInvoice.id,
        invoiceData: { invoiceNo, campaign, issueDate, dueDate, amount, status }
      });
    } else {
      createMutation.mutate({
        invoiceNo,
        campaign,
        issueDate,
        dueDate,
        amount,
        status,
        targetUserId
      });
    }
  };

  const handleDelete = (id, number) => {
    if (window.confirm(`Are you sure you want to delete invoice ${number}?`)) {
      deleteMutation.mutate(id);
    }
  };

  const invoices = Array.isArray(invoicesData) ? invoicesData : [];
  const users = usersData || [];

  const getUserName = (userId) => {
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : "Unknown Creator";
  };

  const filteredInvoices = invoices.filter((inv) => {
    const term = search.toLowerCase();
    const number = (inv.invoiceNo || "").toLowerCase();
    const camp = (inv.campaignName || "").toLowerCase();
    const creator = getUserName(inv.userId).toLowerCase();
    return number.includes(term) || camp.includes(term) || creator.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Invoices</h1>
          <p className="text-slate-500 text-sm mt-1">Audit creator invoices, processing statuses, and project billing.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-[#1F3C37]/10"
        >
          <Plus className="w-5 h-5" />
          Add Invoice
        </button>
      </div>

      {/* Search & Stats */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by invoice number, campaign, or creator..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total invoices found: {filteredInvoices.length}
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {invoicesLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#1F3C37] animate-spin" />
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Invoice No</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Campaign</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Creator</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Amount</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Issue Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Due Date</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#1F3C37]/5 flex items-center justify-center text-[#1F3C37]">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-800">{inv.invoiceNo}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{inv.campaignName || "General / None"}</td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{getUserName(inv.userId)}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{inv.amount}</p>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                      {new Date(inv.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium text-sm">
                      {new Date(inv.dueDate).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        inv.status === "Paid" ? "bg-green-50 text-green-600" :
                        inv.status === "Overdue" ? "bg-red-50 text-red-600" :
                        "bg-yellow-50 text-yellow-600"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(inv)}
                          className="p-2 text-slate-500 hover:text-[#1F3C37] hover:bg-slate-100 rounded-xl transition-all"
                          title="Edit Invoice"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id, inv.invoiceNo)}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <p className="text-slate-400 font-medium text-sm">No invoices found.</p>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 border border-slate-100 shadow-2xl relative">
            <button
              onClick={closeModal}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              {selectedInvoice ? "Edit Invoice" : "Create Invoice"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              {selectedInvoice ? "Modify invoice parameters or payment step." : "Issue a brand new creator invoice."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!selectedInvoice && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Target Creator</label>
                  <select
                    required
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  >
                    <option value="">Select a creator...</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Invoice Number</label>
                  <input
                    type="text"
                    required
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="INV-0001"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Invoice Amount</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="$350.00"
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Campaign Identifier</label>
                <input
                  type="text"
                  required
                  value={campaign}
                  onChange={(e) => setCampaign(e.target.value)}
                  placeholder="Winter Product Review"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Invoice Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1F3C37]/20 focus:border-[#1F3C37] text-sm transition-all"
                >
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
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
                  className="flex-1 bg-[#1F3C37] hover:bg-[#1F3C37]/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : selectedInvoice ? (
                    "Save Changes"
                  ) : (
                    "Create Invoice"
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

export default InvoiceList;
