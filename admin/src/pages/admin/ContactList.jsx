import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAxiosSecure from "@/hooks/useAxiosSecure";
import { Search, Edit3, Trash2, X, Loader2, Mail, User, MessageSquare, Calendar } from "lucide-react";
import { toast } from "react-toastify";

const ContactList = () => {
  const axiosSecure = useAxiosSecure();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);

  // Form fields for editing
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Fetch Contacts (Protected Admin API)
  const { data: contactsData, isLoading: contactsLoading } = useQuery({
    queryKey: ["adminContacts"],
    queryFn: async () => {
      const res = await axiosSecure.get("/contact");
      return res.data?.data || res.data || [];
    }
  });

  // Update Contact Mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, contactData }) => {
      const res = await axiosSecure.put(`/contact/${id}`, contactData);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Contact message updated successfully");
      queryClient.invalidateQueries({ queryKey: ["adminContacts"] });
      closeEditModal();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update contact message");
    }
  });

  // Delete Contact Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axiosSecure.delete(`/contact/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success("Contact message deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["adminContacts"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to delete contact message");
    }
  });

  const openDetailsModal = (contact) => {
    setSelectedContact(contact);
    setIsDetailsOpen(true);
  };

  const openEditModal = (contact) => {
    setSelectedContact(contact);
    setFirstName(contact.firstName || "");
    setLastName(contact.lastName || "");
    setEmail(contact.email || "");
    setMessage(contact.message || "");
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedContact(null);
  };

  const closeDetailsModal = () => {
    setIsDetailsOpen(false);
    setSelectedContact(null);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!selectedContact) return;
    updateMutation.mutate({
      id: selectedContact.id,
      contactData: { firstName, lastName, email, message }
    });
  };

  const handleDelete = (id, senderName) => {
    if (window.confirm(`Are you sure you want to delete the message from: "${senderName}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const contacts = Array.isArray(contactsData) ? contactsData : [];

  const filteredContacts = contacts.filter((c) => {
    const term = search.toLowerCase();
    const fname = (c.firstName || "").toLowerCase();
    const lname = (c.lastName || "").toLowerCase();
    const mail = (c.email || "").toLowerCase();
    const msg = (c.message || "").toLowerCase();
    return fname.includes(term) || lname.includes(term) || mail.includes(term) || msg.includes(term);
  });

  return (
    <div className="font-outfit p-1 text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-[#1A1A1A]">Contacts Inbox</h1>
          <p className="text-slate-500 text-sm mt-1">Review, update, and manage all incoming customer support messages.</p>
        </div>
      </div>

      {/* Search Bar & Stats */}
      <div className="bg-white rounded-3xl p-6 mb-6 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, or message contents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 pl-11 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="text-slate-400 text-sm font-semibold">
          Total messages: {filteredContacts.length}
        </div>
      </div>

      {/* Contacts List Grid & Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {contactsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#005BD6] animate-spin" />
          </div>
        ) : filteredContacts.length > 0 ? (
          <>
            {/* Desktop View Table */}
            <div className="hidden lg:block overflow-x-auto w-full custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Sender</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Email Address</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Message Preview</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400">Date Received</th>
                    <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-slate-400 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-slate-50/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-bold text-slate-800">
                        {contact.firstName} {contact.lastName}
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-[#005BD6]">
                        {contact.email}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-500 max-w-sm truncate">
                        {contact.message}
                      </td>
                      <td className="py-4 px-6 text-xs font-bold text-slate-400">
                        {formatDate(contact.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-sm text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openDetailsModal(contact)}
                            className="bg-Primary/10 text-Primary font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-Primary/20 transition-all cursor-pointer"
                            title="View Full Message"
                          >
                            Details
                          </button>
                          <button
                            onClick={() => openEditModal(contact)}
                            className="p-1.5 text-slate-500 hover:text-[#005BD6] hover:bg-slate-100 rounded-xl transition-all"
                            title="Edit Record"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`)}
                            className="p-1.5 text-red-400 hover:text-red-655 hover:bg-red-50 rounded-xl transition-all"
                            title="Delete Record"
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

            {/* Mobile/Tablet Card Layout */}
            <div className="lg:hidden p-4 space-y-4">
              {filteredContacts.map((contact) => (
                <div key={contact.id} className="border border-slate-100 rounded-2xl p-4 shadow-sm bg-slate-50/20 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-800">
                        {contact.firstName} {contact.lastName}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-semibold">{formatDate(contact.createdAt)}</p>
                    </div>
                    <span className="text-xs font-semibold text-[#005BD6] bg-Primary/5 px-2.5 py-0.5 rounded-full truncate max-w-[150px]">
                      {contact.email}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 font-medium line-clamp-3">
                    {contact.message}
                  </p>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100/50">
                    <button
                      onClick={() => openDetailsModal(contact)}
                      className="bg-Primary/10 text-Primary font-bold text-xs py-1.5 px-3 rounded-lg hover:bg-Primary/20 transition-all cursor-pointer"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => openEditModal(contact)}
                      className="p-1.5 text-slate-500 hover:text-[#005BD6] hover:bg-slate-100 rounded-xl transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(contact.id, `${contact.firstName} ${contact.lastName}`)}
                      className="p-1.5 text-red-400 hover:text-red-655 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-slate-400 font-medium text-sm">No contact submissions found.</p>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {isDetailsOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl md:rounded-[32px] w-full max-w-xl p-6 md:p-8 border border-slate-100 shadow-2xl relative max-h-[85vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={closeDetailsModal}
              className="absolute right-4 top-4 md:right-6 md:top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-6 flex items-center gap-2">
              <Mail className="w-6 h-6 text-[#005BD6]" />
              Submission Details
            </h2>

            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Name</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <User className="w-4 h-4 text-slate-400" />
                    {selectedContact.firstName} {selectedContact.lastName}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Date Received</span>
                  <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {formatDate(selectedContact.createdAt)}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                <p className="text-sm font-bold text-[#005BD6] flex items-center gap-1.5 mt-1 select-all">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {selectedContact.email}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Message Content</span>
                <div className="text-sm font-medium text-slate-700 mt-2 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded-lg border border-slate-100">
                  {selectedContact.message}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={closeDetailsModal}
                  className="w-full sm:w-auto bg-[#005BD6] hover:bg-[#005BD6]/90 text-white font-bold py-3 px-8 rounded-xl text-center transition-all text-sm cursor-pointer shadow-md shadow-[#005BD6]/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal Dialog */}
      {isEditOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999] p-4">
          <div className="bg-white rounded-2xl md:rounded-[32px] w-full max-w-lg p-5 md:p-8 border border-slate-100 shadow-2xl relative">
            <button
              onClick={closeEditModal}
              className="absolute right-4 top-4 md:right-6 md:top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <h2 className="text-2xl font-extrabold text-[#1A1A1A] mb-2">
              Edit Submission
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Modify the contact message record parameters.
            </p>

            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">First Name</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Last Name</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#005BD6]/20 focus:border-[#005BD6] text-sm transition-all resize-none"
                />
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-3.5 rounded-xl text-center transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-[#005BD6] hover:bg-[#005BD6]/90 text-white font-bold py-3.5 rounded-xl text-center transition-all text-sm flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Save Changes"
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

export default ContactList;
