
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

import { prisma } from "@/lib/prisma";
import {
  createEmptyConversationSummary,
  sanitizeConversationSummary,
  type ConversationSummary,
} from "@/lib/conversation-summary";

// -----------------------------------------------------------------------------
// Configuration
// -----------------------------------------------------------------------------

export const runtime = "nodejs";

const MAX_BODY_BYTES = 12_000;
const MAX_MESSAGE_LENGTH = 1_000;
const MAX_SUMMARY_JSON_LENGTH = 2_000;

const GEMINI_TIMEOUT_MS = 30_000;

const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

const TUTOR_INSTRUCTIONS = `
You are a friendly, patient language conversation tutor.

Your job is to help the learner practice the target language through natural,
engaging conversation.

Rules:
- Use language appropriate to the learner's level.
- Keep replies concise, usually 1-3 short sentences.
- Ask at most one follow-up question.
- Correct important mistakes briefly and kindly.
- Do not overwhelm the learner with grammar explanations.
- Encourage the learner to continue speaking.
- Follow the topic's coaching instructions.
- Do not invent facts about the learner.
- Return only the tutor's conversational reply as plain text.
- Do not return JSON, labels, or explanations about your response.
`;

type RequestBody = {
  action?: "start" | "message";
  languageId?: string;
  message?: string;
  summary?: unknown;
};

// -----------------------------------------------------------------------------
// Error helpers
// -----------------------------------------------------------------------------

function getErrorStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  const item = error as {
    status?: number;
    code?: number | string;
    message?: string;
  };

  if (
    item.status === 429 ||
    item.code === 429 ||
    String(item.code).includes("RESOURCE_EXHAUSTED") ||
    item.message?.includes("RESOURCE_EXHAUSTED")
  ) {
    return 429;
  }

  if (typeof item.status === "number") {
    return item.status;
  }

  if (typeof item.code === "number") {
    return item.code;
  }

  if (typeof item.code === "string") {
    const numericCode = Number(item.code);

    if (Number.isInteger(numericCode)) {
      return numericCode;
    }
  }

  return null;
}

function isAbortError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.name === "AbortError" ||
    error.name === "TimeoutError"
  );
}

