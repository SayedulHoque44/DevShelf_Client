import { NextRequest, NextResponse } from "next/server";

const MISTRAL_API_KEY = "q4csgvETv85HHVEV8bQ88vbFFQjxgk3t";
const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";

function generateFallbackContent(prompt: string, settings: any): string {
  // Extract basic info from prompt
  const topicMatch = prompt.match(/about "([^"]+)"/);
  const audienceMatch = prompt.match(/for ([^,]+)/);
  const toneMatch = prompt.match(/in a ([^,]+) tone/);
  const wordCountMatch = prompt.match(/(\d+)-word/);

  const topic = topicMatch ? topicMatch[1] : "the specified topic";
  const audience = audienceMatch ? audienceMatch[1] : "your target audience";
  const tone = toneMatch ? toneMatch[1] : "professional";
  const wordCount = wordCountMatch ? parseInt(wordCountMatch[1]) : 800;

  return `# ${topic}

## Introduction

Welcome to this comprehensive guide about ${topic.toLowerCase()}. This article is designed specifically for ${audience.toLowerCase()}, written in a ${tone.toLowerCase()} tone to provide you with valuable insights and practical knowledge.

## Understanding the Basics

${topic} is an important subject that requires careful consideration and understanding. Whether you're new to this topic or looking to deepen your knowledge, this guide will provide you with the essential information you need.

### Key Concepts

1. **Fundamental Principles**: Understanding the core concepts is crucial for success
2. **Practical Applications**: How these concepts apply in real-world scenarios
3. **Best Practices**: Proven strategies that deliver results
4. **Common Challenges**: What to watch out for and how to overcome obstacles

## Deep Dive Analysis

Let's explore the more advanced aspects of ${topic.toLowerCase()}:

### Critical Success Factors

- **Strategic Planning**: Develop a clear roadmap for your goals
- **Implementation Excellence**: Execute your plans with precision
- **Continuous Improvement**: Regularly review and optimize your approach
- **Measurement and Analytics**: Track your progress and adjust as needed

### Industry Applications

${topic} has significant applications across various industries. Understanding these applications can help you:

- Identify opportunities in your field
- Develop relevant strategies
- Stay ahead of the competition
- Make informed decisions

## Practical Implementation

Here's how you can start implementing what you've learned:

1. **Assess Your Current Situation**: Understand where you are now
2. **Set Clear Objectives**: Define what you want to achieve
3. **Develop an Action Plan**: Create a step-by-step approach
4. **Execute and Monitor**: Implement your plan and track progress
5. **Iterate and Improve**: Continuously refine your approach

## Conclusion

${topic} is a complex but rewarding subject that offers numerous opportunities for growth and success. By understanding the fundamental principles, implementing best practices, and continuously learning, you can achieve significant results.

### Key Takeaways

- Focus on understanding the fundamentals
- Implement strategies systematically
- Measure your progress regularly
- Stay open to new learning opportunities

### Next Steps

Ready to take action? Here are your immediate next steps:

1. Review the key concepts outlined in this guide
2. Identify specific areas where you can apply these principles
3. Create a plan for implementation
4. Start with small, manageable steps
5. Track your progress and adjust as needed

---

*This content was generated as a fallback due to API connectivity issues. For the best experience, please try again when the AI service is available.*`;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, settings } = await request.json();

    console.log("Received request:", {
      prompt: prompt?.substring(0, 100) + "...",
      settings,
    });

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Try different Mistral models in order of preference
    const models = [
      "mistral-large-latest",
      "mistral-medium-latest",
      "mistral-small-latest",
    ];
    let lastError = null;

    for (const model of models) {
      try {
        console.log(`Trying model: ${model}`);

        const response = await fetch(MISTRAL_API_URL, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${MISTRAL_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: model,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 2000, // Reduced to help control length
            temperature: 0.5, // Lower temperature for more focused content
            top_p: 0.8, // Reduced for more focused generation
          }),
        });

        console.log(
          `Mistral API response status for ${model}:`,
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log(
            `Mistral API success with ${model}, content length:`,
            data.choices?.[0]?.message?.content?.length || 0
          );

          const content = data.choices[0]?.message?.content || "";

          return NextResponse.json({
            content,
            usage: data.usage,
            model: model,
          });
        } else {
          const errorData = await response.text();
          console.error(`Mistral API Error for ${model}:`, errorData);
          lastError = { model, status: response.status, error: errorData };
        }
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError);
        lastError = { model, error: modelError };
      }
    }

    // If all models failed, provide a fallback response
    console.error("All Mistral models failed, last error:", lastError);

    // Fallback: Generate a basic blog structure
    const fallbackContent = generateFallbackContent(prompt, settings);

    return NextResponse.json({
      content: fallbackContent,
      usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
      model: "fallback",
      warning: "Using fallback content generation due to API issues",
    });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
