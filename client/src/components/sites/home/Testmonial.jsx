import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import TestimonialCard from './cards/TestimonialCard';

// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const testimonials = [
    {
        quote: "What I like most about STAKD is how simple and clean the whole process feels. I can manage multiple campaigns, track feedback, and deliver final files without jumping between tools. It saves me time and helps me stay organized, especially when working with multiple brands.",
        author: "James R.",
        role: "Influencer",
        avatar: "https://i.pravatar.cc/150?u=james",
    },
    {
        quote: "Before using STAKD, I was constantly sending files back and forth through email, and it was hard to keep track of feedback. Now everything is in one place — I can upload content, share it instantly, and get approvals without confusion. It's made my workflow so much smoother and more professional.",
        author: "Sarah K.",
        role: "UGC Creator",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        quote: "STAKD gives me full control over my content. I can decide when brands can access and download files, which is something I've always wanted. The approval process is also super clear, and I don't have to deal with messy communication anymore.",
        author: "Emily T.",
        role: "Content Creator",
        avatar: "https://i.pravatar.cc/150?u=emily",
    },
    {
        quote: "Manage your entire brand workflow from one place. I can't imagine going back to emails after using this. It's truly a game changer for my productivity.",
        author: "Alex M.",
        role: "Digital Nomad",
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
    {
        quote: "What I like most about STAKD is how simple and clean the whole process feels. I can manage multiple campaigns, track feedback, and deliver final files without jumping between tools. It saves me time and helps me stay organized, especially when working with multiple brands.",
        author: "James R.",
        role: "Influencer",
        avatar: "https://i.pravatar.cc/150?u=james",
    },
    {
        quote: "Before using STAKD, I was constantly sending files back and forth through email, and it was hard to keep track of feedback. Now everything is in one place — I can upload content, share it instantly, and get approvals without confusion. It's made my workflow so much smoother and more professional.",
        author: "Sarah K.",
        role: "UGC Creator",
        avatar: "https://i.pravatar.cc/150?u=sarah",
    },
    {
        quote: "STAKD gives me full control over my content. I can decide when brands can access and download files, which is something I've always wanted. The approval process is also super clear, and I don't have to deal with messy communication anymore.",
        author: "Emily T.",
        role: "Content Creator",
        avatar: "https://i.pravatar.cc/150?u=emily",
    },
    {
        quote: "Manage your entire brand workflow from one place. I can't imagine going back to emails after using this. It's truly a game changer for my productivity.",
        author: "Alex M.",
        role: "Digital Nomad",
        avatar: "https://i.pravatar.cc/150?u=alex",
    },
];

const Testmonial = ({ cms }) => {
    const [prevEl, setPrevEl] = useState(null);
    const [nextEl, setNextEl] = useState(null);
    const [progress, setProgress] = useState(0);

    let displayTestimonials = testimonials;
    if (cms?.testimonials) {
        try {
            const parsed = JSON.parse(cms.testimonials);
            if (Array.isArray(parsed) && parsed.length > 0) {
                displayTestimonials = parsed.map((item) => ({
                    quote: item.text || item.quote || "",
                    author: item.name || item.author || "",
                    role: item.role || "",
                    avatar: item.avatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(item.name || "avatar")}`
                }));
            }
        } catch (e) {
            console.error("Failed to parse testimonials CMS config", e);
        }
    }

    return (
        <section id="customers" className="section-padding bg-white overflow-hidden">
            <div className="">
                {/* Header Content */}
                <div className="flex flex-col items-center text-center  mb-16 lg:mb-24">
                    <Label>Testimonial</Label>
                    <SectionHeader className="mb-6">
                        Loved by creators worldwide
                    </SectionHeader>
                    <Subtext className="max-w-2xl mx-auto">
                        See how creators are using STAKD to manage campaigns and work with brands
                    </Subtext>
                </div>

                {/* Swiper Slider */}
                <div className="relative mb-16 lg:mb-20 px-4 md:px-0">
                    <Swiper
                        modules={[Navigation, Pagination]}
                        spaceBetween={24}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 1.5 },
                            1024: { slidesPerView: 3 },
                        }}
                        onSlideChange={(swiper) => {
                            const current = swiper.activeIndex;
                            const total = swiper.slides.length - swiper.params.slidesPerView + 1;
                            setProgress((current / (total - 1)) * 100);
                        }}
                        navigation={{
                            prevEl,
                            nextEl,
                        }}
                        className="testimonial-swiper"
                    >
                        {displayTestimonials.map((testimonial, index) => (
                            <SwiperSlide key={index} className="flex !h-auto">
                                <TestimonialCard {...testimonial} />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Custom Navigation & Progress Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mt-12 px-4 md:px-0">
                    {/* Progress Bar */}
                    <div className="w-full max-w-[400px] h-2 bg-[#E6F0FF] rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-Primary"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>

                    {/* Nav Buttons */}
                    <div className="flex items-center gap-4">
                        <button
                            ref={(node) => setPrevEl(node)}
                            className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-Primary hover:text-Primary transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            ref={(node) => setNextEl(node)}
                            className="w-12 h-12 rounded-full bg-Primary flex items-center justify-center text-white hover:bg-Primary/90 shadow-lg shadow-Primary/20 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Testmonial;