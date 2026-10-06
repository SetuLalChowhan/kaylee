import type { Request } from "express";
import prisma from "../../config/db.js";
import { safeUnlink } from "../../utils/upload.util.js";

export interface AuthRequest extends Request {
  user: { userId: string; role: string };
}

export const BRAND_LOGO_REGEX = /^uploads\/brand-logos\/[A-Za-z0-9._-]+$/;

/**
 * Helper to generate a unique lowercase URL slug from a display name
 */
export async function generateUniqueSlug(displayName: string, userId: string): Promise<string> {
  const baseSlug = displayName
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "");

  let finalSlug = baseSlug || "user";
  let isUnique = false;
  let count = 0;

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true } });
  if (user && user.slug === finalSlug) {
    return finalSlug;
  }

  while (!isUnique) {
    const candidateSlug = count === 0 ? finalSlug : `${finalSlug}-${count}`;
    const existingUser = await prisma.user.findFirst({
      where: {
        slug: candidateSlug,
        id: { not: userId },
      },
    });
    if (!existingUser) {
      finalSlug = candidateSlug;
      isUnique = true;
    } else {
      count++;
    }
  }
  return finalSlug;
}

/**
 * Helper function to safely clean up all physical files associated with a user
 */
export async function cleanUserPhysicalFiles(userId: string) {
  const fileUrls: (string | null | undefined)[] = [];

  try {
    // 1. Fetch user avatar & brandLogos
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true, brandLogos: true },
    });
    if (user) {
      if (user.avatar) fileUrls.push(user.avatar);
      if (user.brandLogos && Array.isArray(user.brandLogos)) {
        fileUrls.push(...(user.brandLogos as any[]));
      }
    }

    // 2. Fetch portfolio items
    const portfolioItems = await prisma.portfolioItem.findMany({
      where: { userId },
      select: { url: true },
    });
    fileUrls.push(...portfolioItems.map((item) => item.url));

    // 3. Fetch campaign media & documents
    const campaigns = await prisma.ugcCampaign.findMany({
      where: { userId },
      select: {
        media: { select: { url: true } },
        documents: { select: { url: true } },
      },
    });

    for (const c of campaigns) {
      fileUrls.push(...c.media.map((m) => m.url));
      fileUrls.push(...c.documents.map((d) => d.url));
    }

    // Physically delete files securely
    for (const url of fileUrls) {
      if (!url) continue;
      safeUnlink(url);
    }
  } catch (err) {
    console.error("Error cleaning up physical user files: ", err);
  }
}
