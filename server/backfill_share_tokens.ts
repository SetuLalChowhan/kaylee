import prisma from './src/config/db.js';
import { generateSecureToken } from './src/utils/otp.util.js';

async function main() {
  const campaigns = await prisma.ugcCampaign.findMany({
    where: { shareToken: null }
  });

  console.log(`Found ${campaigns.length} campaigns missing shareTokens.`);

  for (const campaign of campaigns) {
    const token = generateSecureToken(32);
    await prisma.ugcCampaign.update({
      where: { id: campaign.id },
      data: { shareToken: token }
    });
    console.log(`Updated campaign ${campaign.slug} with token ${token}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
