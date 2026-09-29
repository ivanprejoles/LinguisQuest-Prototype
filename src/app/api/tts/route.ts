// app/api/tts/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text");
  // Get language tag (e.g. "es-ES", "fr-FR", "tl-PH")
  const lang = searchParams.get("lang") || "tl-PH";

  if (!text) {
    return NextResponse.json(
      { error: "Text query is required" },
      { status: 400 }
    );
  }

  // Google Translate TTS accepts the standard BCP-47 language tag or 2-letter ISO code
  const googleTtsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(
    text.trim()
  )}&tl=${encodeURIComponent(lang.trim())}&client=tw-ob`;

  try {
    const response = await fetch(googleTtsUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch audio from Google TTS proxy");
    }

    const audioBuffer = await response.arrayBuffer();

    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400", // Cache audio stream for 24 hours
      },
    });
  } catch (error) {
    console.error("TTS Proxy Error:", error);
    return NextResponse.json(
      { error: "Failed to generate speech" },
      { status: 500 }
    );
  }
}