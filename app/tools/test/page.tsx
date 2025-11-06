"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Send, AlertCircle, CheckCircle } from "lucide-react";

export default function TestPage() {
  const [inputText, setInputText] = useState("");
  const [response, setResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleTest = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text to test");
      return;
    }

    setIsLoading(true);
    setError("");
    setResponse("");
    setSuccess(false);

    try {
      const res = await fetch("/api/test-genai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: inputText }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to get response");
      }

      const data = await res.json();
      setResponse(data.response);
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText("");
    setResponse("");
    setError("");
    setSuccess(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Google GenAI Test Page
            </h1>
            <p className="text-lg text-muted-foreground">
              Test the Google GenAI API with your custom prompts
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="w-5 h-5" />
                  Input Prompt
                </CardTitle>
                <CardDescription>
                  Enter your text prompt to test the Google GenAI API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-foreground mb-2"
                  >
                    Your Prompt
                  </label>
                  <Input
                    id="prompt"
                    placeholder="Enter your prompt here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={isLoading}
                    className="w-full"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleTest}
                    disabled={isLoading || !inputText.trim()}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Test API
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleClear}
                    disabled={isLoading}
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Response Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {success ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-muted-foreground" />
                  )}
                  API Response
                </CardTitle>
                <CardDescription>
                  The response from Google GenAI will appear here
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {success && response && (
                  <Alert className="mb-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      API call successful!
                    </AlertDescription>
                  </Alert>
                )}

                <div className="min-h-[200px] p-4 bg-muted/50 rounded-lg border">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          Processing your request...
                        </p>
                      </div>
                    </div>
                  ) : response ? (
                    <div className="whitespace-pre-wrap text-foreground">
                      {response}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-center">
                      <p>
                        No response yet. Enter a prompt and click &quot;Test
                        API&quot; to see the result.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Example Prompts */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Example Prompts</CardTitle>
              <CardDescription>
                Try these example prompts to test the API functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "Explain how AI works in a few words",
                  "Write a short poem about technology",
                  "What are the benefits of renewable energy?",
                  "Create a simple recipe for chocolate cake",
                  "Explain quantum computing in simple terms",
                  "Write a motivational quote for students",
                ].map((prompt, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 text-left justify-start"
                    onClick={() => setInputText(prompt)}
                    disabled={isLoading}
                  >
                    <span className="text-sm">{prompt}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
