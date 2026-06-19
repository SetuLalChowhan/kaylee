import prisma from "../config/db.js";

export async function seedCms() {
  const defaultCms = [
    { key: "banner_title", value: "Manage your campaigns. Deliver with confidence." },
    { key: "banner_subtext", value: "Upload, share, and get approvals from brands - all in one simple workflow built for creators." },
    { key: "banner_cta", value: "Get Started Free" },
    { key: "features_title", value: "Built for UGC & Content Creators" },
    { key: "features_subtext", value: "Focus on creating content while STAKD manages your client approvals, deliverables, and payments." },
    {
      key: "testimonials",
      value: JSON.stringify([
        { name: "Sarah Jenkins", role: "UGC Fashion Creator", text: "STAKD has saved me hours of back-and-forth emails. Brands love the clean preview link!" },
        { name: "Marcus Chen", role: "Tech Reviewer", text: "Having my campaign details, tasks, and invoice in one single place is a game changer for my workflow." }
      ])
    }
  ];

  for (const item of defaultCms) {
    const existing = await prisma.cmsContent.findUnique({
      where: { key: item.key }
    });
    if (!existing) {
      await prisma.cmsContent.create({
        data: item
      });
    }
  }
  console.log("CMS Content seeded successfully.");
}
