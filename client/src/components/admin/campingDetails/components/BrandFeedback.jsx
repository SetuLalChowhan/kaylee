import React, { useState } from 'react';
import { MessageCircle, Eye } from 'lucide-react';

const BrandFeedback = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Can you improve the lighting in the video?', from: 'brand', media: null }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg = { id: Date.now(), text: newMessage, from: 'creator', media: null };
    setMessages(prev => [...prev, msg]);
    console.log('Brand Feedback Message Sent:', msg);
    setNewMessage('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-Primary/5 rounded-xl flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-Primary" />
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A]">Brand Feedback</h3>
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-xs text-gray-400 mb-1.5">Campaign Status</p>
        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full">Pending</span>
      </div>

      {/* Messages */}
      <div className="space-y-3 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.from === 'creator' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm ${
              msg.from === 'creator' 
                ? 'bg-Primary text-white rounded-br-none' 
                : 'bg-gray-50 text-[#1A1A1A] border border-gray-100 rounded-bl-none'
            }`}>
              <p>{msg.text}</p>
              {msg.media && (
                <button className="mt-2 flex items-center gap-1 text-xs opacity-80 hover:opacity-100 transition-opacity">
                  <Eye className="w-3.5 h-3.5" />
                  <span>View attached media</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Enter your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-white border border-gray-100 rounded-xl py-3 px-4 text-sm focus:border-Primary focus:outline-none transition-all"
        />
        <button
          onClick={handleSend}
          className="bg-Primary text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-Primary/90 transition-all"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default BrandFeedback;
