import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required and must be a string" },
        { status: 400 }
      );
    }

    if (prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt cannot be empty" },
        { status: 400 }
      );
    }

    // Check if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Google GenAI API key is not configured. Please set GOOGLE_GENAI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Initialize Google GenAI with API key
    const ai = new GoogleGenAI({ apiKey });

    // Generate content using the provided prompt
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    console.log("Google GenAI API Response:", response);
    // Extract the response text
    const responseText = response.text || "No response generated";

    return NextResponse.json({
      success: true,
      response: responseText,
      model: "gemini-2.5-flash",
      prompt: prompt,
    });
  } catch (error) {
    console.error("Google GenAI API Error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for common API errors
      if (
        error.message.includes("API key") ||
        error.message.includes("authentication")
      ) {
        return NextResponse.json(
          {
            error:
              "API key is missing or invalid. Please check your Google GenAI configuration.",
          },
          { status: 401 }
        );
      }

      if (error.message.includes("quota")) {
        return NextResponse.json(
          { error: "API quota exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      if (error.message.includes("model")) {
        return NextResponse.json(
          { error: "Model not available. Please try a different model." },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: `API Error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred while processing your request" },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to test the API." },
    { status: 405 }
  );
}
