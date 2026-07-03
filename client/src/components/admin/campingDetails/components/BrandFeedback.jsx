import React, { useState, useRef } from 'react';
import { MessageCircle, Paperclip, Play, X, FileText, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useUpdateUgcCampaign, useCreateFeedback } from '@/api/apiHooks/useUgcCampaign';
import { getImgUrl } from '@/utils/image';

const BrandFeedback = ({ campaign }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewMedia, setPreviewMedia] = useState(null);
  const fileInputRef = useRef(null);

  const updateCampaignMutation = useUpdateUgcCampaign();
  const createFeedbackMutation = useCreateFeedback();

  const handleStatusChange = (e) => {
    updateCampaignMutation.mutate({
      id: campaign.id,
      campaignData: { status: e.target.value },
    });
  };

  const handleReleaseToggle = () => {
    updateCampaignMutation.mutate({
      id: campaign.id,
      campaignData: { releaseFiles: !campaign.releaseFiles },
    });
  };

  const handleSend = () => {
    if (!newMessage.trim() && !selectedFile) return;

    const formData = new FormData();
    formData.append('text', newMessage);
    if (selectedFile) {
      formData.append('file', selectedFile);
    }

    createFeedbackMutation.mutate(
      { campaignId: campaign.id, formData },
      {
        onSuccess: () => {
          setNewMessage('');
          setSelectedFile(null);
        },
      }
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = campaign.feedback || [];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5 border-b border-gray-50 pb-4">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-Primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Brand Feedback</h3>
          <p className="text-xs text-gray-400">Collaborate and resolve revision requests</p>
        </div>
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Status Dropdown */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">Campaign Status</label>
          <div className="relative">
            <select
              value={campaign.status}
              onChange={handleStatusChange}
              className="w-full bg-white border border-gray-100 rounded-xl py-2 px-3 focus:outline-none focus:border-Primary text-xs font-bold text-[#1A1A1A] cursor-pointer"
            >
              <option value="Pending">Pending</option>
              <option value="Draft">Draft</option>
              <option value="Under Review">Under Review</option>
              <option value="Approved">Approved</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Release File toggle */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col justify-between">
          <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-2 block">Download Lock Status</label>
          <button
            onClick={handleReleaseToggle}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border ${
              campaign.releaseFiles
                ? 'bg-green-50 text-green-500 border-green-200 hover:bg-green-100/50'
                : 'bg-orange-50 text-orange-500 border-orange-200 hover:bg-orange-100/50'
            }`}
          >
            {campaign.releaseFiles ? 'Files Released for Brand' : 'Lock Downloads (Pending)'}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-[#F8FAFC] border border-gray-50 rounded-2xl p-4 min-h-[250px] max-h-[400px] overflow-y-auto custom-scrollbar space-y-3 mb-4">
        {messages.length > 0 ? (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'creator' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[80%] flex flex-col">
                {/* Media reference box */}
                {msg.media && (
                  <div 
                    onClick={() => setPreviewMedia(msg.media)}
                    className={`bg-white border border-gray-100 rounded-xl p-2 mb-1.5 shadow-sm w-[200px] cursor-pointer hover:opacity-95 transition-opacity text-left ${
                      msg.from === 'creator' ? 'self-end' : 'self-start'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 px-1 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-[#1A1A1A] truncate">{msg.media.name}</div>
                      </div>
                      <Eye className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-50 relative">
                      {msg.media.type === 'video' ? (
                        <>
                          <video
                            src={getImgUrl(msg.media.url)}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                            <div className="w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow">
                              <Play className="w-3 h-3 text-[#1A1A1A] ml-0.5" fill="#1A1A1A" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <img src={getImgUrl(msg.media.url)} alt="" className="w-full h-full object-cover" loading="lazy" />
                      )}
                    </div>
                  </div>
                )}

                <div className={`px-4 py-3 rounded-2xl text-sm break-words ${
                  msg.from === 'creator' 
                    ? 'bg-Primary text-white rounded-tr-none text-right' 
                    : 'bg-white text-[#1A1A1A] border border-gray-100 rounded-tl-none text-left'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {msg.fileUrl && (
                    <a
                      href={getImgUrl(msg.fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 flex items-center gap-1 text-xs font-bold ${
                        msg.from === 'creator' ? 'text-white/80 hover:text-white' : 'text-Primary hover:underline'
                      }`}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>Attachment ({msg.fileUrl.split('?')[0].split('/').pop()})</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[200px] text-gray-400">
            <MessageCircle className="w-8 h-8 text-gray-300 mb-2 animate-bounce" />
            <p className="text-xs font-medium">No messages yet. Send a message to start collaboration!</p>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="space-y-2">
        {selectedFile && (
          <div className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2 border border-gray-100">
            <span className="text-xs text-gray-500 font-bold truncate max-w-[80%]">{selectedFile.name}</span>
            <button onClick={() => setSelectedFile(null)} className="text-red-500 text-xs font-bold hover:underline">Remove</button>
          </div>
        )}
        <div className="flex items-center gap-2 md:gap-3 w-full">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => setSelectedFile(e.target.files[0] || null)}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`p-2.5 md:p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all shrink-0 ${
              selectedFile ? 'text-Primary bg-Primary/5' : 'text-gray-400'
            }`}
          >
            <Paperclip className="w-4.5 h-4.5 md:w-5 md:h-5" />
          </button>
          <input
            type="text"
            placeholder="Enter your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-white border border-gray-100 rounded-xl py-2 px-3 md:py-3 md:px-4 text-xs md:text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
          />
          <button
            onClick={handleSend}
            disabled={createFeedbackMutation.isPending}
            className="bg-Primary text-white px-4 md:px-5 py-2 md:py-3 rounded-xl text-xs md:text-sm font-bold hover:bg-Primary/90 transition-all disabled:opacity-50 shrink-0"
          >
            Send
          </button>
        </div>
      </div>
      {/* Media Preview Modal */}
      <AnimatePresence>
        {previewMedia && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setPreviewMedia(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-2xl w-full z-[1001]"
            >
              <button
                onClick={() => setPreviewMedia(null)}
                className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white transition-colors cursor-pointer border border-white/20 rounded-full bg-black/20"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="rounded-2xl overflow-hidden bg-black flex items-center justify-center relative">
                {previewMedia.type === 'video' ? (
                  <video
                    src={getImgUrl(previewMedia.url)}
                    className="w-full max-h-[75vh]"
                    controls
                    autoPlay
                    controlsList="nodownload"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    draggable="false"
                  />
                ) : (
                  <img
                    src={getImgUrl(previewMedia.url)}
                    alt={previewMedia.name}
                    className="w-full max-h-[75vh] object-contain"
                    loading="lazy"
                    onContextMenu={(e) => e.preventDefault()}
                    onDragStart={(e) => e.preventDefault()}
                    draggable="false"
                  />
                )}
              </div>
              <p className="mt-2 text-center text-white/70 text-xs font-medium">{previewMedia.name}</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandFeedback;
