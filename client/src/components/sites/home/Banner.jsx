import React from 'react';
import { motion } from 'motion/react';
import UsersImage from "@/assets/images/users.png";
import DashLayout from "@/assets/images/dashLayout.png";
import CommonButton from '@/components/ui/CommonButton';
import { BannerTitle, Subtext } from '@/components/ui/Typography';

const Banner = ({ cms }) => {
    return (
        <section
            className="relative w-full overflow-hidden bg-white   pt-20 md:pt-[130px] "
            style={{
                background: 'linear-gradient(180deg, rgba(51, 124, 222, 0.00) -3.32%, rgba(153, 189, 239, 0.50) 23.85%, #FFF 100%)'
            }}
        >
            {/* Background Gradient Blob (Optional extra layer if needed, but the section background should cover it) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0" />

            <div className="max-w-[1300px] mx-auto relative z-10">
                <div className="flex flex-col items-center text-center w-full">

                    {/* Creator Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex items-center gap-3 bg-white border border-gray-100 rounded-full py-2 px-4 shadow-sm mb-8 lg:mb-10"
                    >
                        <img src={UsersImage} alt="Creators" className="h-5 lg:h-6 w-auto" />
                        <span className="text-[#1A1A1A] font-semibold text-xs lg:text-base">
                            +5,000 <span className="font-medium text-gray-500">Creators using STAKD</span>
                        </span>
                    </motion.div>

                    {/* Heading - Using Common Component */}
                    <BannerTitle className="mb-6 lg:mb-8">
                        {cms?.banner_title || (
                            <>
                                Manage your campaigns. Deliver <br className="hidden md:block" />
                                with confidence.
                            </>
                        )}
                    </BannerTitle>

                    {/* Subheading - Using Common Component */}
                    <Subtext className="mb-10 lg:mb-12 max-w-2xl px-4">
                        {cms?.banner_subtext || "Upload, share, and get approvals from brands - all in one simple workflow built for creators"}
                    </Subtext>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <CommonButton
                            type="link"
                            path="/signup"
                            className="bg-Primary text-white text-sm lg:text-lg font-semibold px-8 lg:px-10 py-4 lg:py-5 rounded-xl lg:rounded-2xl hover:bg-Primary/90 shadow-xl shadow-Primary/20"
                        >
                            {cms?.banner_cta || "Get Started Free"}
                        </CommonButton>
                    </motion.div>

                    {/* Dashboard Preview with White Bottom Overlay */}
                    <motion.div
                        initial={{ opacity: 0, y: 80 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                        className="mt-16 lg:mt-24 w-full relative group"
                    >
                        <div className="relative rounded-xl lg:rounded-[32px] overflow-hidden  border-2 lg:border-8 border-white/40">
                            <img
                                src={DashLayout}
                                alt="STAKD Dashboard Preview"
                                className="w-full h-auto object-cover transition-transform duration-700"
                            />

                            {/* Bottom White Overlay to match image pixel-perfectly */}
                            <div className="absolute bottom-0 left-0 w-full h-[100px] sm:h-[150px] lg:h-[300px] bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Banner;
