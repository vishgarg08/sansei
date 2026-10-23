import { prisma } from "../prisma/prisma";
import { hashPassword } from "../utils/auth";
import { Role } from "@prisma/client";

async function createAdmin() {
  const email = "admin@gmail.com";
  const password = "admin123";

  try {
    // Delete the incorrectly cased one if it exists from previous runs
    await prisma.auth.deleteMany({
      where: { email: "admin@gmail.com" },
    });

    const existingAdmin = await prisma.auth.findUnique({
      where: { email },
    });

    if (existingAdmin) {
      console.log(`Admin with email ${email} already exists.`);
      return;
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.auth.create({
      data: {
        name: "Super Admin",
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        isEmailVerified: true,
      },
    });

    console.log(`✅ Successfully created admin: ${admin.email}`);
  } catch (error) {
    console.error("❌ Error creating admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
