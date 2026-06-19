import React from 'react';
import { FileText, Download, Lock } from 'lucide-react';
import { toast } from 'react-toastify';
import { downloadFileDirectly } from '@/utils/download';

const BrandDocuments = ({ documents, releaseFiles }) => {
  const handleDownload = (doc) => {
    if (!releaseFiles) {
      toast.error("Downloads are locked. The creator has not released files yet.");
      return;
    }
    downloadFileDirectly(doc.url, doc.name);
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
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <FileText className="w-5 h-5 text-gray-400 shrink-0" />
            <span className="text-sm font-medium text-[#1A1A1A] truncate">{doc.name}</span>
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
            <button
              onClick={() => handleDownload(doc)}
              className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                releaseFiles
                  ? 'text-gray-400 hover:text-Primary hover:bg-gray-50 border-gray-100'
                  : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
              }`}
            >
              {releaseFiles ? <Download className="w-4 h-4" /> : <Lock className="w-4 h-4 text-orange-400" />}
            </button>
          </div>
        </div>
      ))}
      {documents.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No documents uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default BrandDocuments;
