import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Shared helper to generate images from prompt only (same pattern as generate-ai-image route)
async function generateAIImageWithGeminiFromPrompt(
  prompt: string,
  style: string,
  quality: string,
  aspectRatio: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "API key not configured. Please set GEMINI_API_KEY environment variable."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash-image-preview",
  });

  const stylePrompts = {
    realistic: "photorealistic, high detail, professional photography",
    artistic: "artistic, creative, stylized, unique composition",
    cartoon: "cartoon style, animated, colorful, fun",
    abstract: "abstract art, modern, conceptual, creative",
    portrait: "portrait photography, professional headshot, detailed face",
    landscape: "landscape photography, scenic view, natural beauty",
  } as const;

  const qualityPrompts = {
    high: "ultra high quality, 4K resolution, professional grade",
    medium: "high quality, detailed, clear",
    low: "good quality, clear",
  } as const;

  const aspectRatioPrompts = {
    "1:1": "square format, 1:1 aspect ratio",
    "16:9": "widescreen format, 16:9 aspect ratio",
    "4:3": "standard format, 4:3 aspect ratio",
    "9:16": "portrait format, 9:16 aspect ratio",
  } as const;

  const descriptivePrompt = [
    prompt,
    stylePrompts[style as keyof typeof stylePrompts] || `style: ${style}`,
    qualityPrompts[quality as keyof typeof qualityPrompts] ||
      `quality: ${quality}`,
    aspectRatioPrompts[aspectRatio as keyof typeof aspectRatioPrompts] ||
      `aspect ratio: ${aspectRatio}`,
  ]
    .filter(Boolean)
    .join(", ");

  const result = await model.generateContent(descriptivePrompt);
  const response = result.response;

  const base64ImageData = response?.candidates?.[0]?.content?.parts?.find(
    (p: any) => p.inlineData
  )?.inlineData?.data;

  if (!base64ImageData) {
    throw new Error("Could not extract image data from API response");
  }

  return `data:image/png;base64,${base64ImageData}`;
}

export async function POST(request: NextRequest) {
  try {
    const {
      prompt,
      imageBase64,
      style,
      quality,
      aspectRatio,
      mode,
      generateImage,
    } = await request.json();

    console.log("=== AI IMAGE PROCESSING REQUEST ===");
    console.log("Mode:", mode || (imageBase64 ? "process" : "generate"));
    console.log("Prompt:", prompt);
    console.log("Has Image:", !!imageBase64);
    console.log("Generate Image:", generateImage);
    console.log("Style:", style);
    console.log("Quality:", quality);
    console.log("Aspect Ratio:", aspectRatio);

    // Validation
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required for image processing",
        },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt must be less than 1000 characters",
        },
        { status: 400 }
      );
    }

    // Get the API Key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "API key not configured. Please set GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Determine the mode: 'process' or 'generate'
    const processingMode = mode || (imageBase64 ? "process" : "generate");

    // IMAGE PROCESSING MODE (analyze or modify existing image)
    if (processingMode === "process") {
      console.log("Mode: Image Processing (SDK)");

      if (!imageBase64) {
        return NextResponse.json(
          {
            success: false,
            error: "Image is required for processing mode",
          },
          { status: 400 }
        );
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-image-preview",
      });

      // Clean up the base64 string
      const base64Data = imageBase64.split(",")[1];
      const mimeType =
        imageBase64.match(/data:(.*);base64/)?.[1] || "image/png";

      // Determine the prompt based on whether image generation is requested
      const analysisPrompt = generateImage
        ? `Generate a new image based on this original image. Apply the following changes exactly as requested: ${prompt}. Create the modified image directly without asking questions or seeking clarification. Keep all other aspects of the image exactly the same, only modify what was specified in the prompt. Generate the image now.`
        : `Analyze this image and ${prompt}. Provide a detailed description of what you see. Focus on providing a comprehensive text analysis without generating a new image.`;

      const result = await model.generateContent([
        { text: analysisPrompt },
        {
          inlineData: {
            mimeType,
            data: base64Data,
          },
        },
      ]);

      const response = result.response;

      if (!generateImage) {
        // Text analysis only
        const text = response.text?.() || "";
        if (!text.trim()) {
          return NextResponse.json(
            {
              success: false,
              error: "No text analysis received from the model",
            },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          type: "text",
          text,
          mode: processingMode,
          message: "Successfully analyzed image using Gemini AI",
          metadata: {
            prompt,
            mode: processingMode,
            generatedAt: new Date().toISOString(),
            aiProvider: "Google Gemini (@google/genai)",
          },
        });
      } else {
        // Try to get a modified image back
        const candidate = response?.candidates?.[0];
        const imageData = candidate?.content?.parts?.find(
          (p: any) => p.inlineData
        )?.inlineData?.data;
        const textFallback = response.text?.() || "";

        if (imageData) {
          const imageUrl = `data:image/png;base64,${imageData}`;
          return NextResponse.json({
            success: true,
            type: "image",
            imageUrl,
            mode: processingMode,
            message: "Successfully processed image using Gemini AI",
            metadata: {
              prompt,
              mode: processingMode,
              generatedAt: new Date().toISOString(),
              aiProvider: "Google Gemini (@google/genai)",
            },
          });
        }

        // Fallback: return analysis text if no image was generated
        return NextResponse.json({
          success: true,
          type: "text",
          text:
            textFallback ||
            "Image analysis completed but no new image was generated.",
          mode: processingMode,
          message:
            "Successfully analyzed image using Gemini AI (no image generated)",
          metadata: {
            prompt,
            mode: processingMode,
            generatedAt: new Date().toISOString(),
            aiProvider: "Google Gemini (@google/genai)",
          },
        });
      }
    }

    // IMAGE GENERATION MODE (no input image, just prompt) - reuse prompt-only helper
    console.log("Mode: Image Generation (SDK, prompt only)");
    const imageUrl = await generateAIImageWithGeminiFromPrompt(
      prompt,
      style,
      quality,
      aspectRatio
    );

    return NextResponse.json({
      success: true,
      type: "image",
      imageUrl,
      mode: processingMode,
      message: "Successfully generated image using Gemini AI",
      metadata: {
        prompt,
        style,
        quality,
        aspectRatio,
        mode: processingMode,
        generatedAt: new Date().toISOString(),
        aiProvider: "Google Gemini (@google/genai)",
      },
    });
  } catch (error: any) {
    console.error("Error processing image:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to process image. Please try again.",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
