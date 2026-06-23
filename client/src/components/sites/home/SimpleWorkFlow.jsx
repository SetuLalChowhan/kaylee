import React from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import WorkflowCard from './cards/WorkflowCard';

// Asset Imports
import CampingImage from "@/assets/images/camping.png";
import UploadImage from "@/assets/images/upload.png";
import ApprovedImage from "@/assets/images/approved.png";

const workflowData = [
    {
        title: "Create Your Campaign",
        description: "Set up your campaign, add details, and prepare your content for delivery",
        image: CampingImage,
    },
    {
        title: "Upload & Share Content",
        description: "Upload your media and share a secure link with brands for review and feedback",
        image: UploadImage,
    },
    {
        title: "Get Approved & Deliver",
        description: "Receive approval and release your files when you're ready — staying in full control",
        image: ApprovedImage,
    },
];

const SimpleWorkFlow = ({ cms }) => {
    const getFullImageUrl = (url, fallback) => {
        if (!url) return fallback;
        if (url.startsWith("http") || url.startsWith("data:") || url.startsWith("/src/") || url.startsWith("/assets/")) return url;
        return `${import.meta.env.VITE_IMG_URL || "http://localhost:3000/"}${url}`;
    };

    const steps = [
        {
            title: cms?.workflow_step1_title || "Create Your Campaign",
            description: cms?.workflow_step1_desc || "Set up your campaign, add details, and prepare your content for delivery",
            image: getFullImageUrl(cms?.workflow_step1_image, CampingImage),
        },
        {
            title: cms?.workflow_step2_title || "Upload & Share Content",
            description: cms?.workflow_step2_desc || "Upload your media and share a secure link with brands for review and feedback",
            image: getFullImageUrl(cms?.workflow_step2_image, UploadImage),
        },
        {
            title: cms?.workflow_step3_title || "Get Approved & Deliver",
            description: cms?.workflow_step3_desc || "Receive approval and release your files when you're ready — staying in full control",
            image: getFullImageUrl(cms?.workflow_step3_image, ApprovedImage),
        },
    ];

    return (
        <section
            id="how-it-works"
            className="section-padding overflow-hidden lg:py-[120px] py-8"
            style={{ background: 'rgba(0, 91, 214, 0.02)' }}
        >
            <div className="">
                {/* Header Content */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 lg:mb-24">
                    <Label>How it Works</Label>
                    <SectionHeader className="mb-6">
                        {cms?.workflow_title || "Simple workflow from start to finish"}
                    </SectionHeader>
                    <Subtext className="max-w-2xl mx-auto">
                        {cms?.workflow_subtext || "Manage your campaigns, collaborate with brands, and deliver content in just a few steps"}
                    </Subtext>
                </div>

                {/* Workflow Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {steps.map((item, index) => (
                        <WorkflowCard
                            key={index}
                            index={index}
                            {...item}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default SimpleWorkFlow;