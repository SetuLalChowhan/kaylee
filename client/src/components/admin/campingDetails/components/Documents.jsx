import React, { useRef, useState } from 'react';
import { FileText, CloudUpload, Download, Trash2, Loader2 } from 'lucide-react';
import { useUploadCampaignDocument, useDeleteCampaignDocument } from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';
import { toast } from 'react-toastify';

const Documents = ({ campaign }) => {
  const fileRef = useRef(null);
  const uploadMutation = useUploadCampaignDocument();
  const deleteMutation = useDeleteCampaignDocument();
  const [uploadProgress, setUploadProgress] = useState({});

  const docs = campaign.documents || [];

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    for (const f of files) {
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`Document "${f.name}" exceeds the 10MB limit.`);
        continue;
      }

      const customTitle = window.prompt(`Enter a custom display title for document "${f.name}":`, f.name);
      if (customTitle === null) continue; // user cancelled this file

      const formData = new FormData();
      formData.append('file', f);
      formData.append('title', customTitle || f.name);

      setUploadProgress(prev => ({ ...prev, [f.name]: 0 }));

      uploadMutation.mutate({
        campaignId: campaign.id,
        formData,
        onProgress: (percent) => {
          setUploadProgress(prev => ({ ...prev, [f.name]: percent }));
        }
      }, {
        onSuccess: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[f.name];
            return next;
          });
        },
        onError: () => {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[f.name];
            return next;
          });
        }
      });
    }

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
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5 text-Primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Documents</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">Upload campaign briefs, scripts, invoice pdfs, contracts here; all of the important stuff in one place</p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-5"
      >
        <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} multiple />
        <CloudUpload className="w-7 h-7 text-Primary/40 mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag & drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {Object.entries(uploadProgress).map(([filename, progress]) => (
          <div key={filename} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 border border-dashed border-Primary/30">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Loader2 className="w-4 h-4 text-Primary animate-spin shrink-0" />
              <span className="text-sm text-Primary truncate">{filename} (Uploading...)</span>
            </div>
            <div className="flex items-center shrink-0 ml-4">
              <span className="text-xs font-bold text-Primary">{progress}%</span>
            </div>
          </div>
        ))}
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
        {docs.length === 0 && Object.keys(uploadProgress).length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">No documents uploaded yet.</p>
        )}
      </div>
    </div>
  );
};

export default Documents;
