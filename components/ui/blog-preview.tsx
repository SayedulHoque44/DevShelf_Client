"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Eye,
  Code,
  Smartphone,
  Facebook,
  MessageCircle,
  Copy,
  Download,
  Share2,
  ExternalLink,
  Loader2,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BlogPreviewProps {
  content: string;
  title?: string;
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  // Dynamic parameters for social media formatting
  writingTone?: string;
  targetAudience?: string;
  contentType?: string;
  industry?: string;
  targetWordCount?: number;
}

export function BlogPreview({
  content,
  title = "Blog Post",
  onCopy,
  onDownload,
  onShare,
  writingTone = "professional",
  targetAudience = "general",
  contentType = "blog",
  industry = "technology",
  targetWordCount = 200,
}: BlogPreviewProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("editor");
  const [socialFormats, setSocialFormats] = useState<Record<string, string>>(
    {}
  );
  const [loadingFormats, setLoadingFormats] = useState<Record<string, boolean>>(
    {}
  );
  const [lastContentHash, setLastContentHash] = useState("");
  const [extractedTitle, setExtractedTitle] = useState(title);

  // Function to extract title from HTML content
  const extractTitleFromContent = useCallback(
    (htmlContent: string): string => {
      const h1Match = htmlContent.match(/<h1[^>]*>(.*?)<\/h1>/i);
      if (h1Match && h1Match[1]) {
        // Remove HTML tags from the title
        return h1Match[1].replace(/<[^>]*>/g, "").trim();
      }
      return title; // Fallback to prop title
    },
    [title]
  );
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({});

  // Generate content hash for change detection
  const generateContentHash = async (content: string) => {
    if (content.length === 0) return "0";

    try {
      // Use Web Crypto API for better Unicode support
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 16);
    } catch (error) {
      // Fallback to simple hash if Web Crypto API is not available
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        const char = content.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash).toString(36).slice(0, 16);
    }
  };

  // Check if content has changed and clear cached formats
  useEffect(() => {
    const checkContentChange = async () => {
      const currentHash = await generateContentHash(content);
      if (currentHash !== lastContentHash) {
        setLastContentHash(currentHash);
        setSocialFormats({}); // Clear cached formats when content changes
      }
    };

    checkContentChange();
  }, [content, lastContentHash]);

  // Update extracted title when content changes
  useEffect(() => {
    const newTitle = extractTitleFromContent(content);
    if (newTitle !== extractedTitle) {
      setExtractedTitle(newTitle);
      // Clear social formats when title changes to force regeneration
      setSocialFormats({});
      setLoadingFormats({});
    }
  }, [content, extractedTitle, extractTitleFromContent]);

  // Generate social media format using AI
  const generateSocialFormat = async (platform: string) => {
    if (socialFormats[platform]) {
      return socialFormats[platform];
    }

    setLoadingFormats((prev) => ({ ...prev, [platform]: true }));

    try {
      const response = await fetch("/api/generate-social-format", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          htmlContent: content,
          platform,
          title: extractedTitle,
          writingTone,
          targetAudience,
          contentType,
          industry,
          targetWordCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate ${platform} format`);
      }

      const data = await response.json();
      let formattedContent = data.content;

      // Post-process to remove any remaining asterisks and "Bold" prefixes for non-WhatsApp platforms
      if (platform !== "whatsapp") {
        formattedContent = formattedContent
          // Remove "Bold" prefixes that AI might add (ULTRA comprehensive)
          .replace(/𝗕𝗼𝗹𝗱\s+/g, "")
          .replace(/𝐁𝐨𝐥𝐝\s+/g, "")
          .replace(/Bold\s+/g, "")
          .replace(/BOLD\s+/g, "")
          .replace(/bold\s+/g, "")
          .replace(/Bold\s*/g, "")
          .replace(/𝗕𝗼𝗹𝗱\s*/g, "")
          .replace(/𝐁𝐨𝐥𝐝\s*/g, "")
          // More aggressive removal of "Bold" prefixes
          .replace(/\bBold\b\s*/g, "")
          .replace(/\b𝗕𝗼𝗹𝗱\b\s*/g, "")
          .replace(/\b𝐁𝐨𝐥𝐝\b\s*/g, "")
          .replace(/\bBOLD\b\s*/g, "")
          .replace(/\bbold\b\s*/g, "")
          // Even more aggressive - remove any "Bold" anywhere
          .replace(/Bold/g, "")
          .replace(/𝗕𝗼𝗹𝗱/g, "")
          .replace(/𝐁𝐨𝐥𝐝/g, "")
          .replace(/BOLD/g, "")
          .replace(/bold/g, "")
          // Remove problematic special characters
          .replace(/⬛+/g, "") // Remove black square characters
          .replace(/[⬛⬜▪️▫️]/g, "") // Remove other square characters
          // Clean up any double spaces that might be left
          .replace(/\s{2,}/g, " ")
          .replace(/\n\s+/g, "\n")
          // Add better structure and readability
          .replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2") // Add line breaks after sentences
          .replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2") // Add line breaks for proper sentences
          .replace(/(\w)\s*([🔹✅🚀🔍⚠️💡🧑‍⚕️🧑‍💻💊])/g, "$1\n$2") // Add line breaks before emojis
          .replace(/([🔹✅💡🧑‍⚕️🧑‍💻💊])\s*([A-Z])/g, "$1 $2") // Fix spacing after emojis
          .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
          // Convert double asterisks to plain text
          .replace(/\*\*(.*?)\*\*/g, "$1")
          // Convert single asterisks to plain text
          .replace(/\*(.*?)\*/g, "$1")
          .trim();
      }

      setSocialFormats((prev) => ({ ...prev, [platform]: formattedContent }));
      return formattedContent;
    } catch (error) {
      console.error(`Error generating ${platform} format:`, error);
      toast({
        title: "Generation Failed",
        description: `Failed to generate ${platform} format. Using fallback.`,
        variant: "destructive",
      });
      return convertToSocialMedia(content, platform);
    } finally {
      setLoadingFormats((prev) => ({ ...prev, [platform]: false }));
    }
  };

  // Handle tab change and generate format if needed
  const handleTabChange = async (tab: string) => {
    setActiveTab(tab);

    if (
      ["whatsapp", "facebook", "twitter", "linkedin", "instagram"].includes(tab)
    ) {
      if (!socialFormats[tab]) {
        await generateSocialFormat(tab);
      }
    }
  };

  // Convert HTML to different formats (fallback)
  const convertToSocialMedia = (html: string, platform: string) => {
    // Remove HTML tags and clean up text
    let text = html
      .replace(/<h[1-6][^>]*>/g, "\n\n")
      .replace(/<\/h[1-6]>/g, "\n")
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**") // Convert <strong> to **text**
      .replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*") // Convert <em> to *text*
      .replace(/<[^>]*>/g, "")
      .replace(/\n\s*\n/g, "\n\n")
      .replace(/\s{3,}/g, "\n\n") // Replace multiple spaces with double line breaks
      .replace(/\n{3,}/g, "\n\n") // Limit to max 2 consecutive line breaks
      .trim();

    // Platform-specific formatting
    switch (platform) {
      case "whatsapp":
        // WhatsApp supports markdown - convert to single asterisks
        text = text
          .replace(/\*\*(.*?)\*\*/g, "*$1*") // Convert double asterisks to single
          .replace(/\*(.*?)\*/g, "*$1*"); // Ensure single asterisks
        return `📝 *${title}*\n\n${text}\n\n#blog #content #ai`;

      case "facebook":
        // Facebook - clean formatting with proper spacing
        text = text
          .replace(/\*\*(.*?)\*\*/g, "$1") // Convert to plain text
          .replace(/\*(.*?)\*/g, "$1") // Convert single asterisks to plain text
          .replace(/\bBold\b\s*/g, "") // Remove "Bold" prefixes
          .replace(/\b𝗕𝗼𝗹𝗱\b\s*/g, "") // Remove Unicode "Bold" prefixes
          .replace(/Bold/g, "") // Remove any "Bold" anywhere
          .replace(/𝗕𝗼𝗹𝗱/g, "") // Remove any Unicode "Bold" anywhere
          .replace(/⬛+/g, "") // Remove black square characters
          .replace(/[⬛⬜▪️▫️]/g, "") // Remove other square characters
          .replace(/\s{2,}/g, " ") // Clean up double spaces
          .replace(/\n\s+/g, "\n") // Clean up line spacing
          // Improve paragraph structure
          .replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2") // Add line breaks after sentences
          .replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2") // Add line breaks for proper sentences
          .replace(/(\w)\s*([🔹✅🚀🔍⚠️💡🧑‍⚕️🧑‍💻💊])/g, "$1\n$2") // Add line breaks before emojis
          .replace(/([🔹✅💡🧑‍⚕️🧑‍💻💊])\s*([A-Z])/g, "$1 $2") // Fix spacing after emojis
          .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
          .trim();
        return `🚀 ${title}\n\n${text}\n\n#blog #content #ai #writing`;

      case "twitter":
        // Twitter - clean formatting with proper spacing
        text = text
          .replace(/\*\*(.*?)\*\*/g, "$1") // Convert to plain text
          .replace(/\*(.*?)\*/g, "$1") // Convert single asterisks to plain text
          .replace(/\bBold\b\s*/g, "") // Remove "Bold" prefixes
          .replace(/\b𝗕𝗼𝗹𝗱\b\s*/g, "") // Remove Unicode "Bold" prefixes
          .replace(/Bold/g, "") // Remove any "Bold" anywhere
          .replace(/𝗕𝗼𝗹𝗱/g, "") // Remove any Unicode "Bold" anywhere
          .replace(/⬛+/g, "") // Remove black square characters
          .replace(/[⬛⬜▪️▫️]/g, "") // Remove other square characters
          .replace(/\s{2,}/g, " ") // Clean up double spaces
          .replace(/\n\s+/g, "\n") // Clean up line spacing
          // Improve paragraph structure
          .replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2") // Add line breaks after sentences
          .replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2") // Add line breaks for proper sentences
          .replace(/(\w)\s*([🔹✅🚀🔍⚠️💡🧑‍⚕️🧑‍💻💊])/g, "$1\n$2") // Add line breaks before emojis
          .replace(/([🔹✅💡🧑‍⚕️🧑‍💻💊])\s*([A-Z])/g, "$1 $2") // Fix spacing after emojis
          .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
          .trim();
        const twitterText =
          text.length > 200 ? text.substring(0, 200) + "..." : text;
        return `🚀 ${title}\n\n${twitterText}\n\n#blog #content #ai`;

      case "linkedin":
        // LinkedIn - clean formatting with proper spacing
        text = text
          .replace(/\*\*(.*?)\*\*/g, "$1") // Convert to plain text
          .replace(/\*(.*?)\*/g, "$1") // Convert single asterisks to plain text
          .replace(/\bBold\b\s*/g, "") // Remove "Bold" prefixes
          .replace(/\b𝗕𝗼𝗹𝗱\b\s*/g, "") // Remove Unicode "Bold" prefixes
          .replace(/Bold/g, "") // Remove any "Bold" anywhere
          .replace(/𝗕𝗼𝗹𝗱/g, "") // Remove any Unicode "Bold" anywhere
          .replace(/⬛+/g, "") // Remove black square characters
          .replace(/[⬛⬜▪️▫️]/g, "") // Remove other square characters
          .replace(/\s{2,}/g, " ") // Clean up double spaces
          .replace(/\n\s+/g, "\n") // Clean up line spacing
          // Improve paragraph structure
          .replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2") // Add line breaks after sentences
          .replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2") // Add line breaks for proper sentences
          .replace(/(\w)\s*([🔹✅🚀🔍⚠️💡🧑‍⚕️🧑‍💻💊])/g, "$1\n$2") // Add line breaks before emojis
          .replace(/([🔹✅💡🧑‍⚕️🧑‍💻💊])\s*([A-Z])/g, "$1 $2") // Fix spacing after emojis
          .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
          .trim();
        return `🚀 ${title}\n\n${text}\n\n#blog #content #ai #professional`;

      case "instagram":
        // Instagram - clean formatting with proper spacing
        text = text
          .replace(/\*\*(.*?)\*\*/g, "$1") // Convert to plain text
          .replace(/\*(.*?)\*/g, "$1") // Convert single asterisks to plain text
          .replace(/\bBold\b\s*/g, "") // Remove "Bold" prefixes
          .replace(/\b𝐁𝐨𝐥𝐝\b\s*/g, "") // Remove Unicode "Bold" prefixes
          .replace(/Bold/g, "") // Remove any "Bold" anywhere
          .replace(/𝐁𝐨𝐥𝐝/g, "") // Remove any Unicode "Bold" anywhere
          .replace(/⬛+/g, "") // Remove black square characters
          .replace(/[⬛⬜▪️▫️]/g, "") // Remove other square characters
          .replace(/\s{2,}/g, " ") // Clean up double spaces
          .replace(/\n\s+/g, "\n") // Clean up line spacing
          // Improve paragraph structure
          .replace(/([.!?])\s*([A-Z])/g, "$1\n\n$2") // Add line breaks after sentences
          .replace(/([.!?])\s*([A-Z][a-z])/g, "$1\n\n$2") // Add line breaks for proper sentences
          .replace(/(\w)\s*([🔹✅🚀🔍⚠️💡🧑‍⚕️🧑‍💻💊])/g, "$1\n$2") // Add line breaks before emojis
          .replace(/([🔹✅💡🧑‍⚕️🧑‍💻💊])\s*([A-Z])/g, "$1 $2") // Fix spacing after emojis
          .replace(/\n{3,}/g, "\n\n") // Limit consecutive line breaks
          .trim();
        return `🚀 ${extractedTitle}\n\n${text}\n\n#blog #content #ai #writing #social`;

      default:
        return text;
    }
  };

  const convertToMarkdown = (html: string) => {
    return html
      .replace(/<h1[^>]*>(.*?)<\/h1>/g, "# $1\n")
      .replace(/<h2[^>]*>(.*?)<\/h2>/g, "## $1\n")
      .replace(/<h3[^>]*>(.*?)<\/h3>/g, "### $1\n")
      .replace(/<h4[^>]*>(.*?)<\/h4>/g, "#### $1\n")
      .replace(/<h5[^>]*>(.*?)<\/h5>/g, "##### $1\n")
      .replace(/<h6[^>]*>(.*?)<\/h6>/g, "###### $1\n")
      .replace(/<p[^>]*>(.*?)<\/p>/g, "$1\n\n")
      .replace(/<br\s*\/?>/g, "\n")
      .replace(/<strong[^>]*>(.*?)<\/strong>/g, "**$1**")
      .replace(/<b[^>]*>(.*?)<\/b>/g, "**$1**")
      .replace(/<em[^>]*>(.*?)<\/em>/g, "*$1*")
      .replace(/<i[^>]*>(.*?)<\/i>/g, "*$1*")
      .replace(/<u[^>]*>(.*?)<\/u>/g, "<u>$1</u>")
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/g, "[$2]($1)")
      .replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*>/g, "![$2]($1)")
      .replace(/<ul[^>]*>([\s\S]*?)<\/ul>/g, (match, content) => {
        return content
          .replace(/<li[^>]*>(.*?)<\/li>/g, "- $1\n")
          .replace(/\n$/, "");
      })
      .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/g, (match, content) => {
        let counter = 1;
        return content
          .replace(/<li[^>]*>(.*?)<\/li>/g, () => `${counter++}. $1\n`)
          .replace(/\n$/, "");
      })
      .replace(/<blockquote[^>]*>(.*?)<\/blockquote>/g, "> $1\n")
      .replace(/<code[^>]*>(.*?)<\/code>/g, "`$1`")
      .replace(/<pre[^>]*>(.*?)<\/pre>/g, "```\n$1\n```")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .trim();
  };

  const handleCopy = async (
    text: string,
    format: string,
    platform?: string
  ) => {
    try {
      await navigator.clipboard.writeText(text);

      // Set copied state for visual feedback
      if (platform) {
        setCopiedStates((prev) => ({ ...prev, [platform]: true }));
        // Reset after 2 seconds
        setTimeout(() => {
          setCopiedStates((prev) => ({ ...prev, [platform]: false }));
        }, 2000);
      }

      toast({
        title: "Copied!",
        description: `${format} content copied to clipboard.`,
      });
      onCopy?.();
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy Failed",
        description: "Unable to copy to clipboard. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownload = (text: string, format: string, extension: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onDownload?.();
  };

  const generateEmbedCode = () => {
    const embedCode = `<!-- AI Blog Writer Embed Code -->
<div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
  <div style="border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 700; line-height: 1.2;">${title}</h1>
  </div>
  <div style="background: #f8fafc; padding: 25px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
    ${content}
  </div>
  <div style="margin-top: 20px; padding: 15px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); border-radius: 8px; font-size: 14px; color: #64748b; text-align: center;">
    <strong style="color: #1e293b;">🤖 Generated by AI Blog Writer</strong><br>
    <span style="font-size: 12px;">Create your own content at <a href="${
      typeof window !== "undefined"
        ? window.location.origin
        : "https://toolhub.ai"
    }" style="color: #2563eb; text-decoration: none; font-weight: 600;">ToolHub</a></span>
  </div>
</div>
<!-- End AI Blog Writer Embed Code -->`;
    return embedCode;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Blog Preview
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(content, "HTML", "html")}
              className={
                copiedStates.html ? "bg-green-100 border-green-300" : ""
              }
            >
              {copiedStates.html ? (
                <Check className="w-4 h-4 mr-1 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {copiedStates.html ? "Copied!" : "Copy HTML"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(content, "HTML", "html")}
            >
              <Download className="w-4 h-4 mr-1" />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopy(generateEmbedCode(), "Embed Code", "embed")
              }
              className={
                copiedStates.embed ? "bg-green-100 border-green-300" : ""
              }
            >
              {copiedStates.embed ? (
                <Check className="w-4 h-4 mr-1 text-green-600" />
              ) : (
                <Share2 className="w-4 h-4 mr-1" />
              )}
              {copiedStates.embed ? "Copied!" : "Embed"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="html" className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              HTML
            </TabsTrigger>
            <TabsTrigger value="markdown" className="flex items-center gap-1">
              <Code className="w-4 h-4" />
              Markdown
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="facebook" className="flex items-center gap-1">
              <Facebook className="w-4 h-4" />
              Facebook
            </TabsTrigger>
            <TabsTrigger value="twitter" className="flex items-center gap-1">
              <Smartphone className="w-4 h-4" />
              Twitter
            </TabsTrigger>
            <TabsTrigger value="linkedin" className="flex items-center gap-1">
              <ExternalLink className="w-4 h-4" />
              LinkedIn
            </TabsTrigger>
            <TabsTrigger value="instagram" className="flex items-center gap-1">
              <Share2 className="w-4 h-4" />
              Instagram
            </TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="mt-4">
            <div className="border rounded-lg p-4 bg-white">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </TabsContent>

          <TabsContent value="html" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(content, "HTML", "html-tab")}
                  className={
                    copiedStates["html-tab"]
                      ? "bg-green-100 border-green-300"
                      : ""
                  }
                >
                  {copiedStates["html-tab"] ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copiedStates["html-tab"] ? "Copied!" : "Copy HTML"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(content, "HTML", "html")}
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{content}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="markdown" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      convertToMarkdown(content),
                      "Markdown",
                      "markdown"
                    )
                  }
                  className={
                    copiedStates.markdown ? "bg-green-100 border-green-300" : ""
                  }
                >
                  {copiedStates.markdown ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copiedStates.markdown ? "Copied!" : "Copy Markdown"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(convertToMarkdown(content), "Markdown", "md")
                  }
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
              <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{convertToMarkdown(content)}</code>
              </pre>
            </div>
          </TabsContent>

          <TabsContent value="embed" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(generateEmbedCode(), "Embed Code", "embed-tab")
                  }
                  className={
                    copiedStates["embed-tab"]
                      ? "bg-green-100 border-green-300"
                      : ""
                  }
                >
                  {copiedStates["embed-tab"] ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {copiedStates["embed-tab"] ? "Copied!" : "Copy Embed Code"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDownload(generateEmbedCode(), "Embed Code", "html")
                  }
                >
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Preview:</h3>
                  <div className="border rounded-lg p-4 bg-white">
                    <div
                      dangerouslySetInnerHTML={{ __html: generateEmbedCode() }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Embed Code:</h3>
                  <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{generateEmbedCode()}</code>
                  </pre>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="whatsapp" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      socialFormats.whatsapp ||
                        convertToSocialMedia(content, "whatsapp"),
                      "WhatsApp",
                      "whatsapp"
                    )
                  }
                  disabled={loadingFormats.whatsapp}
                  className={
                    copiedStates.whatsapp ? "bg-green-100 border-green-300" : ""
                  }
                >
                  {loadingFormats.whatsapp ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : copiedStates.whatsapp ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {loadingFormats.whatsapp
                    ? "Generating..."
                    : copiedStates.whatsapp
                    ? "Copied!"
                    : "Copy for WhatsApp"}
                </Button>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {loadingFormats.whatsapp ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Generating WhatsApp format...</span>
                    </div>
                  ) : (
                    socialFormats.whatsapp ||
                    convertToSocialMedia(content, "whatsapp")
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="facebook" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      socialFormats.facebook ||
                        convertToSocialMedia(content, "facebook"),
                      "Facebook",
                      "facebook"
                    )
                  }
                  disabled={loadingFormats.facebook}
                  className={
                    copiedStates.facebook ? "bg-green-100 border-green-300" : ""
                  }
                >
                  {loadingFormats.facebook ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : copiedStates.facebook ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {loadingFormats.facebook
                    ? "Generating..."
                    : copiedStates.facebook
                    ? "Copied!"
                    : "Copy for Facebook"}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {loadingFormats.facebook ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Generating Facebook format...</span>
                    </div>
                  ) : (
                    socialFormats.facebook ||
                    convertToSocialMedia(content, "facebook")
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="twitter" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      socialFormats.twitter ||
                        convertToSocialMedia(content, "twitter"),
                      "Twitter",
                      "twitter"
                    )
                  }
                  disabled={loadingFormats.twitter}
                  className={
                    copiedStates.twitter ? "bg-green-100 border-green-300" : ""
                  }
                >
                  {loadingFormats.twitter ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : copiedStates.twitter ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {loadingFormats.twitter
                    ? "Generating..."
                    : copiedStates.twitter
                    ? "Copied!"
                    : "Copy for Twitter"}
                </Button>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {loadingFormats.twitter ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Generating Twitter format...</span>
                    </div>
                  ) : (
                    socialFormats.twitter ||
                    convertToSocialMedia(content, "twitter")
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="linkedin" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      socialFormats.linkedin ||
                        convertToSocialMedia(content, "linkedin"),
                      "LinkedIn",
                      "linkedin"
                    )
                  }
                  disabled={loadingFormats.linkedin}
                  className={
                    copiedStates.linkedin ? "bg-green-100 border-green-300" : ""
                  }
                >
                  {loadingFormats.linkedin ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : copiedStates.linkedin ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {loadingFormats.linkedin
                    ? "Generating..."
                    : copiedStates.linkedin
                    ? "Copied!"
                    : "Copy for LinkedIn"}
                </Button>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {loadingFormats.linkedin ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Generating LinkedIn format...</span>
                    </div>
                  ) : (
                    socialFormats.linkedin ||
                    convertToSocialMedia(content, "linkedin")
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="instagram" className="mt-4">
            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleCopy(
                      socialFormats.instagram ||
                        convertToSocialMedia(content, "instagram"),
                      "Instagram",
                      "instagram"
                    )
                  }
                  disabled={loadingFormats.instagram}
                  className={
                    copiedStates.instagram
                      ? "bg-green-100 border-green-300"
                      : ""
                  }
                >
                  {loadingFormats.instagram ? (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  ) : copiedStates.instagram ? (
                    <Check className="w-4 h-4 mr-1 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4 mr-1" />
                  )}
                  {loadingFormats.instagram
                    ? "Generating..."
                    : copiedStates.instagram
                    ? "Copied!"
                    : "Copy for Instagram"}
                </Button>
              </div>
              <div className="bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="whitespace-pre-wrap text-sm">
                  {loadingFormats.instagram ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin mr-2" />
                      <span>Generating Instagram format...</span>
                    </div>
                  ) : (
                    socialFormats.instagram ||
                    convertToSocialMedia(content, "instagram")
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
