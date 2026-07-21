import React from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import FeatureCard from './cards/FeatureCard';

// Asset Imports
import CampingManagement from "@/assets/images/campingManagement.png";
import TaskTraking from "@/assets/images/taskTraking.png";
import InvoiceTraking from "@/assets/images/InvoiceImage.png";
import UploadImage from "@/assets/images/upload.png";

const ManageAndDeliver = ({ cms }) => {
    const dynamicFeatures = [
        {
            title: cms?.feature1_title || "Campaign Management",
            description: cms?.feature1_desc || "Create campaigns, manage details, and track progress from draft to final delivery",
            image: cms?.feature1_image || CampingManagement,
            className: "col-span-12 lg:col-span-5",
        },
        {
            title: cms?.feature2_title || "Planner & Task Tracking",
            description: cms?.feature2_desc || "Organize your tasks, set priorities, and stay on top of deadlines",
            image: cms?.feature2_image || TaskTraking,
            className: "col-span-12 lg:col-span-7",
        },
        {
            title: cms?.feature3_title || "Invoice & Payments",
            description: cms?.feature3_desc || "Organize your tasks, set priorities, and stay on top of deadlines",
            image: cms?.feature3_image || InvoiceTraking,
            className: "col-span-12 lg:col-span-7",
        },
        {
            title: cms?.feature4_title || "Media Upload & Delivery",
            description: cms?.feature4_desc || "Upload photos and videos, share with brands, and control when files are released",
            image: cms?.feature4_image || UploadImage,
            className: "col-span-12 lg:col-span-5",
        },
    ];

    const getFullImageUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/src/") || url.startsWith("/assets/")) return url;
        return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
    };

    return (
        <section id="features" className="section-padding bg-white overflow-hidden">
            <div className="">
                {/* Header Content */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-8 md:mb-12 lg:mb-16">
                    <Label>Features</Label>
                    <SectionHeader className="mb-6">
                        {cms?.features_title || (
                            <>
                                Everything you need to manage and <br className="hidden md:block" /> deliver campaigns
                            </>
                        )}
                    </SectionHeader>
                    <Subtext className="max-w-3xl">
                        {cms?.features_subtext || "From creation to delivery - manage your entire workflow in one simple platform"}
                    </Subtext>
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-12 gap-6 lg:gap-8">
                    {dynamicFeatures.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            index={index}
                            title={feature.title}
                            description={feature.description}
                            className={feature.className}
                            image={getFullImageUrl(feature.image, feature.image)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ManageAndDeliver;