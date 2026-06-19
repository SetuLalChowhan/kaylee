import prisma from "../config/db.js";

export async function seedCampaigns() {
  try {
    const count = await prisma.campaign.count();
    if (count === 0) {
      await prisma.campaign.createMany({
        data: [
          { title: "Nike UGC Shoot", description: "Default Nike UGC Campaign" },
          { title: "Summer Skincare Promo", description: "Default Summer Skincare Campaign" },
          { title: "Adidas Activewear Launch", description: "Default Adidas Campaign" },
        ],
      });
      console.log("Database successfully seeded with default campaigns.");
    }
  } catch (err) {
    console.error("Error seeding campaigns:", err);
  }
}
