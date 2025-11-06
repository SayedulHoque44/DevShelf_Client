import { NextRequest, NextResponse } from "next/server";

const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY || "";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

export async function POST(request: NextRequest) {
  try {
    const {
      htmlContent,
      platform,
      title,
      writingTone = "professional",
      targetAudience = "general",
      contentType = "blog",
      industry = "technology",
      targetWordCount = 200,
    } = await request.json();

    console.log("Generating social media format:", {
      platform,
      title: title?.substring(0, 50) + "...",
      writingTone,
      targetAudience,
      contentType,
      industry,
      targetWordCount,
    });

    if (!htmlContent || !platform) {
      return NextResponse.json(
        { error: "HTML content and platform are required" },
        { status: 400 }
      );
    }

    const baseInstructions = `
CONTEXT:
- Target Word Count: Approximately ${targetWordCount} words
- Blog Title: ${title || "Blog Post"}
- HTML Content: ${htmlContent}
`;

    // Create platform-specific prompts
    const platformPrompts = {
      whatsapp: ` ${baseInstructions} Convert this HTML blog post into a clean WhatsApp message format.

IMPORTANT FORMATTING RULES:
- Use WhatsApp markdown formatting:
  * Bold: *your text* → your text
  * Italic: _your text_ → your text  
  * Strikethrough: ~your text~ → your text
  * Monospace/code: \`your text\` → your text
- Use emojis naturally and sparingly
- Keep paragraphs short with line breaks
- Make it conversational and easy to read
- Add 2-3 relevant hashtags at the end
- Include a brief call-to-action
- NO double asterisks (**) - only single asterisks (*)
- Adapt the tone and language to match the ${writingTone} style


Format as a clean, readable WhatsApp message with proper WhatsApp markdown formatting.`,

      facebook: ` ${baseInstructions} Convert this HTML blog post into a clean, engaging Facebook post.

IMPORTANT RULES:
1. Never include the words "Bold," "Italic," "Unicode," or any label indicating formatting.
2. Do not use asterisks (*) or markdown.
3. Apply formatting ONLY using Unicode:
   • <strong>…</strong> → convert to 𝗯𝗼𝗹𝗱 letters.
   • <em>…</em> → convert to 𝘪𝘵𝗮𝗹𝗶𝗰 letters.
4. Remove any literal words that could indicate formatting.
5. Keep paragraphs short (1–3 sentences) and conversational.
6. Use emojis sparingly for emphasis.
7. End with 3–5 relevant hashtags and a call-to-action.
8. Total post length under 2,000 characters.
9. Adapt the tone and language to match the ${writingTone} style


Output:
A single Facebook post following the rules above, with correct Unicode formatting applied, and absolutely no words like "Bold" or "Italic" appearing anywhere in the final text. Format as a clean, readable facebook message with proper facebook markdown formatting.`,

      twitter: ` ${baseInstructions} Convert this HTML blog post into a clean Twitter thread format.

FORMATTING RULES:
- Use Unicode characters for emphasis (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤)
- Structure like a readable Twitter thread with:
  * Clear section headers with emojis (🚀, 🔍, ⚠️, ✅, etc.)
  * Short, punchy sentences
  * Bullet points with checkmarks ✅ or arrows 🔹
  * Thread format (1/4, 2/4, etc.)
  * Conversational, engaging tone
- Create 3-4 tweets maximum
- Keep each tweet under 280 characters
- Add 1-2 relevant hashtags per tweet
- Use emojis strategically for engagement
- Make it shareable and engaging
- Adapt the tone and language to match the ${writingTone} style


Format as a clean Twitter thread with proper structure, emojis, and Unicode formatting.`,

      linkedin: ` ${baseInstructions} Convert this HTML blog post into a clean LinkedIn post format.

FORMATTING RULES:
- Use Unicode characters for emphasis (𝗯𝗼𝗹𝗱, 𝘪𝘵𝘢𝘭𝘪𝘤)
- Structure like a professional LinkedIn post with:
  * Clear section headers with emojis (🚀, 🔍, ⚠️, ✅, etc.)
  * Short paragraphs (1-2 sentences max)
  * Bullet points with checkmarks ✅ or arrows 🔹
  * Line breaks between sections
  * Professional but engaging tone
- Use emojis very sparingly (1-2 max)
- Write in first person when appropriate
- Add 3-5 relevant hashtags at the end
- Include a professional call-to-action
- Focus on business value and insights
- Adapt the tone and language to match the ${writingTone} style


Format as a clean, professional LinkedIn post with proper structure, emojis, and Unicode formatting.`,

      instagram: ` ${baseInstructions} Convert this HTML blog post into a clean Instagram caption format.

FORMATTING RULES:
- Use Unicode characters for emphasis (𝐛𝐨𝐥𝐝, 𝑖𝑡𝑎𝑙𝑖𝑐)
- Structure like a readable Instagram caption with:
  * Clear section headers with emojis (🚀, 🔍, ⚠️, ✅, etc.)
  * Short paragraphs (1-2 sentences max)
  * Bullet points with checkmarks ✅ or arrows 🔹
  * Line breaks between sections
  * Friendly, engaging tone
- Use emojis naturally throughout
- Keep it concise and scannable
- Add 5-10 relevant hashtags at the end
- Include a clear call-to-action
- Adapt the tone and language to match the ${writingTone} style

Format as a clean Instagram caption with proper structure, emojis, and Unicode formatting.`,
    };

    const prompt = platformPrompts[platform as keyof typeof platformPrompts];

    if (!prompt) {
      return NextResponse.json(
        { error: "Unsupported platform" },
        { status: 400 }
      );
    }

    // Call Mistral AI to generate social media format
    const response = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MISTRAL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistral-large-latest",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Mistral API Error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate social media format", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    const formattedContent = data.choices[0]?.message?.content || "";

    return NextResponse.json({
      content: formattedContent,
      platform,
      usage: data.usage,
    });
  } catch (error) {
    console.error("Social Format Generation Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
