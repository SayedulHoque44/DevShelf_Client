import { NextRequest, NextResponse } from "next/server";

// Gemini Imagen API Image Generation Service
async function generateAIImageWithGemini(
  prompt: string,
  style: string,
  quality: string,
  aspectRatio: string
) {
  try {
    // Get the API Key from environment variables
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY not found in environment variables");
    }

    // Create a descriptive prompt for the image model
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

    // Combine user input into a single, effective prompt
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

    console.log("Descriptive prompt for Imagen:", descriptivePrompt);

    // Construct the API request for the Imagen model
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
    const payload = {
      instances: [{ prompt: descriptivePrompt }],
      parameters: {
        sampleCount: 1, // Generate one image
      },
    };

    // Make the API call to Gemini Imagen
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(
        "Gemini Imagen API Error:",
        JSON.stringify(errorBody, null, 2)
      );
      throw new Error(
        `Failed to generate image. Status: ${response.status}. ${
          errorBody.error?.message || "Unknown error from Gemini API"
        }`
      );
    }

    const result = await response.json();
    console.log(result, "result");
    // Extract the base64 image data
    const base64ImageData = result.predictions?.[0]?.bytesBase64Encoded;

    if (!base64ImageData) {
      console.error("Could not find image data in API response:", result);
      throw new Error("Could not extract image data from API response");
    }

    const imageUrl = `data:image/png;base64,${base64ImageData}`;
    console.log(imageUrl, "imageUrl");
    console.log("Successfully generated image with Gemini Imagen");
    return imageUrl;
  } catch (error) {
    console.error("Error generating image with Gemini Imagen:", error);
    throw error;
  }
}

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

    // Generate images using Gemini Imagen
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

        // If Gemini fails, fall back to a placeholder
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

    // Return the first image for compatibility with the frontend
    const firstImage = generatedImages[0];

    return NextResponse.json({
      success: true,
      imageUrl: firstImage.url,
      images: generatedImages, // Keep the full array for future use
      message: `Successfully generated ${numImagesToGenerate} image(s) using Gemini Imagen`,
      metadata: {
        prompt,
        style,
        quality,
        aspectRatio,
        generatedAt: new Date().toISOString(),
        aiProvider: "Google Gemini Imagen",
        processingTime: "Variable (depends on AI processing)",
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
