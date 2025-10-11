import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: Request) {
  try {
    const { youtubeUrl } = await req.json();

    if (!youtubeUrl) {
      return NextResponse.json(
        {
          success: false,
          error: "YouTube URL is required",
          progress: 0,
        },
        { status: 400 }
      );
    }

    // Enhanced video ID extraction to handle more URL formats
    const videoIdMatch = youtubeUrl.match(
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    console.log("Input URL:", youtubeUrl);
    console.log("Extracted Video ID:", videoId);

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid YouTube URL format. Please provide a valid YouTube URL.",
          progress: 0,
        },
        { status: 400 }
      );
    }

    // Fetch transcript with better error handling
    console.log("Fetching transcript for video ID:", videoId);

    const transcript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "en", // Try English first
    });

    console.log("Transcript length:", transcript?.length || 0);
    console.log("First few transcript items:", transcript?.slice(0, 3));

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "No transcript available for this video. The video may not have captions or transcripts enabled.",
          progress: 50,
        },
        { status: 404 }
      );
    }

    const scriptText = transcript.map((item) => item.text).join(" ");
    console.log("Script text length:", scriptText.length);
    console.log("Script preview:", scriptText.slice(0, 200));

    if (!scriptText || scriptText.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Transcript is empty. The video transcript contains no readable text.",
          progress: 75,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scriptText,
      videoId,
      transcriptLength: transcript.length,
      progress: 100,
      message: "Transcript successfully retrieved",
    });
  } catch (error: any) {
    console.error("Error fetching transcript:", error);

    // More specific error messages
    if (error.message?.includes("Transcript not available")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Transcript not available for this video. Please try a different video.",
          progress: 50,
        },
        { status: 404 }
      );
    }

    if (error.message?.includes("Video unavailable")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Video is unavailable or private. Please check if the video is public and accessible.",
          progress: 25,
        },
        { status: 404 }
      );
    }

    if (error.message?.includes("Network")) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Network error occurred. Please check your internet connection and try again.",
          progress: 0,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transcript. Please try again later.",
        details: error.message,
        progress: 0,
      },
      { status: 500 }
    );
  }
}
