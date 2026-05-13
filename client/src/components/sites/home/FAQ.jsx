import React, { useState } from 'react';
import { SectionHeader, Subtext, Label } from '@/components/ui/Typography';
import CommonButton from '@/components/ui/CommonButton';
import FAQItem from './cards/FAQItem';

const faqData = [
    {
        question: "What is STAKD?",
        answer: "STAKD is a platform that helps creators manage campaigns, collaborate with brands, and deliver content in one place"
    },
    {
        question: "How do I create a campaign?",
        answer: "You can create a campaign by clicking the 'New Campaign' button on your dashboard and following the setup wizard."
    },
    {
        question: "How do I share content with brands?",
        answer: "Once your content is uploaded, you can generate a secure shareable link or invite brands directly via email."
    },
    {
        question: "Can brands download my files immediately?",
        answer: "You have full control. You can set permissions to allow immediate downloads or require approval first."
    },
    {
        question: "Can I update my content after sharing?",
        answer: "Yes, you can update files at any time. The shareable link will always reflect the latest version of your work."
    }
];

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    return (
        <section id="faq" className="section-padding bg-white ">
            <div className="">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">

                    {/* Left Column - Header & CTA */}
                    <div className="flex flex-col items-start text-left">
                        <Label className="mb-6">FAQ's</Label>
                        <SectionHeader className="mb-6 max-w-md">
                            Frequently asked questions
                        </SectionHeader>
                        <Subtext className="mb-10 max-w-lg text-left">
                            Have questions? Explore detailed answers about features, workflows, and how to get the most out of STAKD
                        </Subtext>

                        <CommonButton
                            type="link"
                            path="/contact"
                            className="px-8 py-4 bg-Primary text-white font-bold rounded-xl hover:bg-Primary/90 transition-all shadow-lg shadow-Primary/20"
                        >
                            Contact Us
                        </CommonButton>
                    </div>

                    {/* Right Column - Accordion */}
                    <div className="flex flex-col border-t border-gray-100">
                        {faqData.map((faq, index) => (
                            <FAQItem
                                key={index}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openIndex === index}
                                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

export default FAQ;