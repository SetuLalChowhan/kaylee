import React from 'react';
import { motion } from 'motion/react';
import { CardTitle, CardPara } from '@/components/ui/Typography';

const WorkflowCard = ({ image, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="flex flex-col bg-white rounded-[32px] border border-[#E6E6E6] shadow-sm hover:shadow-xl transition-all duration-500 group h-full overflow-hidden"
    >
      <div className="p-4 lg:p-5 pb-0 flex-1">
        <div className="relative overflow-hidden rounded-2xl h-full">
          <img src={image} 
            alt={title} 
            className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
            width="400"
            height="250"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
      
      <div className="p-5 lg:p-10 pt-4 lg:pt-6">
        <CardTitle>{title}</CardTitle>
        <CardPara>{description}</CardPara>
      </div>
    </motion.div>
  );
};

export default WorkflowCard;
