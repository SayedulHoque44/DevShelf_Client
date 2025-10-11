"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
  Brain,
  Download,
  Copy,
  RefreshCw,
  BarChart,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Clock,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ReportData {
  title: string;
  reportType: string;
  industry: string;
  audience: string;
  keyPoints: string;
  dataPoints: string;
  timeframe: string;
  includeCharts: boolean;
  includeRecommendations: boolean;
  includeExecutiveSummary: boolean;
  tone: string;
  complexity: string;
  focusAreas: string[];
}

interface GeneratedReport {
  report: string;
  metadata: {
    title: string;
    reportType: string;
    industry: string;
    audience: string;
    tone: string;
    complexity: string;
    generatedAt: string;
    wordCount: number;
    estimatedReadingTime: number;
  };
}

interface GenerationStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  active: boolean;
}

export default function AIReportGenerator() {
  const [reportData, setReportData] = useState<ReportData>({
    title: "",
    reportType: "",
    industry: "",
    audience: "",
    keyPoints: "",
    dataPoints: "",
    timeframe: "",
    includeCharts: true,
    includeRecommendations: true,
    includeExecutiveSummary: true,
    tone: "professional",
    complexity: "intermediate",
    focusAreas: [],
  });

  const [generatedReport, setGeneratedReport] =
    useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([]);

  const reportTypes = [
    "Business Analysis",
    "Market Research",
    "Financial Report",
    "Project Status",
    "Performance Review",
    "Competitive Analysis",
    "Risk Assessment",
    "Strategic Planning",
    "Customer Analysis",
    "Technical Report",
  ];

  const industries = [
    "Technology",
    "Healthcare",
    "Finance",
    "Retail",
    "Manufacturing",
    "Education",
    "Real Estate",
    "Consulting",
    "Marketing",
    "Non-profit",
  ];

  const audiences = [
    "Executive Leadership",
    "Board of Directors",
    "Stakeholders",
    "Team Members",
    "Clients",
    "Investors",
    "Department Heads",
    "External Partners",
    "Regulatory Bodies",
    "General Public",
  ];

  const tones = [
    {
      value: "professional",
      label: "Professional",
      description: "Formal and business-appropriate",
    },
    {
      value: "analytical",
      label: "Analytical",
      description: "Data-driven and objective",
    },
    {
      value: "executive",
      label: "Executive",
      description: "Strategic and high-level",
    },
    {
      value: "technical",
      label: "Technical",
      description: "Detailed and comprehensive",
    },
    {
      value: "conversational",
      label: "Conversational",
      description: "Accessible and engaging",
    },
  ];

  const complexityLevels = [
    {
      value: "basic",
      label: "Basic",
      description: "Simple language, clear explanations",
    },
    {
      value: "intermediate",
      label: "Intermediate",
      description: "Moderate detail and technical depth",
    },
    {
      value: "advanced",
      label: "Advanced",
      description: "Comprehensive analysis and expertise",
    },
    {
      value: "expert",
      label: "Expert",
      description: "Deep insights and sophisticated analysis",
    },
  ];

  const focusAreas = [
    "Financial Performance",
    "Market Analysis",
    "Operational Efficiency",
    "Customer Experience",
    "Risk Management",
    "Strategic Planning",
    "Technology Integration",
    "Competitive Analysis",
    "Regulatory Compliance",
    "Sustainability",
  ];

  // Initialize generation steps
  useEffect(() => {
    const steps: GenerationStep[] = [
      {
        id: "analyze",
        title: "Analyzing Requirements",
        description:
          "Processing your report specifications and industry context",
        completed: false,
        active: false,
      },
      {
        id: "research",
        title: "Research & Data Gathering",
        description: "Collecting relevant market data and industry insights",
        completed: false,
        active: false,
      },
      {
        id: "structure",
        title: "Structuring Content",
        description: "Organizing information into professional report format",
        completed: false,
        active: false,
      },
      {
        id: "generate",
        title: "Generating Content",
        description: "Creating comprehensive report with AI-powered insights",
        completed: false,
        active: false,
      },
      {
        id: "review",
        title: "Quality Review",
        description: "Ensuring professional quality and accuracy",
        completed: false,
        active: false,
      },
      {
        id: "finalize",
        title: "Finalizing Report",
        description: "Adding final touches and formatting",
        completed: false,
        active: false,
      },
    ];
    setGenerationSteps(steps);
  }, []);

  const generateReport = async () => {
    if (!reportData.title || !reportData.reportType || !reportData.keyPoints)
      return;

    setIsGenerating(true);
    setError(null);
    setGenerationProgress(0);
    setCurrentStep(0);
    setGeneratedReport(null);

    // Initialize steps
    const steps: GenerationStep[] = [
      {
        id: "analyze",
        title: "Analyzing Requirements",
        description:
          "Processing your report specifications and industry context",
        completed: false,
        active: true,
      },
      {
        id: "research",
        title: "Research & Data Gathering",
        description: "Collecting relevant market data and industry insights",
        completed: false,
        active: false,
      },
      {
        id: "structure",
        title: "Structuring Content",
        description: "Organizing information into professional report format",
        completed: false,
        active: false,
      },
      {
        id: "generate",
        title: "Generating Content",
        description: "Creating comprehensive report with AI-powered insights",
        completed: false,
        active: false,
      },
      {
        id: "review",
        title: "Quality Review",
        description: "Ensuring professional quality and accuracy",
        completed: false,
        active: false,
      },
      {
        id: "finalize",
        title: "Finalizing Report",
        description: "Adding final touches and formatting",
        completed: false,
        active: false,
      },
    ];
    setGenerationSteps(steps);

    try {
      // Simulate step progression
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          const nextStep = prev + 1;
          if (nextStep < steps.length) {
            setGenerationSteps((prevSteps) =>
              prevSteps.map((step, index) => ({
                ...step,
                completed: index < nextStep,
                active: index === nextStep,
              }))
            );
            setGenerationProgress((nextStep / steps.length) * 100);
            return nextStep;
          } else {
            clearInterval(stepInterval);
            return prev;
          }
        });
      }, 2000);

      // Call the API
      const response = await fetch("/api/generate-ai-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      clearInterval(stepInterval);

      if (response.ok) {
        const data = await response.json();
        setGeneratedReport(data);
        setGenerationProgress(100);
        setGenerationSteps((prevSteps) =>
          prevSteps.map((step) => ({ ...step, completed: true, active: false }))
        );
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Report generation error:", error);
      setError("An error occurred while generating the report");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedReport) {
      await navigator.clipboard.writeText(generatedReport.report);
    }
  };

  const downloadReport = () => {
    if (generatedReport) {
      const element = document.createElement("a");
      const file = new Blob([generatedReport.report], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = `${reportData.title || "ai-generated-report"}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  const resetForm = () => {
    setReportData({
      title: "",
      reportType: "",
      industry: "",
      audience: "",
      keyPoints: "",
      dataPoints: "",
      timeframe: "",
      includeCharts: true,
      includeRecommendations: true,
      includeExecutiveSummary: true,
      tone: "professional",
      complexity: "intermediate",
      focusAreas: [],
    });
    setGeneratedReport(null);
    setError(null);
    setGenerationProgress(0);
    setCurrentStep(0);
  };

  const toggleFocusArea = (area: string) => {
    setReportData((prev) => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter((f) => f !== area)
        : [...prev.focusAreas, area],
    }));
  };

  const updateField = (field: keyof ReportData, value: any) => {
    setReportData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return reportData.title && reportData.reportType && reportData.keyPoints;
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
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
              <Brain className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                AI Report Generator
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Report Configuration</span>
                </CardTitle>
                <CardDescription>
                  Configure your report parameters for AI generation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title *</Label>
                    <Input
                      id="title"
                      value={reportData.title}
                      onChange={(e) => updateField("title", e.target.value)}
                      placeholder="Q4 2024 Business Performance Analysis"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Type *</Label>
                      <Select
                        value={reportData.reportType}
                        onValueChange={(value) =>
                          updateField("reportType", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map((type) => (
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
                        value={reportData.industry}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select
                        value={reportData.audience}
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

                    <div className="space-y-2">
                      <Label>Timeframe</Label>
                      <Input
                        value={reportData.timeframe}
                        onChange={(e) =>
                          updateField("timeframe", e.target.value)
                        }
                        placeholder="Q4 2024, Last 6 months, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Tone</Label>
                      <Select
                        value={reportData.tone}
                        onValueChange={(value) => updateField("tone", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {tones.map((tone) => (
                            <SelectItem key={tone.value} value={tone.value}>
                              <div className="flex flex-col">
                                <span>{tone.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {tone.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Complexity Level</Label>
                      <Select
                        value={reportData.complexity}
                        onValueChange={(value) =>
                          updateField("complexity", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select complexity" />
                        </SelectTrigger>
                        <SelectContent>
                          {complexityLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div className="flex flex-col">
                                <span>{level.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  {level.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Content Configuration */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="keyPoints">Key Points to Cover *</Label>
                    <Textarea
                      id="keyPoints"
                      value={reportData.keyPoints}
                      onChange={(e) => updateField("keyPoints", e.target.value)}
                      placeholder="Enter key points, one per line:&#10;- Revenue growth analysis&#10;- Market share expansion&#10;- Customer satisfaction metrics&#10;- Operational efficiency improvements"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataPoints">Data Points & Metrics</Label>
                    <Textarea
                      id="dataPoints"
                      value={reportData.dataPoints}
                      onChange={(e) =>
                        updateField("dataPoints", e.target.value)
                      }
                      placeholder="Enter specific data points:&#10;- Revenue: $2.5M (15% increase)&#10;- Customer base: 10,000 users&#10;- Market share: 25%&#10;- Satisfaction score: 4.2/5"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Focus Areas</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {focusAreas.map((area) => (
                        <div key={area} className="flex items-center space-x-2">
                          <Checkbox
                            id={area}
                            checked={reportData.focusAreas.includes(area)}
                            onCheckedChange={() => toggleFocusArea(area)}
                          />
                          <Label htmlFor={area} className="text-sm">
                            {area}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Select areas you want the report to focus on for more
                      targeted analysis
                    </p>
                  </div>
                </div>

                {/* Report Options */}
                <div className="space-y-4">
                  <Label>Report Sections</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="executiveSummary"
                        checked={reportData.includeExecutiveSummary}
                        onCheckedChange={(checked) =>
                          updateField("includeExecutiveSummary", checked)
                        }
                      />
                      <Label htmlFor="executiveSummary" className="text-sm">
                        Include Executive Summary
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="charts"
                        checked={reportData.includeCharts}
                        onCheckedChange={(checked) =>
                          updateField("includeCharts", checked)
                        }
                      />
                      <Label htmlFor="charts" className="text-sm">
                        Include Chart Placeholders
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommendations"
                        checked={reportData.includeRecommendations}
                        onCheckedChange={(checked) =>
                          updateField("includeRecommendations", checked)
                        }
                      />
                      <Label htmlFor="recommendations" className="text-sm">
                        Include Recommendations
                      </Label>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="flex space-x-3">
                  <Button
                    onClick={generateReport}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                    disabled={isGenerating || !isFormValid()}
                    size="lg"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating
                      ? "Generating Report..."
                      : "Generate AI Report"}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800 dark:text-red-200">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                {!isFormValid() && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Please fill in the required fields: Report Title, Report
                      Type, and Key Points.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  <span>Generated Report</span>
                </CardTitle>
                <CardDescription>
                  {generatedReport
                    ? "Your AI-generated professional report"
                    : "Report will appear here after generation"}
                </CardDescription>
                {generatedReport && (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={copyToClipboard}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={downloadReport}
                      variant="outline"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Generating Report...</span>
                        <span>{Math.round(generationProgress)}%</span>
                      </div>
                      <Progress value={generationProgress} className="h-2" />
                    </div>

                    {/* Generation Steps */}
                    <div className="space-y-3">
                      {generationSteps.map((step, index) => (
                        <div
                          key={step.id}
                          className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                            step.completed
                              ? "bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800"
                              : step.active
                              ? "bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800"
                              : "bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              step.completed
                                ? "bg-green-500 text-white"
                                : step.active
                                ? "bg-blue-500 text-white"
                                : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : step.active ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <span className="text-xs font-semibold">
                                {index + 1}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4
                              className={`font-medium text-sm ${
                                step.completed || step.active
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {step.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {step.description}
                            </p>
                          </div>
                          {step.active && (
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                              <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-200"></div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* AI Status */}
                    <div className="text-center space-y-2">
                      <div className="flex items-center justify-center space-x-2">
                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-sm font-medium text-primary">
                          AI is working on your report
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This may take 30-60 seconds depending on complexity
                      </p>
                    </div>
                  </div>
                ) : generatedReport ? (
                  <div className="space-y-4">
                    {/* Report Metadata */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="text-xs">
                        <Clock className="w-3 h-3 mr-1" />
                        {generatedReport.metadata.estimatedReadingTime} min read
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <FileText className="w-3 h-3 mr-1" />
                        {generatedReport.metadata.wordCount} words
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {generatedReport.metadata.tone}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        {generatedReport.metadata.complexity}
                      </Badge>
                    </div>

                    {/* Report Content */}
                    <div className="bg-card p-6 rounded-lg border shadow-sm max-h-[600px] overflow-y-auto">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-wrap text-sm text-foreground leading-relaxed">
                          {generatedReport.report}
                        </div>
                      </div>
                    </div>

                    {/* Report Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">
                          {generatedReport.metadata.wordCount}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Words
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-lg font-semibold text-green-600 dark:text-green-400">
                          {generatedReport.metadata.estimatedReadingTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Min Read
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                        <div className="text-lg font-semibold text-purple-600 dark:text-purple-400">
                          {generatedReport.metadata.reportType}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Type
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                        <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                          {generatedReport.metadata.industry || "General"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Industry
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-muted-foreground">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center">
                      <FileText className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      Ready to Generate Your Report
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Configure your report parameters and click &quot;Generate
                      AI Report&quot; to create a comprehensive, professional
                      report powered by advanced AI.
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="w-3 h-3 mr-1" />
                        AI-Powered
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <Target className="w-3 h-3 mr-1" />
                        Industry-Specific
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Professional
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <span>AI Report Features</span>
                </CardTitle>
                <CardDescription>
                  Powered by advanced Gemini AI for realistic, dynamic reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Gemini AI-Powered
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Advanced AI generates realistic, industry-specific
                        content with current market data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Dynamic Customization
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Real-time adaptation to tone, complexity, and focus
                        areas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Professional Quality
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Executive-ready reports with real metrics and actionable
                        insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">
                        Real-time Generation
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Live progress tracking with step-by-step generation
                        process
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI Capabilities */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-lg">
                  <h4 className="font-semibold text-sm mb-3 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>AI Capabilities</span>
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Industry Analysis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Market Research</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Risk Assessment</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Strategic Planning</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Financial Analysis</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Performance Metrics</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Competitive Intelligence</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>Trend Analysis</span>
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
