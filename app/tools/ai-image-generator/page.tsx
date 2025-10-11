"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Wand2,
  Download,
  RefreshCw,
  Copy,
  Share2,
  ExternalLink,
  ImageIcon,
  Sparkles,
  Palette,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AIImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [quality, setQuality] = useState("high");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<
    Array<{
      id: string;
      url: string;
      prompt: string;
      style: string;
      timestamp: number;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);

  const styles = [
    {
      value: "realistic",
      label: "Realistic",
      description: "Photorealistic images",
    },
    {
      value: "artistic",
      label: "Artistic",
      description: "Creative and artistic style",
    },
    {
      value: "cartoon",
      label: "Cartoon",
      description: "Animated cartoon style",
    },
    {
      value: "minimalist",
      label: "Minimalist",
      description: "Clean and simple design",
    },
    {
      value: "vintage",
      label: "Vintage",
      description: "Retro and nostalgic look",
    },
    {
      value: "futuristic",
      label: "Futuristic",
      description: "Sci-fi and modern tech",
    },
  ];

  const aspectRatios = [
    { value: "1:1", label: "Square (1:1)" },
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "4:3", label: "Standard (4:3)" },
    { value: "3:2", label: "Photo (3:2)" },
    { value: "9:16", label: "Portrait (9:16)" },
  ];

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a description for your image");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setGenerationProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      // Call the API
      const response = await fetch("/api/generate-ai-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: prompt,
          style: style,
          quality: quality,
          aspectRatio: aspectRatio,
        }),
      });
      console.log(response, "response of generate image");
      clearInterval(progressInterval);
      setGenerationProgress(100);

      if (response.ok) {
        const data = await response.json();

        const newImage = {
          id: `img-${Date.now()}`,
          url: data.imageUrl,
          prompt: prompt,
          style: style,
          timestamp: Date.now(),
        };

        setGeneratedImages((prev) => [newImage, ...prev]);
        setPrompt(""); // Clear prompt after successful generation
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate image");
      }
    } catch (error) {
      console.error("Image generation error:", error);
      setError("An error occurred while generating the image");
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-image-${prompt.replace(/[^a-zA-Z0-9]/g, "-")}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
  };

  const clearHistory = () => {
    setGeneratedImages([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-cream-100/80 dark:bg-card/80 backdrop-blur-md border-b border-warm-beige-300 dark:border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tools
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    AI Image Generator
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Create stunning images with AI
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <span>Image Settings</span>
                </CardTitle>
                <CardDescription>
                  Describe your image and customize the generation settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="prompt">Image Description</Label>
                  <Textarea
                    id="prompt"
                    placeholder="A majestic mountain landscape at sunset with golden light..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be as descriptive as possible for better results
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="style">Art Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map((styleOption) => (
                        <SelectItem
                          key={styleOption.value}
                          value={styleOption.value}
                        >
                          <div className="flex flex-col">
                            <span>{styleOption.label}</span>
                            <span className="text-xs text-muted-foreground">
                              {styleOption.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ratio) => (
                        <SelectItem key={ratio.value} value={ratio.value}>
                          {ratio.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quality">Quality</Label>
                  <Select value={quality} onValueChange={setQuality}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select quality" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="ultra">Ultra</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={generateImage}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Generating image...</span>
                      <span>{generationProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${generationProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Palette className="w-5 h-5 text-primary" />
                    <span>Generated Images</span>
                    {generatedImages.length > 0 && (
                      <Badge variant="secondary">
                        {generatedImages.length}
                      </Badge>
                    )}
                  </CardTitle>
                  {generatedImages.length > 0 && (
                    <Button variant="outline" size="sm" onClick={clearHistory}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
                <CardDescription>
                  Your AI-generated images will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {generatedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <ImageIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      No images generated yet
                    </h3>
                    <p className="text-muted-foreground">
                      Enter a description and click &quot;Generate Image&quot;
                      to create your first AI image
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedImages.map((image) => (
                      <div key={image.id} className="space-y-3">
                        <div className="relative group">
                          <Image
                            src={image.url}
                            alt={image.prompt}
                            width={400}
                            height={400}
                            className="w-full h-64 object-cover rounded-lg border border-border"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  downloadImage(image.url, image.prompt)
                                }
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyPrompt(image.prompt)}
                              >
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Prompt
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">
                              {styles.find((s) => s.value === image.style)
                                ?.label || image.style}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(image.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {image.prompt}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
