import React from 'react';
import { FileText, Download } from 'lucide-react';

const BrandDocuments = ({ documents }) => {
  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div key={doc.id} className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-5 py-4">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-[#1A1A1A]">{doc.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{doc.date}</span>
            <button className="text-gray-400 hover:text-Primary transition-colors">
              <Download className="w-4 h-4" />
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
