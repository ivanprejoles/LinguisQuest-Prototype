import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { userText, targetLanguage } = await req.json();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are "Lingo", a friendly language tutor.
      User said: "${userText}"
      Target Language: ${targetLanguage} (e.g., Tagalog, English, French).

      Guidelines:
      - Respond in 1-2 simple sentences appropriate for a conversation.
      - Keep the response encouraging, polite, and completely free of toxic/bad language.
      - Always end with a simple follow-up question.

      Return JSON strictly using this format:
      {
        "aiResponseText": "The response text in the target language",
        "englishTranslation": "English translation of the response",
        "emotion": "happy | encouraging | thinking | surprised | neutral"
      }
    `;

    const result = await model.generateContent(prompt);
    const data = JSON.parse(result.response.text());

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to process speech" }, { status: 500 });
  }
}