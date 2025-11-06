import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// This is the main function that handles POST requests to this API route
export async function POST(request: Request) {
  // 1. Extract the YouTube URL from the request body
  const { youtubeUrl } = await request.json();

  // 2. Validate the input
  if (!youtubeUrl) {
    return NextResponse.json(
      { error: "YouTube URL is required." },
      { status: 400 }
    );
  }

  // 3. Get the Gemini API Key from environment variables
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Gemini API key is not configured." },
      { status: 500 }
    );
  }

  // 4. Construct the prompt using the template you designed
  const prompt = `For the given YouTube URL, provide a JSON object with the following keys: "summary", "video_length", "likes", "key_points", "url", "title", and "channel_name".

- The "summary" value should be a concise summary of the video's content based on its transcript.
- The "key_points" value should be a list of the main points or takeaways from the video.

Respond only with the raw JSON object and no other text, markdown formatting, or explanations.

URL: ${youtubeUrl}`;

  try {
    // 5. Initialize GoogleGenAI and call the API
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const rawJsonString1 =
      response && typeof response.text === "string"
        ? response.text.replace(/^```json\s*|```\s*$/g, "").trim()
        : "";

    let parsedJson1 = null;
    try {
      parsedJson1 = JSON.parse(rawJsonString1);
    } catch (err) {
      console.error("Failed to parse JSON from Gemini response:", err);
      throw new Error("Response from Gemini is not valid JSON.");
    }

    console.log("response", parsedJson1);
    // 6. Extract and parse the JSON response from Gemini
    const rawJsonString = response.text;

    if (!rawJsonString) {
      throw new Error("Could not extract text from Gemini response.");
    }

    // The response is a string that looks like JSON, so we need to parse it.
    const parsedJson = JSON.parse(rawJsonString);

    // 7. Send the clean JSON object back to the frontend
    return NextResponse.json(parsedJson);
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Return a generic server error
    return NextResponse.json(
      { error: "Failed to summarize video. Please check the server logs." },
      { status: 500 }
    );
  }
}
