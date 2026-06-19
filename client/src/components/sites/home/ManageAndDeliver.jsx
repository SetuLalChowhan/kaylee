import React from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import FeatureCard from './cards/FeatureCard';

// Asset Imports
import CampingManagement from "@/assets/images/campingManagement.png";
import TaskTraking from "@/assets/images/taskTraking.png";
import InvoiceTraking from "@/assets/images/InvoiceImage.png";
import UploadImage from "@/assets/images/upload.png";

const features = [
    {
        title: "Campaign Management",
        description: "Create campaigns, manage details, and track progress from draft to final delivery",
        image: CampingManagement,
        className: "lg:col-span-5",
    },
    {
        title: "Planner & Task Tracking",
        description: "Organize your tasks, set priorities, and stay on top of deadlines",
        image: TaskTraking,
        className: "lg:col-span-7",
    },
    {
        title: "Invoice & Payments",
        description: "Organize your tasks, set priorities, and stay on top of deadlines",
        image: InvoiceTraking,
        className: "lg:col-span-7",
    },
    {
        title: "Media Upload & Delivery",
        description: "Upload photos and videos, share with brands, and control when files are released",
        image: UploadImage,
        className: "lg:col-span-5",
    },
];

const ManageAndDeliver = ({ cms }) => {
    return (
        <section id="features" className="section-padding bg-white overflow-hidden">
            <div className="">
                {/* Header Content */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 lg:mb-24">
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
                    {features.map((feature, index) => (
                        <FeatureCard
                            key={index}
                            index={index}
                            {...feature}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ManageAndDeliver;