import React, { useRef } from 'react';
import { FileText, CloudUpload, Download, Trash2 } from 'lucide-react';
import { useUploadCampaignDocument, useDeleteCampaignDocument } from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';

const Documents = ({ campaign }) => {
  const fileRef = useRef(null);
  const uploadMutation = useUploadCampaignDocument();
  const deleteMutation = useDeleteCampaignDocument();

  const docs = campaign.documents || [];

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(f => {
      const formData = new FormData();
      formData.append('file', f);
      uploadMutation.mutate({ campaignId: campaign.id, formData });
    });
    // Reset file input value to allow uploading same file again
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      deleteMutation.mutate({ campaignId: campaign.id, id });
    }
  };

  const handleDownload = (doc) => {
    window.open(getImgUrl(doc.url), '_blank');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Documents</h3>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-5"
      >
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
        <CloudUpload className="w-7 h-7 text-Primary/40 mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag & drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="text-sm text-[#1A1A1A] truncate">{doc.name}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
              <button onClick={() => handleDownload(doc)} className="text-gray-400 hover:text-Primary transition-colors cursor-pointer">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(doc.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all cursor-pointer">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {docs.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Documents;
