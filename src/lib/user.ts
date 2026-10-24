// lib/user.ts
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function getOrCreateUser() {
  const clerkUser = await currentUser();

  if (!clerkUser) return null;

  const clerkId = clerkUser.id;
  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Learner";
  const imageUrl = clerkUser.imageUrl || "";

  // 1. Check if user already exists in MongoDB using unique clerkId
  let dbUser = await prisma.user.findUnique({
    where: { clerkId },
  });

  // 2. If it's their very first time logging in, create them instantly!
  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        clerkId,
        email,
        name,
        imageUrl,
        hearts: 5,
        maxHearts: 5,
        xp: 0,
      },
    });
  }

  return dbUser;
}