function getSummaryForPrompt(
  summary: ConversationSummary,
): string {
  const serialized = JSON.stringify(summary);

  if (serialized.length > MAX_SUMMARY_JSON_LENGTH) {
    return JSON.stringify(
      createEmptyConversationSummary(summary.sessionGoal),
    );
  }

  return serialized;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

// -----------------------------------------------------------------------------
// GET: Load conversation topic
// -----------------------------------------------------------------------------

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ topicId: string }> },
) {
  try {
    const { topicId } = await context.params;

    const topic = await prisma.conversationTopic.findUnique({
      where: {
        id: topicId,
      },
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
        { error: "Conversation topic not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error("[Conversation GET]", error);

    return NextResponse.json(
      { error: "Failed to load conversation topic." },
      { status: 500 },
    );
  }
}

// -----------------------------------------------------------------------------
// POST: Start conversation or send learner message
// -----------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ topicId: string }> },
) {
  const requestStartedAt = Date.now();

  const requestId = crypto.randomUUID();

  let usageLog: {
    action?: string;
    model: string;
    promptCharacters?: number;
    systemInstructionCharacters: number;
    learnerMessageCharacters?: number;
    summaryCharacters?: number;
  } = {
    model: MODEL,
    systemInstructionCharacters: TUTOR_INSTRUCTIONS.length,
  };

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;

  try {
    const { topicId } = await context.params;

    console.log("[Conversation] Request received:", {
      topicId,
    });

    // -------------------------------------------------------------------------
    // Validate request size
    // -------------------------------------------------------------------------

    const contentLength = Number(
      request.headers.get("content-length") || 0,
    );

    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    const rawBody = await request.text();

    const actualBodySize = new TextEncoder().encode(rawBody).length;

    if (actualBodySize > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 },
      );
    }

    // -------------------------------------------------------------------------
    // Parse request
    // -------------------------------------------------------------------------

    let body: RequestBody;

    try {
      body = JSON.parse(rawBody) as RequestBody;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request body." },
        { status: 400 },
      );
    }

    const action = body.action ?? "message";

    if (action !== "start" && action !== "message") {
      return NextResponse.json(
        { error: "Invalid conversation action." },
        { status: 400 },
      );
    }

    if (
      typeof body.languageId !== "string" ||
      !body.languageId.trim()
    ) {
      return NextResponse.json(
        { error: "A valid languageId is required." },
        { status: 400 },
      );
    }

    const learnerMessage =
      typeof body.message === "string"
        ? body.message.trim()
        : "";

    if (
      action === "message" &&
      (!learnerMessage ||
        learnerMessage.length > MAX_MESSAGE_LENGTH)
    ) {
      return NextResponse.json(
        {
          error: `Message must contain between 1 and ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 400 },
      );
    }

    // -------------------------------------------------------------------------
    // Check Gemini configuration
    // -------------------------------------------------------------------------

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error("[Conversation] GEMINI_API_KEY is missing.");

      return NextResponse.json(
        {
          error: "AI service is not configured.",
          code: "AI_NOT_CONFIGURED",
        },
        { status: 500 },
      );
    }

    // -------------------------------------------------------------------------
    // Load topic and language
    // -------------------------------------------------------------------------

    console.time("[Conversation] Database lookup");

    const [topic, language] = await Promise.all([
      prisma.conversationTopic.findUnique({
        where: {
          id: topicId,
        },
        select: {
          id: true,
          title: true,
          description: true,
          aiOpeningMessage: true,
          coachingInstructions: true,
        },
      }),

      prisma.language.findUnique({
        where: {
          id: body.languageId,
        },
        select: {
          id: true,
          name: true,
          voiceLanguage: true,
        },
      }),
    ]);

    console.timeEnd("[Conversation] Database lookup");

    if (!topic) {
      return NextResponse.json(
        { error: "Conversation topic not found." },
        { status: 404 },
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Language not found." },
        { status: 404 },
      );
    }

    // -------------------------------------------------------------------------
    // Prepare compact conversation memory
    // -------------------------------------------------------------------------

    const previousSummary =
      action === "start"
        ? createEmptyConversationSummary(topic.title)
        : sanitizeConversationSummary(
            body.summary ??
              createEmptyConversationSummary(topic.title),
          );

    const summaryContext = getSummaryForPrompt(previousSummary);

    // -------------------------------------------------------------------------
    // Build prompt
    // -------------------------------------------------------------------------

    const contextLines = [
      `Target language: ${language.name}`,
      `Conversation topic: ${topic.title}`,
      topic.description
        ? `Topic description: ${topic.description}`
        : "",
      topic.coachingInstructions
        ? `Topic coaching instructions: ${topic.coachingInstructions}`
        : "",
      `Learner memory: ${summaryContext}`,
    ].filter(Boolean);

    const task =
      action === "start"
        ? [
            "Start a new language-practice conversation.",
            topic.aiOpeningMessage
              ? `Use this opening guidance: ${topic.aiOpeningMessage}`
              : "",
            "Write a short, welcoming opening message.",
            "Introduce the topic naturally.",
            "Ask the learner one simple question.",
          ]
            .filter(Boolean)
            .join("\n")
        : [
            "Respond naturally to the learner's latest message.",
            "Do not repeat the entire conversation.",
            `Learner's latest message: ${learnerMessage}`,
          ].join("\n");

    const prompt = [
      ...contextLines,
      "",
      task,
    ].join("\n");

    usageLog = {
      ...usageLog,
      action,
      promptCharacters: prompt.length,
      learnerMessageCharacters: learnerMessage.length,
      summaryCharacters: summaryContext.length,
    };

    console.info("[Gemini Usage] Request:", {
      requestId,
      ...usageLog,
      estimatedInputCharacters:
        prompt.length + TUTOR_INSTRUCTIONS.length,
    });
    

    // -------------------------------------------------------------------------
    // Generate plain-text Gemini response
    // -------------------------------------------------------------------------

    const ai = new GoogleGenAI({ apiKey });

    const abortController = new AbortController();

    timeoutId = setTimeout(() => {
      timedOut = true;
      abortController.abort();
    }, GEMINI_TIMEOUT_MS);

    console.log("[Conversation] Calling Gemini:", {
      model: MODEL,
      action,
      timeoutMs: GEMINI_TIMEOUT_MS,
      automaticRetries: false,
    });

    console.time("[Conversation] Gemini generation");

    const result = await ai.models.generateContent({
      model: MODEL,
      contents: prompt,
      config: {
        systemInstruction: TUTOR_INSTRUCTIONS,

        maxOutputTokens: 180,

        thinkingConfig: {
          thinkingLevel: ThinkingLevel.LOW,
        },

        // Plain-text output.
        responseMimeType: "text/plain",

        // Do not make another generation request automatically.
        automaticContinuation: false,

        // Abort the client request after 30 seconds.
        abortSignal: abortController.signal,

        httpOptions: {
          timeout: GEMINI_TIMEOUT_MS,

          // One total attempt, including the initial request.
          retryOptions: {
            attempts: 1,
          },
        },
      },
    });

    console.timeEnd("[Conversation] Gemini generation");

    const generatedText = result.text?.trim();

    if (!generatedText) {
      throw new Error("Gemini returned an empty reply.");
    }

    // -------------------------------------------------------------------------
    // Return response
    // -------------------------------------------------------------------------

    const usage = result.usageMetadata;

    const inputTokens = usage?.promptTokenCount ?? 0;
    const outputTokens = usage?.candidatesTokenCount ?? 0;
    const thinkingTokens = usage?.thoughtsTokenCount ?? 0;
    const totalTokens = usage?.totalTokenCount ?? 0;

    console.info("[Gemini Usage] Completed:", {
      requestId,
      model: MODEL,
      action,

      // Actual Gemini token usage
      inputTokens,
      outputTokens,
      thinkingTokens,
      totalTokens,

      // Prompt and response sizes
      inputCharacters:
        prompt.length + TUTOR_INSTRUCTIONS.length,
      outputCharacters: generatedText.length,

      // Performance
      durationMs: Date.now() - requestStartedAt,

      // Useful for spotting unexpected usage
      summaryCharacters: summaryContext.length,
    });

    console.log(
      `[Conversation] Completed in ${
        Date.now() - requestStartedAt
      }ms`,
    );

    return NextResponse.json({
      text: generatedText.slice(0, MAX_MESSAGE_LENGTH),

      // Preserve existing memory.
      // Summary updates are handled separately by the application.
      summary: previousSummary,

      voiceLanguage: language.voiceLanguage || "en-US",

      memoryUpdated: false,

      usage: usage
      ? {
          inputTokens,
          outputTokens,
          thinkingTokens,
          totalTokens,
        }
      : undefined,
    });
  } catch (error) {
    console.error("[Gemini Usage] Failed request:", {
      requestId,
      ...usageLog,
      durationMs: Date.now() - requestStartedAt,
      errorStatus: getErrorStatus(error),
      timedOut,
    });

    // -------------------------------------------------------------------------
    // Timeout
    // -------------------------------------------------------------------------

    if (timedOut || isAbortError(error)) {
      return NextResponse.json(
        {
          error:
            "The AI tutor took too long to respond. Please try again.",
          code: "AI_TIMEOUT",
        },
        { status: 504 },
      );
    }

    // -------------------------------------------------------------------------
    // Service errors
    // -------------------------------------------------------------------------

    const status = getErrorStatus(error);
    const errorMessage = getErrorMessage(error);

    if (status === 503) {
      return NextResponse.json(
        {
          error:
            "The AI tutor is temporarily unavailable. Please try again.",
          code: "MODEL_UNAVAILABLE",
        },
        { status: 503 },
      );
    }

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "The AI tutor is receiving too many requests. Please try again shortly.",
          code: "RATE_LIMITED",
        },
        { status: 429 },
      );
    }

    if (status === 504) {
      return NextResponse.json(
        {
          error:
            "The AI service timed out. Please try again.",
          code: "AI_TIMEOUT",
        },
        { status: 504 },
      );
    }

    console.error("[Conversation POST] Details:", errorMessage);

    return NextResponse.json(
      {
        error:
          "Something went wrong while generating the response. Please try again.",
        code: "CONVERSATION_ERROR",
      },
      {
        status:
          status && status >= 400 && status <= 599
            ? status
            : 500,
      },
    );
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}
