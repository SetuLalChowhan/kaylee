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

const SimpleWorkFlow = () => {
    return (
        <section
            id="how-it-works"
            className="section-padding overflow-hidden lg:py-[120px] py-10"
            style={{ background: 'rgba(0, 91, 214, 0.02)' }}
        >
            <div className="">
                {/* Header Content */}
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 lg:mb-24">
                    <Label>How it Works</Label>
                    <SectionHeader className="mb-6">
                        Simple workflow from start to finish
                    </SectionHeader>
                    <Subtext className="max-w-2xl mx-auto">
                        Manage your campaigns, collaborate with brands, and deliver content in just a few steps
                    </Subtext>
                </div>

                {/* Workflow Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {workflowData.map((item, index) => (
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