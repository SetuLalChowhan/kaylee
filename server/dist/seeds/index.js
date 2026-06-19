import { seedCampaigns } from "./campaign.seed.js";
import { seedFaqs } from "./faq.seed.js";
export async function runSeeds() {
    try {
        await seedCampaigns();
        await seedFaqs();
    }
    catch (err) {
        console.error("Error executing database seeders:", err);
    }
}
//# sourceMappingURL=index.js.map