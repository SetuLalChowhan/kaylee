import React from 'react';
import { motion } from 'motion/react';
import { CardTitle, CardPara } from '@/components/ui/Typography';

const FeatureCard = ({ image, title, description, className = "", index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`bg-white rounded-[32px] border border-[#E6E6E6] flex flex-col hover:shadow-xl transition-all duration-500 group overflow-hidden ${className}`}
    >
      <div className="p-4 lg:p-5 pb-0 flex-1">
        <div className="rounded-2xl overflow-hidden bg-[#F9FAFB] border border-gray-50 h-full">
          <img src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          loading="lazy" />
        </div>
      </div>

      <div className="p-5 lg:p-10 pt-4 lg:pt-6">
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardPara>{description}</CardPara>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
