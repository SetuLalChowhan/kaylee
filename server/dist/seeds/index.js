import { seedCampaigns } from "./campaign.seed.js";
import { seedFaqs } from "./faq.seed.js";
import { seedAdmin } from "./admin.seed.js";
import { seedCms } from "./cms.seed.js";
export async function runSeeds() {
    try {
        await seedCampaigns();
        await seedFaqs();
        await seedAdmin();
        await seedCms();
    }
    catch (err) {
        console.error("Error executing database seeders:", err);
    }
}
//# sourceMappingURL=index.js.map