import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import prisma from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedCms() {
  // 1. Copy default images to uploads/cms
  const destDir = path.join("uploads", "cms");

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const filesToCopy = [
    "heroImage.png",
    "f1.png",
    "f2.png",
    "f3.png",
    "f4.png",
    "w1.png",
    "w2.png",
    "w3.png",
    "ctaReady.png"
  ];

  const srcDir = path.join(__dirname, "../../../admin/src/assets/images");

  if (fs.existsSync(srcDir)) {
    for (const file of filesToCopy) {
      const srcFile = path.join(srcDir, file);
      const destFile = path.join(destDir, file);
      if (fs.existsSync(srcFile) && !fs.existsSync(destFile)) {
        try {
          fs.copyFileSync(srcFile, destFile);
        } catch (copyErr) {
          console.error(`Failed to copy seed file ${file}:`, copyErr);
        }
      }
    }
  }

  const defaultCms = [
    { key: "banner_title", value: "Manage your campaigns. Deliver with confidence." },
    { key: "banner_subtext", value: "Upload, share, and get approvals from brands - all in one simple workflow built for creators." },
    { key: "banner_cta", value: "Get Started Free" },
    { key: "banner_image", value: "uploads/cms/heroImage.png" },
    { key: "features_title", value: "Built for UGC & Content Creators" },
    { key: "features_subtext", value: "Focus on creating content while STAKD manages your client approvals, deliverables, and payments." },
    { key: "feature1_title", value: "Campaign Management" },
    { key: "feature1_desc", value: "Create campaigns, manage details, and track progress from draft to final delivery" },
    { key: "feature1_image", value: "uploads/cms/f1.png" },
    { key: "feature2_title", value: "Planner & Task Tracking" },
    { key: "feature2_desc", value: "Organize your tasks, set priorities, and stay on top of deadlines" },
    { key: "feature2_image", value: "uploads/cms/f2.png" },
    { key: "feature3_title", value: "Invoice & Payments" },
    { key: "feature3_desc", value: "Organize your tasks, set priorities, and stay on top of deadlines" },
    { key: "feature3_image", value: "uploads/cms/f3.png" },
    { key: "feature4_title", value: "Media Upload & Delivery" },
    { key: "feature4_desc", value: "Upload photos and videos, share with brands, and control when files are released" },
    { key: "feature4_image", value: "uploads/cms/f4.png" },
    { key: "workflow_title", value: "Simple workflow from start to finish" },
    { key: "workflow_subtext", value: "Manage your campaigns, collaborate with brands, and deliver content in just a few steps" },
    { key: "workflow_step1_title", value: "Create Your Campaign" },
    { key: "workflow_step1_desc", value: "Set up your campaign, add details, and prepare your content for delivery" },
    { key: "workflow_step1_image", value: "uploads/cms/w1.png" },
    { key: "workflow_step2_title", value: "Upload & Share Content" },
    { key: "workflow_step2_desc", value: "Upload your media and share a secure link with brands for review and feedback" },
    { key: "workflow_step2_image", value: "uploads/cms/w2.png" },
    { key: "workflow_step3_title", value: "Get Approved & Deliver" },
    { key: "workflow_step3_desc", value: "Receive approval and release your files when you're ready — staying in full control" },
    { key: "workflow_step3_image", value: "uploads/cms/w3.png" },
    { key: "ready_title", value: "Ready to simplify your workflow?" },
    { key: "ready_subtext", value: "Start managing your campaigns, collaborating with brands, and delivering content seamlessly — all in one simple platform built for creators" },
    { key: "ready_cta", value: "Start for Free" },
    { key: "ready_image", value: "uploads/cms/ctaReady.png" },
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
