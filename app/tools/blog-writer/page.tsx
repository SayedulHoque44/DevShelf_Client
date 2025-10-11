"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  PenTool,
  Brain,
  Download,
  Copy,
  RefreshCw,
  Eye,
  Lightbulb,
  Save,
  TrendingUp,
  AlertCircle,
  Hash,
  Share2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { SimpleRichEditor } from "@/components/ui/simple-rich-editor";
import { BlogPreview } from "@/components/ui/blog-preview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BlogData {
  topic: string;
  tone: string;
  audience: string;
  wordCount: number[];
  keywords: string[];
  contentType: string;
  industry: string;
  callToAction: string;
  includeSEO: boolean;
  includeImages: boolean;
}

interface BlogStats {
  wordCount: number;
  readingTime: number;
  readabilityScore: number;
  seoScore: number;
  keywordDensity: number;
}

// Removed ContentTemplate interface - using Mistral AI instead

export default function BlogWriter() {
  const { toast } = useToast();

  const [blogData, setBlogData] = useState<BlogData>({
    topic: "The Future of Artificial Intelligence in Healthcare",
    tone: "Professional",
    audience: "Business Professionals",
    wordCount: [800],
    keywords: ["AI", "Healthcare", "Technology", "Innovation"],
    contentType: "How-to Guide",
    industry: "Technology",
    callToAction: "Learn more about AI in healthcare today!",
    includeSEO: true,
    includeImages: true,
  });

  const [generatedBlog, setGeneratedBlog] = useState("");
  const [editedBlog, setEditedBlog] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [blogStats, setBlogStats] = useState<BlogStats | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<"editor" | "preview">("editor");

  const tones = [
    "Professional",
    "Conversational",
    "Friendly",
    "Authoritative",
    "Casual",
    "Educational",
    "Persuasive",
  ];

  const audiences = [
    "General Public",
    "Business Professionals",
    "Students",
    "Entrepreneurs",
    "Technical Experts",
    "Beginners",
    "Industry Specialists",
    "Consumers",
  ];

  const contentTypes = [
    "How-to Guide",
    "List Article",
    "Opinion Piece",
    "Case Study",
    "Tutorial",
    "Review",
    "News Article",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Education",
    "Marketing",
    "E-commerce",
    "Travel",
    "Real Estate",
  ];

  const calculateBlogStats = (
    content: string,
    keywords: string[]
  ): BlogStats => {
    const words = content.split(/\s+/).filter((word) => word.length > 0);
    const wordCount = words.length;
    const readingTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute

    // Calculate readability score (simplified Flesch Reading Ease)
    const sentences = content
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0);
    const avgWordsPerSentence = wordCount / sentences.length;
    const syllables = words.reduce(
      (total, word) => total + countSyllables(word),
      0
    );
    const avgSyllablesPerWord = syllables / wordCount;
    const readabilityScore = Math.max(
      0,
      Math.min(
        100,
        206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
      )
    );

    // Calculate SEO score based on keyword density and content structure
    const keywordDensity =
      keywords.length > 0
        ? (keywords.reduce((total, keyword) => {
            const regex = new RegExp(keyword.toLowerCase(), "gi");
            const matches = content.match(regex);
            return total + (matches ? matches.length : 0);
          }, 0) /
            wordCount) *
          100
        : 0;

    const hasTitle = content.includes("# ");
    const hasHeadings = (content.match(/^## /gm) || []).length > 0;
    const hasIntro = content.toLowerCase().includes("introduction");
    const hasConclusion = content.toLowerCase().includes("conclusion");
    const seoScore = Math.min(
      100,
      (hasTitle ? 20 : 0) +
        (hasHeadings ? 20 : 0) +
        (hasIntro ? 15 : 0) +
        (hasConclusion ? 15 : 0) +
        Math.min(30, keywordDensity * 10)
    );

    return {
      wordCount,
      readingTime,
      readabilityScore: Math.round(readabilityScore),
      seoScore: Math.round(seoScore),
      keywordDensity: Math.round(keywordDensity * 100) / 100,
    };
  };

  const countSyllables = (word: string): number => {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const generateBlog = async () => {
    if (!blogData.topic || !blogData.tone || !blogData.audience) {
      setError("Please fill in all required fields");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 200);

      // Generate prompt for Mistral AI
      const prompt = buildMistralPrompt(blogData);

      // Call Mistral AI API
      const response = await fetch("/api/generate-blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt, settings: blogData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate blog content");
      }

      const data = await response.json();

      if (data.error) {
        console.error("API Error Response:", data);
        throw new Error(data.error + (data.details ? `: ${data.details}` : ""));
      }

      let blog = data.content;

      if (!blog) {
        throw new Error("No content generated");
      }

      // Post-process to enforce word count if needed
      const currentWordCount = blog
        .split(/\s+/)
        .filter((word: string) => word.length > 0).length;
      const targetWordCount = blogData.wordCount[0];

      if (currentWordCount > targetWordCount) {
        console.log(
          `Word count exceeded: ${currentWordCount} > ${targetWordCount}. Trimming content...`
        );

        // Split content into words and trim to target count
        const words = blog.split(/\s+/);
        const trimmedWords = words.slice(0, targetWordCount);
        blog = trimmedWords.join(" ");

        // Try to end at a complete sentence
        const lastSentenceEnd = Math.max(
          blog.lastIndexOf("."),
          blog.lastIndexOf("!"),
          blog.lastIndexOf("?")
        );

        if (lastSentenceEnd > targetWordCount * 0.8) {
          // If we can end at a sentence within 80% of target
          blog = blog.substring(0, lastSentenceEnd + 1);
        }

        console.log(
          `Trimmed to ${
            blog.split(/\s+/).filter((word: string) => word.length > 0).length
          } words`
        );
      }

      setGeneratedBlog(blog);
      setEditedBlog(blog); // Initialize edited content with generated content
      setGenerationProgress(100);

      // Calculate blog statistics
      const stats = calculateBlogStats(blog, blogData.keywords);
      setBlogStats(stats);

      toast({
        title: "Blog Generated Successfully!",
        description: `Your ${blogData.wordCount[0]}-word blog post is ready.`,
      });
    } catch (err) {
      console.error("Generation Error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to generate blog post. Please try again.";
      setError(errorMessage);
      toast({
        title: "Generation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const buildMistralPrompt = (data: BlogData): string => {
    const keywordString =
      data.keywords.length > 0 ? data.keywords.join(", ") : "";
    const targetWords = data.wordCount[0];

    let prompt = `Write a blog post about "${data.topic}" for ${data.audience} in a ${data.tone} tone.

CRITICAL REQUIREMENT: The blog post must be EXACTLY ${targetWords} words. Do not exceed this limit. Count your words carefully and ensure the final content is precisely ${targetWords} words.`;

    if (data.contentType) {
      prompt += ` The content should be formatted as a ${data.contentType}.`;
    }

    if (data.industry) {
      prompt += ` Focus on the ${data.industry} industry context.`;
    }

    if (keywordString) {
      prompt += ` Include these keywords naturally: ${keywordString}.`;
    }

    if (data.callToAction) {
      prompt += ` End with this call to action: "${data.callToAction}".`;
    }

    if (data.includeSEO) {
      prompt += ` Include SEO-optimized title, meta description, and proper heading structure.`;
    }

    if (data.includeImages) {
      prompt += ` Include placeholder text for relevant images with descriptive alt text.`;
    }

    prompt += `\n\nIMPORTANT: Format the response as clean, well-structured HTML with proper semantic tags and modern styling. Use:

    STRUCTURE:
    - <h1> for main title (with class="text-3xl font-bold mb-6")
    - <h2> for major sections (with class="text-2xl font-semibold mb-4 mt-8")
    - <h3> for subsections (with class="text-xl font-semibold mb-3 mt-6")
    - <p> for paragraphs (with class="mb-4 leading-relaxed")
    - <ul> and <li> for bullet lists (with class="mb-4 space-y-2")
    - <ol> and <li> for numbered lists (with class="mb-4 space-y-2")
    
    FORMATTING:
    - <strong> for bold text (with class="font-semibold")
    - <em> for italic text (with class="italic")
    - <blockquote> for quotes (with class="border-l-4 border-border pl-4 italic my-4")
    - <a href="url"> for links (with class="text-primary hover:text-blue-800 underline")
    - <img src="url" alt="description"> for images (with class="max-w-full h-auto rounded-lg my-4")
    - <hr> for horizontal rules (with class="my-8 border-border")
    - <br> for line breaks where needed
    
    LAYOUT:
    - Wrap everything in <div class="max-w-4xl mx-auto p-6">
    - Use proper spacing and typography
    - Make it responsive and modern
    - Include proper semantic structure
    
    WORD COUNT ENFORCEMENT:
    - The blog post must be EXACTLY ${targetWords} words
    - Count words as you write and stop at ${targetWords} words
    - Do not exceed the word limit under any circumstances
    - Prioritize quality over quantity within the ${targetWords} word limit
    - If you need to cut content to meet the word limit, do so while maintaining coherence
    
    FINAL REMINDER: The total word count must be exactly ${targetWords} words. No more, no less.
    
    Make the HTML clean, semantic, modern, and ready for web display. Do not include any markdown syntax.`;

    return prompt;
  };

  // Removed all static content generation functions - now using Mistral AI

  const addKeyword = () => {
    if (newKeyword.trim() && !blogData.keywords.includes(newKeyword.trim())) {
      setBlogData((prev) => ({
        ...prev,
        keywords: [...prev.keywords, newKeyword.trim()],
      }));
      setNewKeyword("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setBlogData((prev) => ({
      ...prev,
      keywords: prev.keywords.filter((k) => k !== keyword),
    }));
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedBlog || generatedBlog);
      toast({
        title: "Copied to Clipboard!",
        description: "Blog content has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const downloadBlog = () => {
    const content = editedBlog || generatedBlog;
    const element = document.createElement("a");
    const file = new Blob([content], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${blogData.topic || "blog-post"}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast({
      title: "Download Started!",
      description: "Your blog post is being downloaded.",
    });
  };

  const saveBlog = () => {
    // Save functionality can be implemented later with local storage or database
    toast({
      title: "Blog Saved!",
      description: "Your blog post has been saved to your collection.",
    });
  };

  const resetForm = () => {
    setBlogData({
      topic: "The Future of Artificial Intelligence in Healthcare",
      tone: "Professional",
      audience: "Business Professionals",
      wordCount: [800],
      keywords: ["AI", "Healthcare", "Technology", "Innovation"],
      contentType: "How-to Guide",
      industry: "Technology",
      callToAction: "Learn more about AI in healthcare today!",
      includeSEO: true,
      includeImages: true,
    });
    setGeneratedBlog("");
    setEditedBlog("");
    setShowPreview(false);
    setBlogStats(null);
    setError(null);
    setActiveView("editor");
  };

  const updateField = (field: keyof BlogData, value: any) => {
    setBlogData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return blogData.topic && blogData.tone && blogData.audience;
  };

  console.log(blogData);

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <PenTool className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                AI Blog Writer
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="space-y-6 xl:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  <span>Blog Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your blog post parameters for AI generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topic">Blog Topic *</Label>
                    <Input
                      id="topic"
                      value={blogData.topic}
                      onChange={(e) => updateField("topic", e.target.value)}
                      placeholder="Enter your blog topic here..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Writing Tone *</Label>
                      <Select
                        value={blogData.tone}
                        onValueChange={(value) => updateField("tone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone} value={tone}>
                              {tone}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Target Audience *</Label>
                      <Select
                        value={blogData.audience}
                        onValueChange={(value) =>
                          updateField("audience", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences.map((audience) => (
                            <SelectItem key={audience} value={audience}>
                              {audience}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Content Type</Label>
                      <Select
                        value={blogData.contentType}
                        onValueChange={(value) =>
                          updateField("contentType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select content type" />
                        </SelectTrigger>
                        <SelectContent>
                          {contentTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select
                        value={blogData.industry}
                        onValueChange={(value) =>
                          updateField("industry", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((industry) => (
                            <SelectItem key={industry} value={industry}>
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Word Count */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      Target Word Count: {blogData.wordCount[0]} words
                    </Label>
                    <Slider
                      value={blogData.wordCount}
                      onValueChange={(value) => updateField("wordCount", value)}
                      max={3000}
                      min={300}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>300 words</span>
                      <span>3000 words</span>
                    </div>
                  </div>
                </div>

                {/* Keywords */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>SEO Keywords</Label>
                    <div className="flex space-x-2">
                      <Input
                        value={newKeyword}
                        onChange={(e) => setNewKeyword(e.target.value)}
                        placeholder="Add keyword..."
                        onKeyPress={(e) => e.key === "Enter" && addKeyword()}
                      />
                      <Button onClick={addKeyword} size="sm">
                        <Hash className="w-4 h-4" />
                      </Button>
                    </div>
                    {blogData.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {blogData.keywords.map((keyword) => (
                          <div
                            key={keyword}
                            className="flex items-center space-x-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm"
                          >
                            <span>{keyword}</span>
                            <button
                              onClick={() => removeKeyword(keyword)}
                              className="text-primary hover:text-green-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Settings */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Call to Action</Label>
                    <Textarea
                      value={blogData.callToAction}
                      onChange={(e) =>
                        updateField("callToAction", e.target.value)
                      }
                      placeholder="Enter your desired call to action (optional)"
                      rows={2}
                    />
                  </div>
                </div>

                {/* Blog Options */}
                <div className="space-y-4">
                  <Label>Blog Options</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="seo"
                        checked={blogData.includeSEO}
                        onCheckedChange={(checked) =>
                          updateField("includeSEO", checked)
                        }
                      />
                      <Label htmlFor="seo" className="text-sm">
                        Include SEO Metadata
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="images"
                        checked={blogData.includeImages}
                        onCheckedChange={(checked) =>
                          updateField("includeImages", checked)
                        }
                      />
                      <Label htmlFor="images" className="text-sm">
                        Include Image Placeholders
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex space-x-3">
                  <Button
                    onClick={generateBlog}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={isGenerating || !isFormValid()}
                    size="lg"
                  >
                    {isGenerating ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? "Writing Blog..." : "Generate Blog Post"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>

                {isGenerating && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Generating your blog post...</span>
                      <span>{Math.round(generationProgress)}%</span>
                    </div>
                    <Progress value={generationProgress} className="w-full" />
                    <div className="text-xs text-muted-foreground text-center">
                      AI is crafting engaging content tailored to your
                      specifications
                    </div>
                  </div>
                )}

                {!isFormValid() && !isGenerating && (
                  <Alert>
                    <PenTool className="h-4 w-4" />
                    <AlertDescription>
                      Please fill in the required fields: Blog Topic, Writing
                      Tone, and Target Audience.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Editor and Preview Section */}
          <div className="space-y-6 xl:col-span-2">
            {generatedBlog && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <PenTool className="w-5 h-5 text-primary" />
                      <span>Blog Editor & Preview</span>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant={
                          activeView === "editor" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveView("editor")}
                      >
                        <PenTool className="w-4 h-4 mr-1" />
                        Editor
                      </Button>
                      <Button
                        variant={
                          activeView === "preview" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setActiveView("preview")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {activeView === "editor" ? (
                    <SimpleRichEditor
                      content={editedBlog || generatedBlog}
                      onChange={setEditedBlog}
                      placeholder="Start editing your blog post..."
                      className="min-h-[500px]"
                    />
                  ) : (
                    <BlogPreview
                      content={editedBlog || generatedBlog}
                      title={blogData.topic}
                      onCopy={copyToClipboard}
                      onDownload={downloadBlog}
                      writingTone={blogData.tone}
                      targetAudience={blogData.audience}
                      contentType={blogData.contentType}
                      industry={blogData.industry}
                      targetWordCount={blogData.wordCount[0]}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {!generatedBlog && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PenTool className="w-5 h-5 text-primary" />
                    <span>Generated Blog Post</span>
                  </CardTitle>
                  <CardDescription>
                    {isGenerating
                      ? "AI is generating your blog post..."
                      : "Blog post will appear here after generation"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isGenerating ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center space-y-4">
                        <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-muted-foreground">
                          AI is writing your blog post...
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Creating engaging content tailored to your
                          specifications
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <PenTool className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p>
                        Configure your blog and click &quot;Generate Blog
                        Post&quot; to get started
                      </p>
                      <p className="text-sm">
                        AI will create engaging, SEO-optimized content based on
                        your inputs
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Blog Statistics */}
            {blogStats && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span>Blog Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          calculateBlogStats(
                            editedBlog || generatedBlog,
                            blogData.keywords
                          ).wordCount
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          calculateBlogStats(
                            editedBlog || generatedBlog,
                            blogData.keywords
                          ).readingTime
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Min Read
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          calculateBlogStats(
                            editedBlog || generatedBlog,
                            blogData.keywords
                          ).readabilityScore
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Readability
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {
                          calculateBlogStats(
                            editedBlog || generatedBlog,
                            blogData.keywords
                          ).seoScore
                        }
                      </div>
                      <div className="text-xs text-muted-foreground">
                        SEO Score
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span>Keyword Density</span>
                      <span className="font-medium">
                        {
                          calculateBlogStats(
                            editedBlog || generatedBlog,
                            blogData.keywords
                          ).keywordDensity
                        }
                        %
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="w-full bg-accent rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${Math.min(
                              calculateBlogStats(
                                editedBlog || generatedBlog,
                                blogData.keywords
                              ).keywordDensity * 10,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Enhanced Blog Writer Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        AI-Powered Writing
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Advanced AI creates engaging, original content
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <PenTool className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Rich Text Editor
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Edit AI content with full formatting capabilities
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Multiple Preview Modes
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Editor, HTML, Markdown, and Social Media views
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Share2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Social Media Ready
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Format content for WhatsApp, Facebook, Twitter
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Embedding Support
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Generate embed codes for your content
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Hash className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">SEO Optimized</h4>
                      <p className="text-xs text-muted-foreground">
                        Built-in SEO best practices and keyword integration
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
