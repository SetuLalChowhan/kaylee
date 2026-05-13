import React from 'react';
import { Star } from 'lucide-react';

const TestimonialCard = ({ quote, author, role, avatar }) => {
  return (
    <div className="bg-white rounded-[32px] p-6 lg:p-10 border border-[#F2F2F2] flex flex-col h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* 5-Star Rating */}
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-[#FFB800] text-[#FFB800]" />
        ))}
      </div>
      
      {/* Testimonial Text */}
      <p className="text-[#1A1A1A] text-base lg:text-[18px] leading-relaxed mb-10 flex-1 italic">
        "{quote}"
      </p>
      
      {/* Author Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          <img 
            src={avatar} 
            alt={author} 
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = "https://ui-avatars.com/api/?name=" + author }}
          />
        </div>
        <div>
          <h4 className="text-[#1A1A1A] font-bold text-base">{author}</h4>
          <p className="text-gray-500 text-sm">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
