import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API Image Generation Service using the @google/genai package
async function generateAIImageWithGemini(
  prompt: string,
  style: string,
  quality: string,
  aspectRatio: string
) {
  try {
    // 1. Initialize Google Generative AI with the API Key
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

    // 2. Get the appropriate model for image generation via this SDK
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-image-preview", // This model works well with the SDK for image generation
    });

    // 3. Create a descriptive prompt (same logic as before)
    const stylePrompts = {
      realistic: "photorealistic, high detail, professional photography",
      artistic: "artistic, creative, stylized, unique composition",
      cartoon: "cartoon style, animated, colorful, fun",
      abstract: "abstract art, modern, conceptual, creative",
      portrait: "portrait photography, professional headshot, detailed face",
      landscape: "landscape photography, scenic view, natural beauty",
    };
    const qualityPrompts = {
      high: "ultra high quality, 4K resolution, professional grade",
      medium: "high quality, detailed, clear",
      low: "good quality, clear",
    };
    const aspectRatioPrompts = {
      "1:1": "square format, 1:1 aspect ratio",
      "16:9": "widescreen format, 16:9 aspect ratio",
      "4:3": "standard format, 4:3 aspect ratio",
      "9:16": "portrait format, 9:16 aspect ratio",
    };

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

    console.log("Descriptive prompt for Gemini:", descriptivePrompt);

    // 4. Make the API call using the SDK's generateContent method
    const result = await model.generateContent(descriptivePrompt);

    const response = result.response;

    // 5. Extract the base64 image data from the SDK's response structure
    const base64ImageData = response?.candidates?.[0]?.content?.parts?.find(
      (p) => p.inlineData
    )?.inlineData?.data;

    if (!base64ImageData) {
      console.error(
        "Could not find image data in API response:",
        JSON.stringify(response, null, 2)
      );
      throw new Error("Could not extract image data from API response");
    }

    const imageUrl = `data:image/png;base64,${base64ImageData}`;
    console.log("Successfully generated image with @google/genai package");
    return imageUrl;
  } catch (error) {
    console.error("Error generating image with @google/genai:", error);
    throw error;
  }
}

// This POST handler and all its logic remains the same
export async function POST(request: NextRequest) {
  try {
    const { prompt, style, quality, aspectRatio, numImages } =
      await request.json();

    console.log("=== AI IMAGE GENERATION REQUEST ===");
    console.log("Prompt:", prompt);
    console.log("Style:", style);
    console.log("Quality:", quality);
    console.log("Aspect Ratio:", aspectRatio);
    console.log("Number of Images:", numImages);

    // Validation
    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt is required for image generation",
        },
        { status: 400 }
      );
    }
    if (prompt.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error: "Prompt must be at least 3 characters long",
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

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "API key not configured. Please set GEMINI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    // Generate images
    const numImagesToGenerate = Math.min(numImages || 1, 4);
    const generatedImages = [];

    for (let i = 0; i < numImagesToGenerate; i++) {
      try {
        const imageUrl = await generateAIImageWithGemini(
          prompt,
          style,
          quality,
          aspectRatio
        );

        generatedImages.push({
          id: `img_${Date.now()}_${i}`,
          url: imageUrl,
          prompt: prompt,
          style: style,
          quality: quality,
          aspectRatio: aspectRatio,
          generatedAt: new Date().toISOString(),
        });
      } catch (imageError: any) {
        console.error(`Error generating image ${i + 1}:`, imageError);

        generatedImages.push({
          id: `img_${Date.now()}_${i}`,
          url: `https://via.placeholder.com/512x512/cccccc/666666?text=Image+Generation+Failed`,
          prompt: prompt,
          style: style,
          quality: quality,
          aspectRatio: aspectRatio,
          generatedAt: new Date().toISOString(),
          error: "Failed to generate with AI, showing placeholder",
        });
      }
    }

    const firstImage = generatedImages[0];

    return NextResponse.json({
      success: true,
      imageUrl: firstImage.url,
      images: generatedImages,
      message: `Successfully generated ${numImagesToGenerate} image(s)`,
      metadata: {
        prompt,
        style,
        quality,
        aspectRatio,
        generatedAt: new Date().toISOString(),
        aiProvider: "Google Gemini (@google/genai)",
      },
    });
  } catch (error: any) {
    console.error("Error generating AI images:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate images. Please try again.",
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
