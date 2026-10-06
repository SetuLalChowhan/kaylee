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
      if (f.size > 50 * 1024 * 1024) {
        toast.error(`Document "${f.name}" exceeds the 50MB limit.`);
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

      {/* Hidden file input isolated to prevent double clicks / dialog flicker */}
      <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} multiple />

      {/* Upload Area */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          fileRef.current?.click();
        }}
        className="border-2 border-dashed border-Primary/20 rounded-2xl p-8 flex flex-col items-center justify-center bg-Primary/[0.02] cursor-pointer hover:bg-Primary/[0.04] transition-all group mb-5"
      >
        <CloudUpload className="w-7 h-7 text-Primary/40 mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag & drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* List */}
      <div className="space-y-2.5">
        {Object.entries(uploadProgress).map(([filename, progress]) => (
          <div key={filename} className="bg-gradient-to-r from-Primary/5 via-white to-indigo-50/20 rounded-xl p-4 border border-Primary/20 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Loader2 className="w-4 h-4 text-Primary animate-spin shrink-0" />
                <span className="text-xs font-bold text-[#1A1A1A] truncate" title={filename}>{filename}</span>
              </div>
              <span className="text-xs font-black text-Primary shrink-0 ml-3">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-Primary via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ))}
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div 
              className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer group/link"
              onClick={() => handleDownload(doc)}
            >
              <FileText className="w-4 h-4 text-gray-400 group-hover/link:text-Primary transition-colors shrink-0" />
              <span className="text-sm text-[#1A1A1A] group-hover/link:text-Primary transition-colors truncate">{doc.name}</span>
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
