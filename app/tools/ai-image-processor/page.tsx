"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Upload,
  Wand2,
  Download,
  RefreshCw,
  Copy,
  Share2,
  ImageIcon,
  Sparkles,
  Palette,
  Settings,
  Loader2,
  FileImage,
  Edit3,
  Eye,
  Trash2,
  FileText,
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

export default function AIImageProcessor() {
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"process" | "generate">("process");
  const [style, setStyle] = useState("realistic");
  const [quality, setQuality] = useState("high");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generateImage, setGenerateImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedResults, setProcessedResults] = useState<
    Array<{
      id: string;
      type: "image" | "text";
      url?: string;
      text?: string;
      prompt: string;
      mode: string;
      timestamp: number;
    }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const styles = [
    {
      value: "realistic",
      label: "Realistic",
      description: "Photorealistic images",
    },
    {
      value: "artistic",
      label: "Artistic",
      description: "Creative and stylized",
    },
    {
      value: "cartoon",
      label: "Cartoon",
      description: "Animated and colorful",
    },
    {
      value: "abstract",
      label: "Abstract",
      description: "Modern and conceptual",
    },
    {
      value: "portrait",
      label: "Portrait",
      description: "Professional headshots",
    },
    { value: "landscape", label: "Landscape", description: "Scenic views" },
  ];

  const qualities = [
    { value: "low", label: "Low", description: "Fast generation" },
    { value: "medium", label: "Medium", description: "Balanced quality" },
    { value: "high", label: "High", description: "Best quality" },
  ];

  const aspectRatios = [
    { value: "1:1", label: "Square (1:1)" },
    { value: "16:9", label: "Widescreen (16:9)" },
    { value: "4:3", label: "Standard (4:3)" },
    { value: "9:16", label: "Portrait (9:16)" },
  ];

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setUploadedImage(result);
        setMode("process");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (mode === "process" && !uploadedImage) {
      setError("Please upload an image for processing");
      return;
    }

    setIsProcessing(true);
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

      const response = await fetch("/api/process-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          imageBase64: mode === "process" ? uploadedImage : null,
          style,
          quality,
          aspectRatio,
          mode,
          generateImage,
        }),
      });

      const data = await response.json();
      clearInterval(progressInterval);

      if (data.success) {
        const newResult = {
          id: `result-${Date.now()}`,
          type: data.type || (data.imageUrl ? "image" : "text"),
          url: data.imageUrl,
          text: data.text,
          prompt: prompt,
          mode: data.mode,
          timestamp: Date.now(),
        };

        setProcessedResults((prev) => [newResult, ...prev]);
        setProgress(100);

        toast({
          title: data.type === "text" ? "Analysis Complete" : "Image Processed",
          description: `Successfully ${
            data.type === "text"
              ? "analyzed"
              : data.mode === "process"
              ? "processed"
              : "generated"
          } ${data.type === "text" ? "text" : "image"}`,
        });
      } else {
        setError(data.error || "Failed to process image");
        setProgress(0);
        toast({
          title: "Error",
          description: data.error || "Failed to process image",
          variant: "destructive",
        });
      }
    } catch (error) {
      setError("Failed to process image. Please try again.");
      setProgress(0);
      console.error("Processing error:", error);
      toast({
        title: "Error",
        description: "Failed to process image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const downloadImage = async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `ai-image-${prompt
        .slice(0, 20)
        .replace(/[^a-zA-Z0-9]/g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  const clearImage = () => {
    setUploadedImage(null);
    setMode("generate");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const clearResults = () => {
    setProcessedResults([]);
    toast({
      title: "Results cleared",
      description: "All processed results have been cleared",
    });
  };

  const formatAnalysisText = (text: string) => {
    // Split text into sections and format them
    const sections = text.split(/\*\*(.*?)\*\*/g);
    return sections.map((section, index) => {
      if (index % 2 === 1) {
        // This is a bold section (header)
        return (
          <h4
            key={index}
            className="font-semibold text-foreground mt-4 mb-2 first:mt-0"
          >
            {section}
          </h4>
        );
      } else {
        // This is regular text
        const lines = section.split("\n").filter((line) => line.trim());
        return lines.map((line, lineIndex) => (
          <p
            key={`${index}-${lineIndex}`}
            className="text-sm text-muted-foreground mb-2 leading-relaxed"
          >
            {line.trim()}
          </p>
        ));
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tools
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                AI Image Processor
              </h1>
              <p className="text-muted-foreground">
                Edit images or extract information using AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Wand2 className="w-5 h-5" />
                  <span>Image Processing</span>
                </CardTitle>
                <CardDescription>
                  Upload an image to edit or generate a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Mode Selection */}
                <Tabs
                  value={mode}
                  onValueChange={(value) =>
                    setMode(value as "process" | "generate")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger
                      value="process"
                      className="flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Image</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="generate"
                      className="flex items-center space-x-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Image</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="process" className="space-y-4">
                    <div>
                      <Label htmlFor="image-upload">Upload Image</Label>
                      <div className="mt-2">
                        {uploadedImage ? (
                          <div className="relative">
                            <Image
                              src={uploadedImage}
                              alt="Uploaded image"
                              width={300}
                              height={200}
                              className="rounded-lg border"
                            />
                            <Button
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2"
                              onClick={clearImage}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-accent transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">
                              Click to upload an image
                            </p>
                            <p className="text-sm text-muted-foreground mt-2">
                              PNG, JPG, GIF up to 10MB
                            </p>
                          </div>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="generate" className="space-y-4">
                    <Alert>
                      <ImageIcon className="h-4 w-4" />
                      <AlertDescription>
                        Generate a new image from text description
                      </AlertDescription>
                    </Alert>
                  </TabsContent>
                </Tabs>

                {/* Prompt Input */}
                <div>
                  <Label htmlFor="prompt">
                    {mode === "process"
                      ? "Edit Instructions"
                      : "Image Description"}
                  </Label>
                  <Textarea
                    id="prompt"
                    placeholder={
                      mode === "process"
                        ? "Describe how you want to edit the image..."
                        : "Describe the image you want to generate..."
                    }
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </div>

                {/* Generate Image Checkbox (only for process mode) */}
                {mode === "process" && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="generate-image"
                      checked={generateImage}
                      onCheckedChange={(checked) =>
                        setGenerateImage(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="generate-image"
                      className="text-sm font-medium"
                    >
                      Generate image with changes
                    </Label>
                  </div>
                )}

                {/* Style Options (for generation mode) */}
                {mode === "generate" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="style">Style</Label>
                      <Select value={style} onValueChange={setStyle}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {styles.map((styleOption) => (
                            <SelectItem
                              key={styleOption.value}
                              value={styleOption.value}
                            >
                              <div>
                                <div className="font-medium">
                                  {styleOption.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {styleOption.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="quality">Quality</Label>
                      <Select value={quality} onValueChange={setQuality}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {qualities.map((qualityOption) => (
                            <SelectItem
                              key={qualityOption.value}
                              value={qualityOption.value}
                            >
                              <div>
                                <div className="font-medium">
                                  {qualityOption.label}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {qualityOption.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="aspectRatio">Aspect Ratio</Label>
                      <Select
                        value={aspectRatio}
                        onValueChange={setAspectRatio}
                      >
                        <SelectTrigger>
                          <SelectValue />
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
                  </div>
                )}

                {/* Process Button */}
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing || !prompt.trim()}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      {mode === "process" ? "Process Image" : "Generate Image"}
                    </>
                  )}
                </Button>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Processing image...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Eye className="w-5 h-5" />
                      <span>Results</span>
                    </CardTitle>
                    <CardDescription>
                      {processedResults.length > 0
                        ? `${processedResults.length} result(s) processed`
                        : "Processed results will appear here"}
                    </CardDescription>
                  </div>
                  {processedResults.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearResults}
                      className="ml-4"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {processedResults.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No results processed yet</p>
                    <p className="text-sm">
                      Upload an image or generate one to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processedResults.map((result) => (
                      <div key={result.id} className="border rounded-lg p-4">
                        <div className="flex items-start space-x-4">
                          {result.type === "image" ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="cursor-pointer group relative">
                                  <Image
                                    src={result.url!}
                                    alt="Processed image"
                                    width={120}
                                    height={120}
                                    className="rounded-lg object-cover group-hover:opacity-90 transition-opacity"
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white" />
                                  </div>
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                                <DialogHeader>
                                  <DialogTitle>
                                    {result.mode === "process"
                                      ? "Edited Image"
                                      : "Generated Image"}
                                  </DialogTitle>
                                  <DialogDescription>
                                    {result.prompt}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-center">
                                  <Image
                                    src={result.url!}
                                    alt="Full size image"
                                    width={800}
                                    height={600}
                                    className="rounded-lg object-contain max-w-full max-h-[70vh]"
                                  />
                                </div>
                                <div className="flex justify-center space-x-2 mt-4">
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      copyToClipboard(result.url!, "Image URL")
                                    }
                                  >
                                    <Copy className="w-4 h-4 mr-1" />
                                    Copy URL
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      downloadImage(result.url!, result.prompt)
                                    }
                                  >
                                    <Download className="w-4 h-4 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="w-[120px] h-[120px] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg flex items-center justify-center">
                              <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                          )}
                          <div className="flex-1 space-y-2">
                            <div>
                              <Badge variant="outline" className="mb-2">
                                {result.type === "image"
                                  ? result.mode === "process"
                                    ? "Edited"
                                    : "Generated"
                                  : "Analysis"}
                              </Badge>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {result.prompt}
                              </p>
                              {result.type === "text" && result.text && (
                                <div className="mt-3 p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-lg border">
                                  <div className="space-y-2">
                                    {formatAnalysisText(result.text)}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  copyToClipboard(
                                    result.type === "image"
                                      ? result.url!
                                      : result.text!,
                                    result.type === "image"
                                      ? "Image URL"
                                      : "Analysis text"
                                  )
                                }
                              >
                                <Copy className="w-4 h-4 mr-1" />
                                Copy
                              </Button>
                              {result.type === "image" && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    downloadImage(result.url!, result.prompt)
                                  }
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Download
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
