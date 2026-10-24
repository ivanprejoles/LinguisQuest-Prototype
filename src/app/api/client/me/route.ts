
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { getOrCreateUser } from "@/lib/user"

export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const user = await getOrCreateUser()

    if (!user || user.clerkId !== userId) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      imageUrl: user.imageUrl,
      xp: user.xp,
      hearts: user.hearts,
      maxHearts: user.maxHearts,
      lastHeartRefillAt: user.lastHeartRefillAt,
    })
  } catch (error) {
    console.error("Failed to fetch current user:", error)

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
