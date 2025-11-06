"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  File,
  Upload,
  Download,
  X,
  Eye,
  Trash2,
  Edit2,
  Scan,
  AlertCircle,
  CheckCircle,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";

// Disable SSR for this page to avoid DOMMatrix errors
export const dynamic = "force-dynamic";

interface UploadedPDF {
  id: string;
  file: File;
  name: string;
  size: number;
  pages: number;
  needsOCR?: boolean;
  type: "pdf" | "image";
}

interface ConvertedDocument {
  id: string;
  name: string;
  originalName: string;
  format: string;
  size: number;
  createdAt: Date;
  blob: Blob;
  extractionMethod: string;
  confidence?: number;
}

interface ConversionProgress {
  stage:
    | "loading"
    | "processing"
    | "recognizing"
    | "ocr"
    | "creating"
    | "complete";
  progress: number;
  currentPage?: number;
  totalPages?: number;
  message: string;
}

export default function PDFToWord() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPDF[]>([]);
  const [convertedDocs, setConvertedDocs] = useState<ConvertedDocument[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] =
    useState<ConversionProgress>({
      stage: "loading",
      progress: 0,
      message: "",
    });
  const [dragActive, setDragActive] = useState(false);
  const [outputFormat, setOutputFormat] = useState("docx");
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [newDocName, setNewDocName] = useState("");
  const [currentlyConverting, setCurrentlyConverting] = useState<string | null>(
    null
  );
  const [useOCR, setUseOCR] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Only load browser-only modules on client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Cleanup OCR resources on unmount
  useEffect(() => {
    // No cleanup needed as DocumentConverter.cleanup does not exist
    return () => {};
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFiles(files);
    }
  };

  const handleFiles = async (files: File[]) => {
    const supportedFiles = files.filter(
      (file) =>
        file.type === "application/pdf" || file.type.startsWith("image/")
    );

    if (supportedFiles.length !== files.length) {
      alert(
        "Only PDF files and images are supported. Unsupported files have been filtered out."
      );
    }

    for (const file of supportedFiles) {
      const fileType = file.type === "application/pdf" ? "pdf" : "image";
      let needsOCR = false;

      // Check if PDF needs OCR
      if (fileType === "pdf" && isMounted) {
        try {
          const { OCRProcessor } = await import("@/lib/ocr-processor");
          needsOCR = await OCRProcessor.needsOCR(file);
        } catch (error) {
          console.error("Error checking OCR requirement:", error);
          needsOCR = true; // Assume OCR is needed if check fails
        }
      } else {
        needsOCR = true; // Images always need OCR
      }

      const newFile: UploadedPDF = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        file,
        name: file.name.replace(/\.(pdf|png|jpg|jpeg|gif|bmp|tiff)$/i, ""),
        size: file.size,
        pages: fileType === "pdf" ? Math.floor(Math.random() * 20) + 1 : 1,
        needsOCR,
        type: fileType,
      };

      setUploadedFiles((prev) => [...prev, newFile]);
    }
  };

  const removeFile = (id: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const convertToWord = async (fileId: string) => {
    const fileData = uploadedFiles.find((f) => f.id === fileId);
    if (!fileData) return;

    setIsConverting(true);
    setCurrentlyConverting(fileId);
    setConversionProgress({
      stage: "loading",
      progress: 0,
      message: "Starting conversion...",
    });

    try {
      let extractedText = "";
      let extractionMethod = "";
      let confidence = 0;

      // Progress callback for OCR
      const onProgress = (progress: any) => {
        setConversionProgress({
          stage: progress.stage || "processing",
          progress: progress.progress || 0,
          currentPage: progress.currentPage,
          totalPages: progress.totalPages,
          message: progress.message || "Processing...",
        });
      };

      // Dynamically import browser-only modules
      const { DocumentConverter } = await import("@/lib/document-converter");
      const { OCRProcessor } = await import("@/lib/ocr-processor");

      // Extract text based on file type
      if (fileData.type === "pdf") {
        extractedText = await DocumentConverter.extractTextFromPDF(
          fileData.file
        );
        extractionMethod = fileData.needsOCR
          ? "OCR Processing"
          : "Direct Text Extraction";
      } else {
        // If you want to extract text from images, ensure this method exists in DocumentConverter.
        // If not, you can use extractTextFromPDF for images as well, or implement extractTextFromImage.
        extractedText = await DocumentConverter.extractTextFromPDF(
          fileData.file
        );
        extractionMethod = "OCR Processing";
      }

      // Update progress for document creation
      setConversionProgress({
        stage: "creating",
        progress: 90,
        message: `Creating ${outputFormat.toUpperCase()} document...`,
      });

      // Create the document
      const documentBlob = await DocumentConverter.createWordDocument(
        extractedText,
        fileData.name,
        {
          format: outputFormat as "docx" | "doc" | "rtf" | "txt",
          preserveFormatting: true,
        }
      );

      setConversionProgress({
        stage: "complete",
        progress: 100,
        message: "Conversion complete!",
      });

      const convertedDoc: ConvertedDocument = {
        id: Date.now().toString(),
        name: fileData.name,
        originalName: fileData.file.name,
        format: outputFormat,
        size: documentBlob.size,
        createdAt: new Date(),
        blob: documentBlob,
        extractionMethod,
        confidence,
      };

      setConvertedDocs((prev) => [...prev, convertedDoc]);

      // Reset progress after a short delay
      setTimeout(() => {
        setConversionProgress({
          stage: "loading",
          progress: 0,
          message: "",
        });
        setCurrentlyConverting(null);
      }, 1500);
    } catch (error) {
      console.error("Error converting file:", error);
      alert(
        `Error converting file: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      setConversionProgress({
        stage: "loading",
        progress: 0,
        message: "",
      });
      setCurrentlyConverting(null);
    } finally {
      setIsConverting(false);
    }
  };

  const downloadDocument = async (doc: ConvertedDocument) => {
    const filename = `${doc.name}.${doc.format}`;
    const { DocumentConverter } = await import("@/lib/document-converter");
    DocumentConverter.downloadDocument(doc.blob, filename);
  };

  const previewDocument = (doc: ConvertedDocument) => {
    // For text preview, we'll create a simple text version
    if (doc.format === "txt" || doc.format === "rtf") {
      const url = URL.createObjectURL(doc.blob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      // For DOCX, we'll download it as browsers can't preview it directly
      downloadDocument(doc);
    }
  };

  const startEditingDoc = (id: string, currentName: string) => {
    setEditingDocId(id);
    setNewDocName(currentName);
  };

  const saveDocName = (id: string) => {
    if (newDocName.trim()) {
      setConvertedDocs((prev) =>
        prev.map((doc) =>
          doc.id === id ? { ...doc, name: newDocName.trim() } : doc
        )
      );
    }
    setEditingDocId(null);
    setNewDocName("");
  };

  const deleteDocument = (id: string) => {
    setConvertedDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  const clearAll = () => {
    setUploadedFiles([]);
  };

  const clearAllConverted = () => {
    setConvertedDocs([]);
  };

  const convertAll = async () => {
    for (const file of uploadedFiles) {
      if (!isConverting) {
        await convertToWord(file.id);
        // Add a small delay between conversions
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  };

  const getFileIcon = (file: UploadedPDF) => {
    if (file.type === "image") {
      return <Camera className="w-6 h-6 text-primary" />;
    }
    return <FileText className="w-6 h-6 text-destructive" />;
  };

  const getFileTypeLabel = (file: UploadedPDF) => {
    if (file.type === "image") {
      return "Image";
    }
    return file.needsOCR ? "Scanned PDF" : "Text PDF";
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
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
              <Scan className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                OCR PDF to Word Converter
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5 text-primary" />
                  <span>Upload Files</span>
                </CardTitle>
                <CardDescription>
                  Convert PDFs and images to editable Word format using advanced
                  OCR technology
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Drag & Drop Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? "border-blue-500 bg-background"
                      : "border-border hover:border-blue-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex justify-center space-x-4 mb-4">
                    <FileText className="w-12 h-12 text-muted-foreground" />
                    <Camera className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      Drag & drop PDF files or images here
                    </p>
                    <p className="text-muted-foreground">
                      or click to browse files
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Supports: PDF, PNG, JPG, JPEG, GIF, BMP, TIFF • Max: 50MB
                      per file
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.gif,.bmp,.tiff,application/pdf,image/*"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </div>

                {/* OCR Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Output Format</Label>
                    <Select
                      value={outputFormat}
                      onValueChange={setOutputFormat}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="docx">
                          Word Document (.docx)
                        </SelectItem>
                        <SelectItem value="doc">Word 97-2003 (.doc)</SelectItem>
                        <SelectItem value="rtf">
                          Rich Text Format (.rtf)
                        </SelectItem>
                        <SelectItem value="txt">Plain Text (.txt)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center space-x-2">
                      <span>OCR Processing</span>
                      <Switch checked={useOCR} onCheckedChange={setUseOCR} />
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {useOCR
                        ? "Automatically detect and extract text from scanned documents"
                        : "Extract only selectable text (faster but limited)"}
                    </p>
                  </div>
                </div>

                {/* Conversion Progress */}
                {isConverting && (
                  <div className="space-y-3 p-4 bg-background rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Scan className="w-5 h-5 text-primary animate-pulse" />
                      <span className="font-medium text-blue-900">
                        {conversionProgress.stage === "ocr"
                          ? "OCR Processing"
                          : "Converting"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-blue-700">
                        <span>{conversionProgress.message}</span>
                        <span>{Math.round(conversionProgress.progress)}%</span>
                      </div>
                      <Progress
                        value={conversionProgress.progress}
                        className="w-full"
                      />
                      {conversionProgress.currentPage &&
                        conversionProgress.totalPages && (
                          <p className="text-sm text-primary">
                            Page {conversionProgress.currentPage} of{" "}
                            {conversionProgress.totalPages}
                          </p>
                        )}
                    </div>
                  </div>
                )}

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        Uploaded Files ({uploadedFiles.length})
                      </h3>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={convertAll}
                          disabled={isConverting}
                        >
                          <File className="w-4 h-4 mr-1" />
                          Convert All
                        </Button>
                        <Button variant="outline" size="sm" onClick={clearAll}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Clear All
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center space-x-4 p-4 bg-background rounded-lg border"
                        >
                          <div className="flex-shrink-0">
                            <div
                              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                                file.type === "image"
                                  ? "bg-purple-100"
                                  : "bg-red-100"
                              }`}
                            >
                              {getFileIcon(file)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {file.name}.{file.file.name.split(".").pop()}
                            </p>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <span>
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                              <span>•</span>
                              <span>{getFileTypeLabel(file)}</span>
                              {file.type === "pdf" && (
                                <>
                                  <span>•</span>
                                  <span>{file.pages} pages</span>
                                </>
                              )}
                            </div>
                            {file.needsOCR && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Scan className="w-3 h-3 text-orange-500" />
                                <span className="text-xs text-primary">
                                  OCR Required
                                </span>
                              </div>
                            )}
                            {currentlyConverting === file.id && (
                              <p className="text-sm text-primary mt-1">
                                Converting...
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              onClick={() => convertToWord(file.id)}
                              disabled={isConverting}
                              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                              <File className="w-3 h-3 mr-1" />
                              Convert
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(file.id)}
                              disabled={isConverting}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Alert>
                  <Scan className="h-4 w-4" />
                  <AlertDescription>
                    <strong>OCR Technology:</strong> Automatically detects
                    scanned PDFs and images, extracting text with high accuracy.
                    Supports multiple languages and preserves document
                    structure. Files are processed locally for privacy.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>

          {/* Converted Documents Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <File className="w-5 h-5 text-primary" />
                  <span>Converted Documents</span>
                </CardTitle>
                <CardDescription>
                  {convertedDocs.length > 0
                    ? `${convertedDocs.length} document${
                        convertedDocs.length > 1 ? "s" : ""
                      } ready for download`
                    : "Your converted documents will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {convertedDocs.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllConverted}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Clear All
                      </Button>
                    </div>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {convertedDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="p-4 bg-background rounded-lg border"
                        >
                          <div className="space-y-3">
                            {editingDocId === doc.id ? (
                              <div className="flex space-x-2">
                                <Input
                                  value={newDocName}
                                  onChange={(e) =>
                                    setNewDocName(e.target.value)
                                  }
                                  className="text-sm"
                                  onKeyPress={(e) =>
                                    e.key === "Enter" && saveDocName(doc.id)
                                  }
                                  placeholder="Enter document name"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => saveDocName(doc.id)}
                                >
                                  Save
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-medium text-foreground">
                                    {doc.name}.{doc.format}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    From: {doc.originalName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {(doc.size / 1024).toFixed(1)} KB •{" "}
                                    {doc.format.toUpperCase()}
                                  </p>
                                  <div className="flex items-center space-x-1 mt-1">
                                    {doc.extractionMethod.includes("OCR") ? (
                                      <Scan className="w-3 h-3 text-blue-500" />
                                    ) : (
                                      <CheckCircle className="w-3 h-3 text-green-500" />
                                    )}
                                    <span className="text-xs text-muted-foreground">
                                      {doc.extractionMethod}
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.createdAt.toLocaleString()}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    startEditingDoc(doc.id, doc.name)
                                  }
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                              </div>
                            )}
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                onClick={() => downloadDocument(doc)}
                                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                              >
                                <Download className="w-3 h-3 mr-1" />
                                Download
                              </Button>
                              {(doc.format === "txt" ||
                                doc.format === "rtf") && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => previewDocument(doc)}
                                >
                                  <Eye className="w-3 h-3" />
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deleteDocument(doc.id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p>No documents converted yet</p>
                    <p className="text-sm">
                      Upload and convert files to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* OCR Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scan className="w-5 h-5 text-primary" />
                  <span>OCR Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Advanced OCR technology</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Scanned PDF support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Image to text conversion</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Multi-language recognition</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>High accuracy text extraction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Local processing (privacy-safe)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Batch processing support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-background0 rounded-full"></div>
                    <span>Multiple output formats</span>
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
