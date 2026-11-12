import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Verify authentication
    const { userId, sessionClaims } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify admin role
    const claims = sessionClaims as
      | { metadata?: { role?: string } }
      | null;

    if (claims?.metadata?.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [
      totalUsers,
      newUsers,
      totalXp,
      foundationRecords,
      storyProgress,
      users,
    ] = await Promise.all([
      // Total registered users
      prisma.user.count({
        where: { role: "user" },
      }),

      // New users in the last 7 days
      prisma.user.count({
        where: {
          role: "user",
          createdAt: { gte: sevenDaysAgo },
        },
      }),

      // Total XP
      prisma.user.aggregate({
        where: { role: "user" },
        _sum: { xp: true },
      }),

      // Total foundation stage records
      prisma.userStageScore.count({
        where: {
          user: {
            is: { role: "user" },
          },
        },
      }),

      // Fetch story wins for every user
      prisma.userStoryProgress.findMany({
        where: {
          user: {
            is: { role: "user" },
          },
        },
        select: {
          userId: true,
          winCount: true,
        },
      }),

      // Fetch users
      prisma.user.findMany({
        where: { role: "user" },
        select: {
          id: true,
          name: true,
          imageUrl: true,
          xp: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
    ]);

    // Calculate total story wins
    const totalStoryWins = storyProgress.reduce(
      (total, progress) => total + progress.winCount,
      0
    );

    // Calculate story wins per user
    const storyWinsByUser = new Map<string, number>();

    for (const progress of storyProgress) {
      const currentWins =
        storyWinsByUser.get(progress.userId) ?? 0;

      storyWinsByUser.set(
        progress.userId,
        currentWins + progress.winCount
      );
    }

    // Format users for the frontend
    const formattedUsers = users.map((user) => ({
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,

      // Foundation EXP
      foundationExp: user.xp,

      // Total story wins across all sessions
      storyWinCount: storyWinsByUser.get(user.id) ?? 0,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        newUsers,
        totalXp: totalXp._sum.xp ?? 0,
        foundationRecords,
        storyWins: totalStoryWins,
      },
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Admin users API error:", error);

    return NextResponse.json(
      { error: "Unable to load users" },
      { status: 500 }
    );
  }
}