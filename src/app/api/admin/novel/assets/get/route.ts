// src/app/api/assets/get/route.ts
// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';
// import { Prisma } from '@prisma/client';

// export async function GET(request: Request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const sessionId = searchParams.get('sessionId');

//     // Safe fallback: if the session isn't loaded on the client yet, 
//     // return an empty shelf gracefully rather than crashing the fetch pipeline.
//     if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
//       return NextResponse.json([]);
//     }

//     // 1. Check if the parent WorkspaceSession exists
//     const sessionExists = await prisma.workspaceSession.findUnique({
//       where: { id: sessionId },
//       select: { id: true },
//     });

//     // 2. Dynamic Initialization: If a valid ID isn't found, build the session container
//     if (!sessionExists) {
//       console.log(`Workspace "${sessionId}" not found. Initializing new canvas table record...`);
//       try {
//         await prisma.workspaceSession.create({
//           data: {
//             id: sessionId,
//             nodes: [] as Prisma.InputJsonValue,
//           },
//         });
//       } catch (createError: any) {
//         // Catch race conditions if two components trigger initialization simultaneously
//         console.warn(`Session initialization notice for ${sessionId}:`, createError.message);
//       }
//     }

//     // 3. Fetch assets assigned directly to this session ID
//     const assets = await prisma.assetReference.findMany({
//       where: { sessionId: sessionId },
//       orderBy: { timestamp: 'desc' },
//     });

//     return NextResponse.json(assets);
//   } catch (error: any) {
//     console.error('Fetch assets error in backend API:', error);
//     return NextResponse.json({ error: 'Failed to fetch assets', details: error.message }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');

    if (!sessionId || sessionId === 'undefined' || sessionId === 'null') {
      return NextResponse.json([]);
    }

    const sessionExists = await prisma.workspaceSession.findUnique({
      where: { id: sessionId },
      select: { id: true },
    });

    if (!sessionExists) {
      try {
        await prisma.workspaceSession.create({
          data: {
            id: sessionId,
            nodes: [] as Prisma.JsonArray,
          },
        });
      } catch (createError: any) {
        console.warn(`Session initialization notice for ${sessionId}:`, createError.message);
      }
    }

    const assets = await prisma.assetReference.findMany({
      where: { sessionId: sessionId },
      orderBy: { timestamp: 'desc' },
    });

    return NextResponse.json(assets);
  } catch (error: any) {
    console.error('Fetch assets error in backend API:', error);
    return NextResponse.json({ error: 'Failed to fetch assets', details: error.message }, { status: 500 });
  }
}