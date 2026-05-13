import React from 'react';
import { motion } from 'motion/react';

export const BannerTitle = ({ children, className = "", ...props }) => {
  return (
    <motion.h1
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.1 }}
      className={`text-[36px] md:text-[54px] lg:text-[64px] font-bold text-[#1A1A1A] leading-[1.1] tracking-tight ${className}`}
      {...props}
    >
      {children}
    </motion.h1>
  );
};

export const SectionHeader = ({ children, className = "", ...props }) => {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`text-[28px] md:text-[32px] lg:text-[40px] font-bold text-[#1A1A1A] leading-tight ${className}`}
      {...props}
    >
      {children}
    </motion.h2>
  );
};

export const Subtext = ({ children, className = "", ...props }) => {
  return (
    <motion.p
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className={`text-base md:text-lg lg:text-[24px] text-[#4F4F4F] leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </motion.p>
  );
};

export const Label = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`inline-block px-4 py-1.5 rounded-full border border-gray-200 bg-white text-[14px] lg:text-[18px] font-medium text-[#1A1A1A] mb-6 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = "", ...props }) => {
  return (
    <h3
      className={`text-[24px] lg:text-[32px] font-bold text-[#1A1A1A] leading-tight mb-4 ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
};

export const CardPara = ({ children, className = "", ...props }) => {
  return (
    <p
      className={`text-base lg:text-[20px] text-[#4F4F4F] leading-relaxed ${className}`}
      {...props}
    >
      {children}
    </p>
  );
};
