import prisma from "../config/db.js";

const defaultFaqs = [
  {
    category: "GETTING STARTED",
    question: "What is STAKD?",
    answer: "STAKD is a workspace where you manage your brand deals in one place. You can organize campaigns, upload content, share review links with brands, and track approvals without switching between tools."
  },
  {
    category: "GETTING STARTED",
    question: "How do I get started?",
    answer: "Sign up for an account, complete your onboarding profile, and you can start creating your first campaign immediately."
  },
  {
    category: "GETTING STARTED",
    question: "Do brands need an account to view my work?",
    answer: "No, brands can view your shared review links without needing to create an account, making the approval process seamless."
  },
  {
    category: "CAMPAIGNS & WORKFLOW",
    question: "What is a campaign?",
    answer: "A campaign is a workspace for a single brand deal. It includes your deliverables, files, deadlines, and approvals all in one place."
  },
  {
    category: "CAMPAIGNS & WORKFLOW",
    question: "Can I manage multiple campaigns at once?",
    answer: "Yes, STAKD is designed to handle multiple active campaigns simultaneously with a centralized dashboard."
  },
  {
    category: "CAMPAIGNS & WORKFLOW",
    question: "Can I edit a campaign after creating it?",
    answer: "Absolutely. You can update deliverables, change dates, and add new media at any stage of the process."
  },
  {
    category: "CAMPAIGNS & WORKFLOW",
    question: "Does STAKD create deals with brands?",
    answer: "STAKD is a management tool for your existing deals. We provide the infrastructure to professionalize your workflow once a deal is secured."
  },
  {
    category: "BRAND REVIEW",
    question: "What can brands do on the review page?",
    answer: "Brands can view content, leave comments, request changes, and approve deliverables directly through the shared link."
  },
  {
    category: "BRAND REVIEW",
    question: "Can brands download my content before approval?",
    answer: "You have control over download permissions. By default, content is view-only until you enable high-res downloads."
  },
  {
    category: "BRAND REVIEW",
    question: "What happens after approval?",
    answer: "Once a brand approves a deliverable, it is marked as completed, and you can proceed with the final delivery or invoicing."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "Do I need a subscription to use STAKD?",
    answer: "Yes. You can start with the free plan, which includes limited access to core features so you can try the platform."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "What's included in the free plan?",
    answer: "The free plan typically includes management for a limited number of active campaigns and basic storage."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "When do I need to upgrade?",
    answer: "You should upgrade when you need unlimited campaigns, more storage, or advanced features like custom branding."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "What happens if I don't upgrade?",
    answer: "Your account will remain on the free tier, and you may hit limits on active campaigns or storage capacity."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "Can I upgrade anytime?",
    answer: "Yes, you can upgrade or change your plan at any time through the billing settings."
  },
  {
    category: "BILLING & SUBSCRIPTION",
    question: "Do I lose my data if I upgrade later?",
    answer: "No, all your data and existing campaigns are preserved when you switch between plans."
  }
];

export async function seedFaqs() {
  try {
    const count = await prisma.faq.count();
    if (count === 0) {
      await prisma.faq.createMany({
        data: defaultFaqs,
      });
      console.log("Database successfully seeded with default FAQs.");
    }
  } catch (err) {
    console.error("Error seeding FAQs:", err);
  }
}
