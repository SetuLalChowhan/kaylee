import prisma from "../config/db.js";
import { hashPassword } from "../utils/auth.util.js";

export async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn(
      "ADMIN_EMAIL or ADMIN_PASSWORD not set in environment. Skipping default admin seed."
    );
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existing) {
    const hashedPassword = await hashPassword(adminPassword);
    await prisma.user.create({
      data: {
        firstName: "System",
        lastName: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isVerified: true,
        displayName: "System Admin",
        slug: "system-admin",
      },
    });
    console.log(`Admin user created for: ${adminEmail}`);
  }
}
