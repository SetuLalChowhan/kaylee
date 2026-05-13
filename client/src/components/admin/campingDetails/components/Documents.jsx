import React, { useState, useRef } from 'react';
import { FileText, CloudUpload, Download, Trash2 } from 'lucide-react';

const Documents = () => {
  const fileRef = useRef(null);
  const [docs, setDocs] = useState([
    { id: 1, name: 'Contract.pdf', date: 'Apr 15, 2026' },
  ]);

  const handleUpload = (e) => {
    const files = Array.from(e.target.files);
    const newDocs = files.map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
    }));
    setDocs(prev => [...prev, ...newDocs]);
    console.log('Documents Uploaded:', newDocs);
  };

  const handleDelete = (id) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    console.log('Document Deleted:', id);
  };

  const handleDownload = (doc) => {
    console.log('Document Download:', doc.name);
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
        <input ref={fileRef} type="file" multiple className="hidden" onChange={handleUpload} />
        <CloudUpload className="w-7 h-7 text-Primary/40 mb-2 group-hover:scale-110 transition-transform" />
        <p className="text-sm text-gray-400">Drag & drop files here</p>
        <p className="text-xs text-gray-300 italic my-1">or</p>
        <span className="text-Primary text-sm font-bold underline underline-offset-4">Choose files</span>
      </div>

      {/* List */}
      <div className="space-y-2">
        {docs.map((doc) => (
          <div key={doc.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3.5 group">
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-[#1A1A1A]">{doc.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-400">{doc.date}</span>
              <button onClick={() => handleDownload(doc)} className="text-gray-400 hover:text-Primary transition-colors">
                <Download className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(doc.id)} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents;
