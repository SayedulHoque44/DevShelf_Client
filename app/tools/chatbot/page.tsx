"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Upload,
  FileText,
  X,
  Loader2,
  Bot,
  User,
  Trash2,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  hasPdf?: boolean;
  pdfName?: string;
}

export default function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<{
    file: File;
    base64: string;
    mimeType: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handlePdfUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      // 20MB limit
      toast({
        title: "File too large",
        description: "PDF must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setUploadedPdf({
        file,
        base64,
        mimeType: file.type,
      });
      toast({
        title: "PDF uploaded",
        description: `${file.name} is ready to be analyzed`,
      });
    } catch (error) {
      console.error("Error reading PDF:", error);
      toast({
        title: "Error",
        description: "Failed to read PDF file",
        variant: "destructive",
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removePdf = () => {
    setUploadedPdf(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() && !uploadedPdf) {
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage || "Analyze this PDF",
      timestamp: Date.now(),
      hasPdf: !!uploadedPdf,
      pdfName: uploadedPdf?.file.name,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    // Build conversation history for context
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            inputMessage || "Please analyze this PDF and provide a summary.",
          pdfBase64: uploadedPdf?.base64,
          pdfMimeType: uploadedPdf?.mimeType,
          conversationHistory,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        // Clear PDF after sending (optional - you might want to keep it for follow-up questions)
        // setUploadedPdf(null);
      } else {
        setError(data.error || "Failed to get response");
        toast({
          title: "Error",
          description: data.error || "Failed to get response",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send message. Please try again.");
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setUploadedPdf(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast({
      title: "Chat cleared",
      description: "Conversation history has been cleared",
    });
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting with proper word wrapping
    const wrapStyle = {
      wordBreak: "break-word" as const,
      overflowWrap: "break-word" as const,
      maxWidth: "100%",
      overflow: "hidden",
      overflowX: "hidden" as const,
    };

    return content.split("\n").map((line, index) => {
      if (line.startsWith("**") && line.endsWith("**")) {
        return (
          <strong
            key={index}
            className="font-semibold break-words max-w-full overflow-x-hidden"
            style={wrapStyle}
          >
            {line.slice(2, -2)}
          </strong>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h3
            key={index}
            className="text-lg font-bold mt-4 mb-2 break-words max-w-full overflow-x-hidden"
            style={wrapStyle}
          >
            {line.slice(2)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h4
            key={index}
            className="text-base font-semibold mt-3 mb-1 break-words max-w-full overflow-x-hidden"
            style={wrapStyle}
          >
            {line.slice(3)}
          </h4>
        );
      }
      return (
        <p
          key={index}
          className="break-words max-w-full overflow-x-hidden"
          style={wrapStyle}
        >
          {line || <br />}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 overflow-x-hidden">
      <div className="container mx-auto px-4 py-8 max-w-6xl w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                AI Chatbot with PDF Support
              </h1>
              <p className="text-muted-foreground">
                Chat with Gemini AI and ask questions about your PDF documents
              </p>
            </div>
            {messages.length > 0 && (
              <Button variant="outline" onClick={clearChat}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear Chat
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-2 min-w-0">
            <Card className="h-[calc(100vh-250px)] flex flex-col overflow-hidden">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Conversation</CardTitle>
                <CardDescription>
                  Ask questions and upload PDFs for analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col p-0 min-h-0 overflow-hidden">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <ScrollArea className="h-full w-full px-6">
                    <div className="space-y-4 py-4 pr-4 w-full">
                      {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-12">
                          <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p>Start a conversation or upload a PDF to begin</p>
                        </div>
                      ) : (
                        messages.map((message) => (
                          <div
                            key={message.id}
                            className={`flex gap-3 min-w-0 w-full ${
                              message.role === "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >
                            {message.role === "assistant" && (
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Bot className="h-4 w-4 text-primary" />
                                </div>
                              </div>
                            )}
                            <div
                              className={`max-w-[80%] min-w-0 rounded-lg p-4 overflow-hidden w-full ${
                                message.role === "user"
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}
                              style={{ maxWidth: "80%", width: "fit-content" }}
                            >
                              {message.hasPdf && (
                                <Badge
                                  variant="secondary"
                                  className="mb-2 text-xs"
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  {message.pdfName}
                                </Badge>
                              )}
                              <div
                                className={`text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-word max-w-full overflow-x-hidden ${
                                  message.role === "user"
                                    ? "text-primary-foreground"
                                    : "text-foreground"
                                }`}
                                style={{
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  overflowX: "hidden",
                                }}
                              >
                                {formatMessage(message.content)}
                              </div>
                              <div
                                className={`text-xs mt-2 opacity-70 ${
                                  message.role === "user"
                                    ? "text-primary-foreground"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {new Date(
                                  message.timestamp
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                            {message.role === "user" && (
                              <div className="flex-shrink-0">
                                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-4 w-4 text-muted-foreground" />
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                      {isLoading && (
                        <div className="flex gap-3 justify-start">
                          <div className="flex-shrink-0">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                          <div className="bg-muted rounded-lg p-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                </div>

                {/* Input Area */}
                <div className="border-t p-4 space-y-3 flex-shrink-0">
                  {uploadedPdf && (
                    <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          {uploadedPdf.file.name}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {(uploadedPdf.file.size / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={removePdf}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfUpload(e.target.files[0]);
                        }
                      }}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <Textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={
                        uploadedPdf
                          ? "Ask a question about the PDF..."
                          : "Type your message or upload a PDF..."
                      }
                      className="flex-1 min-h-[60px] max-h-[120px] resize-none"
                      disabled={isLoading}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={
                        isLoading || (!inputMessage.trim() && !uploadedPdf)
                      }
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How to Use</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <p>Upload a PDF file using the upload button</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <p>Type your question or ask to analyze the PDF</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <p>Get AI-powered answers based on the PDF content</p>
                </div>
                <div className="flex gap-2">
                  <span className="font-semibold text-foreground">4.</span>
                  <p>Continue the conversation with follow-up questions</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>PDF document analysis</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Context-aware conversations</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Multi-turn dialogue support</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  <span>Powered by Gemini AI</span>
                </div>
              </CardContent>
            </Card>

            {uploadedPdf && (
              <Card>
                <CardHeader>
                  <CardTitle>Uploaded PDF</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-primary" />
                      <span className="font-medium">
                        {uploadedPdf.file.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(uploadedPdf.file.size / 1024).toFixed(1)} KB
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removePdf}
                      className="w-full mt-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Remove PDF
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
