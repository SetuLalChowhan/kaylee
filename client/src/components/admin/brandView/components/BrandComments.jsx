import React from 'react';
import { MessageCircle, Eye, Paperclip } from 'lucide-react';
import { getImgUrl } from '@/utils/image';

const BrandComments = ({ comments, newComment, setNewComment, onSend, onPreviewMedia }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-Primary" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Campaign Feedback</h3>
        </div>

        {/* Chat area */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4 min-h-[350px] max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
          {comments.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'creator' ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-[80%] flex flex-col">
                {/* Avatar and name */}
                <div className={`flex items-center gap-2 mb-1 ${msg.from === 'creator' ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-white bg-gray-100 shadow-sm shrink-0">
                    <img
                      src={
                        msg.from === 'creator'
                          ? "https://api.dicebear.com/7.x/adventurer/svg?seed=creator"
                          : "https://api.dicebear.com/7.x/initials/svg?seed=Brand"
                      }
                      alt={msg.from}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 capitalize">
                    {msg.from === 'creator' ? 'Creator' : 'Brand Client'}
                  </span>
                </div>

                {/* Media Attachment Attachment */}
                {msg.media && (
                  <div className="bg-white border border-gray-100 rounded-xl p-2 mb-1.5 shadow-sm">
                    <div className="flex items-center justify-between gap-2 px-1 mb-1">
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-bold text-[#1A1A1A] truncate">{msg.media.name}</div>
                        <div className="text-[8px] text-gray-400">{formatDate(msg.media.createdAt)}</div>
                      </div>
                      <button
                        onClick={() => onPreviewMedia && onPreviewMedia(msg.media)}
                        className="p-1 hover:bg-gray-50 rounded-lg text-gray-400 hover:text-Primary cursor-pointer transition-colors"
                        title="View attachment"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      onClick={() => onPreviewMedia && onPreviewMedia(msg.media)}
                      className="aspect-square w-24 rounded-lg overflow-hidden bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      {msg.media.type === 'video' ? (
                        <video src={getImgUrl(msg.media.url)} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={getImgUrl(msg.media.url)} alt="" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                )}

                {/* Bubble Text */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.from === 'creator'
                    ? 'bg-white border border-gray-100 text-[#1A1A1A] rounded-tl-none'
                    : 'bg-Primary text-white rounded-tr-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* Attached file for resolution */}
                  {msg.fileUrl && (
                    <div className={`mt-2 pt-2 border-t text-xs ${
                      msg.from === 'creator' ? 'border-gray-100' : 'border-white/20'
                    }`}>
                      <a
                        href={getImgUrl(msg.fileUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-1.5 font-bold hover:underline ${
                          msg.from === 'creator' ? 'text-Primary' : 'text-white'
                        }`}
                      >
                        <Paperclip className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">Download Resolution Attachment</span>
                      </a>
                    </div>
                  )}
                </div>

                <span className={`text-[8px] text-gray-400 mt-1 ${msg.from === 'creator' ? 'text-left' : 'text-right'}`}>
                  {formatDate(msg.createdAt)}
                </span>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="text-center py-20 text-gray-400 text-xs">
              No feedback messages yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter your message..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all text-[#1A1A1A]"
          />
          <button onClick={onSend} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all cursor-pointer shrink-0">Send</button>
        </div>
      </div>
    </div>
  );
};

export default BrandComments;
