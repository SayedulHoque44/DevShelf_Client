import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: NextRequest) {
  try {
    const { message, pdfBase64, pdfMimeType, conversationHistory } =
      await request.json();

    // 1. Secure API Key
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key missing" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // === DIAGNOSTIC STEP: Check available models ===
    // This helps us debug the "404 Not Found" error
    try {
      /* Uncomment this block if you want to see the list in your terminal */
      // const modelList = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" }).apiKey;
      // We can't list directly easily without an extra call, but let's try a direct model call first.
    } catch (e) {
      console.log("Diagnostic check failed");
    }
    // ===============================================

    // 2. Prepare History
    const history = (conversationHistory || []).map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // 3. Prepare Message
    const currentMessageParts: any[] = [{ text: message || "" }];

    if (pdfBase64) {
      const cleanBase64 = pdfBase64.includes(",")
        ? pdfBase64.split(",")[1]
        : pdfBase64;
      currentMessageParts.push({
        inlineData: {
          mimeType: pdfMimeType || "application/pdf",
          data: cleanBase64,
        },
      });
    }

    // 4. Try Specific Models
    // We use explicit version numbers to avoid alias resolution issues
    const modelsToTry = [
      "gemini-2.5-flash",
      "gemini-2.5-flash-latest",
      "gemini-2.5-pro",
    ];

    let responseText = "";
    let usedModel = "";
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting model: ${modelName}...`);

        // Initialize model
        const model = genAI.getGenerativeModel({ model: modelName });

        // Start chat
        const chat = model.startChat({ history });

        // Send
        const result = await chat.sendMessage(currentMessageParts);
        const response = await result.response;
        const text = response.text();

        if (text) {
          responseText = text;
          usedModel = modelName;
          console.log(`SUCCESS with ${modelName}`);
          break;
        }
      } catch (error: any) {
        console.error(`FAILED ${modelName}: ${error.message}`);
        lastError = error;
      }
    }

    if (!responseText) {
      // If ALL models failed, this is likely an API Console setup issue
      return NextResponse.json(
        {
          success: false,
          error: "All models failed. Check server console for details.",
          details: lastError?.message || "Unknown error",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: responseText,
      metadata: { model: usedModel },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
