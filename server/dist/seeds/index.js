import { seedCampaigns } from "./campaign.seed.js";
import { seedFaqs } from "./faq.seed.js";
import { seedAdmin } from "./admin.seed.js";
import { seedCms } from "./cms.seed.js";
import { seedPlans } from "./plan.seed.js";
export async function runSeeds() {
    try {
        await seedCampaigns();
        await seedFaqs();
        await seedAdmin();
        await seedCms();
        // Default plan seeder disabled as requested by user
    }
    catch (err) {
        console.error("Error executing database seeders:", err);
    }
}
//# sourceMappingURL=index.js.map