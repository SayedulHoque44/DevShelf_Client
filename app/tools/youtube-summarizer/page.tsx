"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Brain,
  Download,
  Copy,
  RefreshCw,
  Eye,
  Clock,
  User,
  Calendar,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  FileText,
  Zap,
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface YouTubeData {
  title: string;
  description: string;
  duration: string;
  channel: string;
  uploadDate: string;
  viewCount: string;
  likeCount: string;
  thumbnail: string;
}

interface SummaryData {
  summaryType: string;
  summaryLength: string;
  includeKeyPoints: boolean;
  includeTimestamps: boolean;
  includeActionItems: boolean;
  language: string;
}

interface GeneratedSummary {
  summary: string;
  keyPoints: string[];
  actionItems: string[];
  timestamps: { time: string; content: string }[];
  metadata: {
    originalDuration: string;
    summaryLength: string;
    reductionPercentage: number;
    language: string;
    generatedAt: string;
  };
}

export default function YouTubeSummarizer() {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubeData, setYoutubeData] = useState<YouTubeData | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [summaryData, setSummaryData] = useState<SummaryData>({
    summaryType: "comprehensive",
    summaryLength: "medium",
    includeKeyPoints: true,
    includeTimestamps: true,
    includeActionItems: true,
    language: "english",
  });
  const [generatedSummary, setGeneratedSummary] =
    useState<GeneratedSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const summaryTypes = [
    {
      value: "comprehensive",
      label: "Comprehensive Summary",
      description: "Detailed overview with all key information",
    },
    {
      value: "bullet",
      label: "Bullet Points",
      description: "Key points in bullet format",
    },
    {
      value: "executive",
      label: "Executive Summary",
      description: "High-level overview for quick understanding",
    },
    {
      value: "transcript",
      label: "Full Transcript",
      description: "Complete transcript with timestamps",
    },
  ];

  const summaryLengths = [
    { value: "short", label: "Short (2-3 minutes)" },
    { value: "medium", label: "Medium (5-7 minutes)" },
    { value: "long", label: "Long (10+ minutes)" },
  ];

  const languages = [
    { value: "english", label: "English" },
    { value: "spanish", label: "Spanish" },
    { value: "french", label: "French" },
    { value: "german", label: "German" },
    { value: "portuguese", label: "Portuguese" },
    { value: "italian", label: "Italian" },
    { value: "chinese", label: "Chinese" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "arabic", label: "Arabic" },
  ];

  const extractVideoId = (url: string): string | null => {
    const regex =
      /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const validateYouTubeUrl = (url: string): boolean => {
    const videoId = extractVideoId(url);
    return videoId !== null;
  };

  const extractVideoData = async () => {
    if (!youtubeUrl.trim()) {
      setError("Please enter a YouTube URL");
      return;
    }

    if (!validateYouTubeUrl(youtubeUrl)) {
      setError("Please enter a valid YouTube URL");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Mock video data extraction
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockVideoData: YouTubeData = {
        title: "How to Build a Successful SaaS Business in 2024",
        description:
          "Learn the essential strategies and tactics for building a successful Software as a Service business in today's competitive market. This comprehensive guide covers everything from idea validation to scaling your business.",
        duration: "15:42",
        channel: "Tech Entrepreneurs",
        uploadDate: "2024-01-15",
        viewCount: "125,000",
        likeCount: "8,500",
        thumbnail: `https://img.youtube.com/vi/${extractVideoId(
          youtubeUrl
        )}/maxresdefault.jpg`,
      };

      setYoutubeData(mockVideoData);
      setProgress(100);
      clearInterval(progressInterval);

      toast({
        title: "Video Data Extracted",
        description: "Successfully extracted video information",
      });
    } catch (error) {
      setError("Failed to extract video data. Please try again.");
      console.error("Video extraction error:", error);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleExtract = async () => {
    setProgress(0);
    setError(null);
    setIsExtracting(true);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch("/api/retrive-yt-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtubeUrl }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (!data.success) {
        setError(data.error);
        setProgress(data.progress || 0);
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
        return;
      }

      const scriptText = data.scriptText;
      console.log("Transcript length:", scriptText?.length || 0);
      console.log("Transcript preview:", scriptText?.slice(0, 500));
      console.log("Video ID:", data.videoId);
      console.log("Transcript segments:", data.transcriptLength);

      if (!scriptText || scriptText.trim().length === 0) {
        setError("No transcript content found");
        setProgress(0);
        toast({
          title: "Error",
          description: "No transcript content found for this video",
          variant: "destructive",
        });
        return;
      }

      // Store the transcript for later use
      setTranscript(scriptText);
      setProgress(100);

      toast({
        title: "Transcript Retrieved",
        description: `Successfully retrieved ${data.transcriptLength} transcript segments`,
      });

      // Automatically proceed to generate summary if transcript is found
      setTimeout(() => {
        generateSummary();
      }, 1000);
    } catch (error) {
      console.error("Error in handleExtract:", error);
      setError("Failed to fetch transcript");
      setProgress(0);
      toast({
        title: "Error",
        description: "Failed to fetch transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const generateSummary = async () => {
    if (!transcript || transcript.trim().length === 0) {
      setError("No transcript available. Please extract video data first.");
      toast({
        title: "Error",
        description:
          "No transcript available. Please extract video data first.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progress for AI processing
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      const response = await fetch("/api/generate-youtube-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          youtubeUrl,
          youtubeData,
          transcript, // Pass the actual transcript data
          summaryData,
        }),
      });

      const result = await response.json();
      console.log(result, "result of generate summary");

      clearInterval(progressInterval);

      if (result.success) {
        setGeneratedSummary(result.summary);
        setProgress(100);

        toast({
          title: "Summary Generated",
          description: "YouTube video summary created successfully",
        });
      } else {
        setError(result.error || "Failed to generate summary");
        setProgress(0);
        toast({
          title: "Error",
          description: result.error || "Failed to generate summary",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("Failed to generate summary. Please try again.");
      setProgress(0);
      console.error("Summary generation error:", error);
      toast({
        title: "Error",
        description: "Failed to generate summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copySummary = async () => {
    if (!generatedSummary) return;

    const fullSummary = `
${generatedSummary.summary}

${
  summaryData.includeKeyPoints && generatedSummary.keyPoints.length > 0
    ? `
Key Points:
${generatedSummary.keyPoints.map((point) => `• ${point}`).join("\n")}
`
    : ""
}

${
  summaryData.includeActionItems && generatedSummary.actionItems.length > 0
    ? `
Action Items:
${generatedSummary.actionItems.map((item) => `• ${item}`).join("\n")}
`
    : ""
}

${
  summaryData.includeTimestamps && generatedSummary.timestamps.length > 0
    ? `
Timestamps:
${generatedSummary.timestamps
  .map((ts) => `${ts.time} - ${ts.content}`)
  .join("\n")}
`
    : ""
}
    `.trim();

    await navigator.clipboard.writeText(fullSummary);
    toast({
      title: "Copied to Clipboard",
      description: "Summary copied successfully",
    });
  };

  const downloadSummary = () => {
    if (!generatedSummary) return;

    const fullSummary = `
YouTube Video Summary
====================

Title: ${youtubeData?.title}
Channel: ${youtubeData?.channel}
Duration: ${youtubeData?.duration}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
${generatedSummary.summary}

${
  summaryData.includeKeyPoints && generatedSummary.keyPoints.length > 0
    ? `
KEY POINTS
----------
${generatedSummary.keyPoints.map((point) => `• ${point}`).join("\n")}
`
    : ""
}

${
  summaryData.includeActionItems && generatedSummary.actionItems.length > 0
    ? `
ACTION ITEMS
------------
${generatedSummary.actionItems.map((item) => `• ${item}`).join("\n")}
`
    : ""
}

${
  summaryData.includeTimestamps && generatedSummary.timestamps.length > 0
    ? `
TIMESTAMPS
----------
${generatedSummary.timestamps
  .map((ts) => `${ts.time} - ${ts.content}`)
  .join("\n")}
`
    : ""
}

METADATA
--------
Summary Length: ${generatedSummary.metadata.summaryLength}
Reduction: ${generatedSummary.metadata.reductionPercentage}%
Language: ${generatedSummary.metadata.language}
    `.trim();

    const element = document.createElement("a");
    const file = new Blob([fullSummary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `youtube-summary-${youtubeData?.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast({
      title: "Download Started",
      description: "Summary file downloaded successfully",
    });
  };

  const resetSummarizer = () => {
    setYoutubeUrl("");
    setYoutubeData(null);
    setGeneratedSummary(null);
    setError(null);
    setProgress(0);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Play className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                YouTube Summarizer
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-primary" />
                <span>YouTube Video</span>
              </CardTitle>
              <CardDescription>
                Enter a YouTube URL to extract and summarize the video content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* URL Input */}
              <div className="space-y-2">
                <Label htmlFor="youtube-url">YouTube URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="youtube-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    // onClick={extractVideoData}
                    onClick={handleExtract}
                    disabled={isExtracting || !youtubeUrl.trim()}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {isExtracting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              {(isExtracting || isLoading) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      {isExtracting
                        ? progress < 50
                          ? "Extracting video data..."
                          : progress < 90
                          ? "Retrieving transcript..."
                          : "Processing transcript..."
                        : isLoading
                        ? progress < 30
                          ? "Initializing AI..."
                          : progress < 70
                          ? "Generating summary..."
                          : "Finalizing summary..."
                        : "Processing..."}
                    </span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              )}

              {/* Video Data Display */}
              {youtubeData && (
                <Card className="bg-background">
                  <CardContent className="p-4">
                    <div className="flex space-x-4">
                      <img
                        src={youtubeData.thumbnail}
                        alt="Video thumbnail"
                        className="w-24 h-18 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-sm line-clamp-2">
                          {youtubeData.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{youtubeData.channel}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{youtubeData.duration}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3" />
                            <span>{youtubeData.uploadDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>{youtubeData.viewCount} views</span>
                          <span>{youtubeData.likeCount} likes</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Transcript Status */}
              {transcript && (
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">
                        Transcript Available (
                        {transcript.length.toLocaleString()} characters)
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Options */}
              {youtubeData && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Summary Options</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Summary Type</Label>
                      <Select
                        value={summaryData.summaryType}
                        onValueChange={(value) =>
                          setSummaryData({ ...summaryData, summaryType: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {summaryTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div>
                                <div className="font-medium">{type.label}</div>
                                <div className="text-xs text-muted-foreground">
                                  {type.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Summary Length</Label>
                      <Select
                        value={summaryData.summaryLength}
                        onValueChange={(value) =>
                          setSummaryData({
                            ...summaryData,
                            summaryLength: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {summaryLengths.map((length) => (
                            <SelectItem key={length.value} value={length.value}>
                              {length.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Language</Label>
                    <Select
                      value={summaryData.language}
                      onValueChange={(value) =>
                        setSummaryData({ ...summaryData, language: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.value} value={lang.value}>
                            {lang.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label>Include in Summary</Label>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="key-points"
                          checked={summaryData.includeKeyPoints}
                          onCheckedChange={(checked) =>
                            setSummaryData({
                              ...summaryData,
                              includeKeyPoints: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="key-points" className="text-sm">
                          Key Points
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="timestamps"
                          checked={summaryData.includeTimestamps}
                          onCheckedChange={(checked) =>
                            setSummaryData({
                              ...summaryData,
                              includeTimestamps: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="timestamps" className="text-sm">
                          Timestamps
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="action-items"
                          checked={summaryData.includeActionItems}
                          onCheckedChange={(checked) =>
                            setSummaryData({
                              ...summaryData,
                              includeActionItems: checked as boolean,
                            })
                          }
                        />
                        <Label htmlFor="action-items" className="text-sm">
                          Action Items
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={generateSummary}
                  className="flex-1 bg-primary hover:bg-primary/90"
                  disabled={isLoading || !youtubeData}
                >
                  {isLoading ? (
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? "Generating..." : "Generate Summary"}
                </Button>
                <Button variant="outline" onClick={resetSummarizer}>
                  Reset
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-primary" />
                <span>Generated Summary</span>
              </CardTitle>
              <CardDescription>
                {generatedSummary
                  ? "Your YouTube video summary"
                  : "Summary will appear here after processing"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-muted-foreground">
                      AI is analyzing and summarizing the video...
                    </p>
                    <Progress
                      value={progress}
                      className="w-full max-w-xs mx-auto"
                    />
                  </div>
                </div>
              ) : generatedSummary ? (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Summary</Label>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copySummary}
                        >
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={downloadSummary}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="details">Details</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="space-y-4">
                        <div className="p-4 bg-background rounded-lg border min-h-[300px]">
                          <div className="whitespace-pre-wrap text-foreground leading-relaxed">
                            {generatedSummary.summary}
                          </div>
                        </div>

                        {summaryData.includeKeyPoints &&
                          generatedSummary.keyPoints.length > 0 && (
                            <div className="space-y-2">
                              <Label>Key Points</Label>
                              <div className="space-y-2">
                                {generatedSummary.keyPoints.map(
                                  (point, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 p-2 bg-background rounded border"
                                    >
                                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{point}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {summaryData.includeActionItems &&
                          generatedSummary.actionItems.length > 0 && (
                            <div className="space-y-2">
                              <Label>Action Items</Label>
                              <div className="space-y-2">
                                {generatedSummary.actionItems.map(
                                  (item, index) => (
                                    <div
                                      key={index}
                                      className="flex items-start space-x-2 p-2 bg-background rounded border"
                                    >
                                      <Zap className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                                      <span className="text-sm">{item}</span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                      </TabsContent>

                      <TabsContent value="details" className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-primary">
                              {generatedSummary.metadata.reductionPercentage}%
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Content Reduction
                            </div>
                          </div>
                          <div className="text-center p-4 bg-background rounded-lg border">
                            <div className="text-2xl font-bold text-primary">
                              {generatedSummary.metadata.summaryLength}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Summary Length
                            </div>
                          </div>
                        </div>

                        {summaryData.includeTimestamps &&
                          generatedSummary.timestamps.length > 0 && (
                            <div className="space-y-2">
                              <Label>Timestamps</Label>
                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {generatedSummary.timestamps.map(
                                  (ts, index) => (
                                    <div
                                      key={index}
                                      className="flex items-center space-x-3 p-2 bg-background rounded border"
                                    >
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {ts.time}
                                      </Badge>
                                      <span className="text-sm flex-1">
                                        {ts.content}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            Generated:{" "}
                            {new Date(
                              generatedSummary.metadata.generatedAt
                            ).toLocaleString()}
                          </div>
                          <div>
                            Language: {generatedSummary.metadata.language}
                          </div>
                          <div>
                            Original Duration:{" "}
                            {generatedSummary.metadata.originalDuration}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>
                    Enter a YouTube URL and extract video data to get started
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>YouTube Summarizer Features</CardTitle>
              <CardDescription>
                Powerful AI-powered video content analysis and summarization
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI extracts key insights and creates comprehensive
                    summaries
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Time-Saving</h3>
                  <p className="text-sm text-muted-foreground">
                    Get the essence of long videos in minutes, not hours
                  </p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Multiple Formats</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose from bullet points, executive summaries, or full
                    transcripts
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
