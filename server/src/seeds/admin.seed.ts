import prisma from "../config/db.js";
import { hashPassword } from "../utils/auth.util.js";

export async function seedAdmin() {
  const adminEmail = "admin@kaylee.com";
  const existing = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existing) {
    const hashedPassword = await hashPassword("admin123");
    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        displayName: "System Admin",
        slug: "system-admin"
      }
    });
    console.log("Default admin seeded: admin@kaylee.com / admin123");
  }
}
