import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import {prisma} from "@/lib/prisma";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

type RouteContext = {
  params: Promise<{ topicId: string }>;
};

type ConversationMessage = {
  role: "user" | "ai";
  text: string;
};

type ConversationRequest = {
  action: "start" | "message";
  languageId: string;
  message?: string;
  history?: ConversationMessage[];
};

// GET: Retrieve all data for a specific topic
export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { topicId } = await params;

    const topic = await prisma.conversationTopic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        title: true,
        description: true,
        aiOpeningMessage: true,
        coachingInstructions: true,
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Conversation topic not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("Failed to fetch conversation topic:", error);

    return NextResponse.json(
      { error: "Failed to fetch conversation topic" },
      { status: 500 }
    );
  }
}

// POST: Start a conversation or send a message to Gemini
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const { topicId } = await params;
    const body = (await request.json()) as ConversationRequest;
    const { action, languageId, message, history = [] } = body;

    if (
      !languageId ||
      !["start", "message"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid conversation request" },
        { status: 400 }
      );
    }

    if (action === "message" && !message?.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const [topic, language] = await Promise.all([
      prisma.conversationTopic.findUnique({
        where: { id: topicId },
      }),
      prisma.language.findUnique({
        where: { id: languageId },
        select: {
          id: true,
          name: true,
          voiceLanguage: true,
        },
      }),
    ]);

    if (!topic) {
      return NextResponse.json(
        { error: "Conversation topic not found" },
        { status: 404 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Language not found" },
        { status: 404 }
      );
    }

    const systemInstruction = `
You are a friendly language conversation partner.

The learner is practicing ${language.name}.
The voice locale is ${language.voiceLanguage}.

Rules:
- Respond primarily and naturally in ${language.name}.
- Do not repeat English topic instructions verbatim; adapt their meaning into the target language.
- Keep replies friendly and appropriate for a language learner.
- Follow these topic-specific coaching instructions:
${topic.coachingInstructions}
`;

    const contents =
      action === "start"
        ? `Start a conversation about "${topic.title}".

Use this opening message as the intended meaning, translating and adapting it naturally into ${language.name}:
${topic.aiOpeningMessage}

Topic description: ${topic.description}

Return only the opening message in ${language.name}.`
        : [
            ...history.map((item) => ({
              role: item.role === "ai" ? "model" : "user",
              parts: [{ text: item.text }],
            })),
            {
              role: "user",
              parts: [{ text: message!.trim() }],
            },
          ];

    const result = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = result.text?.trim();

    if (!text) {
      return NextResponse.json(
        { error: "Gemini returned an empty response" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      text,
      voiceLanguage: language.voiceLanguage,
    });
  } catch (error) {
    console.error("Gemini conversation error:", error);

    return NextResponse.json(
      { error: "Failed to process the conversation" },
      { status: 500 }
    );
  }
}