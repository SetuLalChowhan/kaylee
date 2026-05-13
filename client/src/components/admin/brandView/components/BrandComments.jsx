import React from 'react';
import { MessageCircle } from 'lucide-react';

const BrandComments = ({ comments, newComment, setNewComment, onSend }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border border-gray-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-Primary" />
          </div>
          <h3 className="text-sm font-bold text-[#1A1A1A]">Send your feedback</h3>
        </div>

        {/* Chat area */}
        <div className="bg-gray-50 rounded-2xl p-5 mb-4 min-h-[300px] max-h-[500px] overflow-y-auto custom-scrollbar space-y-4">
          {comments.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === 'creator' ? 'justify-start' : 'justify-end'}`}>
              <div className="max-w-[75%]">
                {msg.from === 'creator' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200">
                      <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop" alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {msg.media && (
                  <div className="bg-white border border-gray-100 rounded-xl p-2 mb-2 max-w-[200px]">
                    <div className="text-[10px] font-bold text-[#1A1A1A] px-1">{msg.media.title}</div>
                    <div className="text-[9px] text-gray-400 px-1 mb-1">{msg.media.date}</div>
                    <div className="aspect-square rounded-lg overflow-hidden">
                      <img src={msg.media.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                <div className={`inline-block px-4 py-2.5 rounded-xl text-sm ${
                  msg.from === 'creator'
                    ? 'bg-white border border-gray-100 text-[#1A1A1A]'
                    : 'bg-gray-100 text-[#1A1A1A]'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Enter your message"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSend()}
            className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
          />
          <button onClick={onSend} className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all">Send</button>
        </div>
      </div>
    </div>
  );
};

export default BrandComments;
