import { NextRequest, NextResponse } from "next/server";

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

    let apiUrl;
    let payload;

    if (processingMode === "process") {
      // --- IMAGE PROCESSING LOGIC (using gemini-2.5-flash-image-preview) ---
      console.log("Mode: Image Processing");

      if (!imageBase64) {
        return NextResponse.json(
          {
            success: false,
            error: "Image is required for processing mode",
          },
          { status: 400 }
        );
      }

      // Clean up the base64 string
      const base64Data = imageBase64.split(",")[1];
      const mimeType =
        imageBase64.match(/data:(.*);base64/)?.[1] || "image/png";

      // Determine the prompt based on whether image generation is requested
      const analysisPrompt = generateImage
        ? `Generate a new image based on this original image. Apply the following changes exactly as requested: ${prompt}. Create the modified image directly without asking questions or seeking clarification. Keep all other aspects of the image exactly the same, only modify what was specified in the prompt. Generate the image now.`
        : `Analyze this image and ${prompt}. Provide a detailed description of what you see. Focus on providing a comprehensive text analysis without generating a new image.`;

      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
      payload = {
        contents: [
          {
            parts: [
              {
                text: analysisPrompt,
              },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data,
                },
              },
            ],
          },
        ],
      };
    } else {
      // --- IMAGE GENERATION LOGIC (using imagen-3.0-generate-002) ---
      console.log("Mode: Image Generation");

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
        style
          ? stylePrompts[style as keyof typeof stylePrompts] ||
            `style: ${style}`
          : "",
        quality
          ? qualityPrompts[quality as keyof typeof qualityPrompts] ||
            `quality: ${quality}`
          : "",
        aspectRatio
          ? aspectRatioPrompts[
              aspectRatio as keyof typeof aspectRatioPrompts
            ] || `aspect ratio: ${aspectRatio}`
          : "",
      ]
        .filter(Boolean)
        .join(", ");

      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${apiKey}`;
      payload = {
        instances: [{ prompt: descriptivePrompt }],
        parameters: { sampleCount: 1 },
      };
    }

    // Make the API call to the selected Gemini model
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error("Gemini API Error:", JSON.stringify(errorBody, null, 2));
      return NextResponse.json(
        {
          success: false,
          error: `Failed to process image. Status: ${response.status}`,
          details: errorBody.error?.message || "Unknown error from Gemini API.",
        },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log("Gemini API Response:", result);

    // Handle response based on processing mode and generateImage flag
    if (processingMode === "process") {
      const candidate = result?.candidates?.[0];
      const textResponse = candidate?.content?.parts?.find(
        (p: any) => p.text
      )?.text;

      if (!generateImage) {
        // Return text analysis only
        if (!textResponse) {
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
          text: textResponse,
          mode: processingMode,
          message: "Successfully analyzed image using Gemini AI",
          metadata: {
            prompt,
            mode: processingMode,
            generatedAt: new Date().toISOString(),
            aiProvider: "Google Gemini",
          },
        });
      } else {
        // Generate image with changes
        const imageData = candidate?.content?.parts?.find(
          (p: any) => p.inlineData
        )?.inlineData?.data;

        if (imageData) {
          const imageUrl = `data:image/png;base64,${imageData}`;
          return NextResponse.json({
            success: true,
            type: "image",
            imageUrl: imageUrl,
            mode: processingMode,
            message: "Successfully processed image using Gemini AI",
            metadata: {
              prompt,
              mode: processingMode,
              generatedAt: new Date().toISOString(),
              aiProvider: "Google Gemini",
            },
          });
        } else {
          // Fallback to text analysis if no image generated
          return NextResponse.json({
            success: true,
            type: "text",
            text:
              textResponse ||
              "Image analysis completed but no new image was generated.",
            mode: processingMode,
            message: "Successfully analyzed image using Gemini AI",
            metadata: {
              prompt,
              mode: processingMode,
              generatedAt: new Date().toISOString(),
              aiProvider: "Google Gemini",
            },
          });
        }
      }
    } else {
      // Image generation mode
      const finalBase64Data = result.predictions?.[0]?.bytesBase64Encoded;

      if (!finalBase64Data) {
        console.error("Could not find image data in API response:", result);
        return NextResponse.json(
          {
            success: false,
            error: "Could not extract image data from API response",
          },
          { status: 500 }
        );
      }

      const imageUrl = `data:image/png;base64,${finalBase64Data}`;
      return NextResponse.json({
        success: true,
        type: "image",
        imageUrl: imageUrl,
        mode: processingMode,
        message: "Successfully generated image using Gemini AI",
        metadata: {
          prompt,
          mode: processingMode,
          generatedAt: new Date().toISOString(),
          aiProvider: "Google Gemini",
        },
      });
    }
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
