import React from 'react';
import { motion } from 'motion/react';
import CommonButton from '@/components/ui/CommonButton';
import ImageDash from "@/assets/images/dashImage.png";

const ReadyWorkFlow = ({ cms }) => {
  return (
    <section className="section-padding lg:pb-[120px] pb-10">
      <div className="bg-Primary rounded-[32px] lg:rounded-[48px] overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center">

          {/* Left Content */}
          <div className="lg:col-span-6 p-6 sm:p-12 lg:p-20 relative z-10 text-white">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-[56px] font-bold leading-tight mb-6"
            >
              {cms?.ready_title || "Ready to simplify your workflow?"}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-base lg:text-[18px] opacity-90 mb-6 sm:mb-10 max-w-lg leading-relaxed"
            >
              {cms?.ready_subtext || "Start managing your campaigns, collaborating with brands, and delivering content seamlessly — all in one simple platform built for creators"}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <CommonButton
                type="link"
                path="/signup"
                className="bg-white text-Primary font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-all shadow-xl shadow-black/10"
              >
                {cms?.ready_cta || "Start for Free"}
              </CommonButton>
            </motion.div>
          </div>

          {/* Right Image */}
          <div className="lg:col-span-6 relative h-full min-h-[300px] lg:min-h-[550px] overflow-hidden">
            <motion.div
              initial={{ opacity: 0, x: 50, y: 20 }}
              whileInView={{ opacity: 1, x: 0, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="absolute top-10 lg:top-16 left-0 lg:left-10 w-[120%] sm:w-[110%] lg:w-[130%]"
            >
              <img src={cms?.ready_image ? (cms.ready_image.startsWith("http") || cms.ready_image.startsWith("data:") ? cms.ready_image : `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${cms.ready_image}`) : ImageDash}
                alt="Dashboard Preview"
                className="w-full h-auto rounded-2xl shadow-2xl object-cover"
              loading="lazy" />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ReadyWorkFlow;