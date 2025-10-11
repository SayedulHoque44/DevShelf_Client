"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  GraduationCap,
  Brain,
  Calculator,
  Plane,
  Search,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const toolCategories = [
  {
    id: "productivity",
    title: "Productivity & Documents",
    description: "Essential document and productivity tools",
    icon: FileText,
    color: "bg-ocean-500",
    tools: [
      {
        name: "Image to PDF",
        path: "/tools/image-to-pdf",
        description: "Convert images to PDF format",
      },
      {
        name: "PDF to Word",
        path: "/tools/pdf-to-word",
        description: "Convert PDF files to Word documents",
      },
      {
        name: "Merge PDFs",
        path: "/tools/merge-pdfs",
        description: "Combine multiple PDF files",
      },
      {
        name: "Compress Image",
        path: "/tools/compress-image",
        description: "Reduce image file sizes",
      },
      {
        name: "Resume Builder",
        path: "/tools/resume-builder",
        description: "Create professional resumes",
      },
      {
        name: "Cover Letter Generator",
        path: "/tools/cover-letter",
        description: "Generate compelling cover letters",
      },
    ],
  },
  {
    id: "education",
    title: "Education & Career",
    description: "Learning and career development tools",
    icon: GraduationCap,
    color: "bg-warm-beige-500",
    tools: [
      {
        name: "Driving License Practice",
        path: "/tools/driving-license",
        description: "Practice tests for EU countries",
      },
      {
        name: "IELTS Vocabulary",
        path: "/tools/ielts-vocab",
        description: "Vocabulary builder and quizzes",
      },
      {
        name: "Visa Checker",
        path: "/tools/visa-checker",
        description: "Check visa requirements",
      },
      {
        name: "CV Templates",
        path: "/tools/cv-templates",
        description: "Country-specific CV templates",
      },
    ],
  },
  {
    id: "ai-tools",
    title: "AI-Powered Tools",
    description: "Intelligent content and writing assistants",
    icon: Brain,
    color: "bg-rich-beige-500",
    tools: [
      {
        name: "YouTube Summarizer",
        path: "/tools/youtube-summarizer",
        description: "Summarize YouTube videos with AI",
      },
      {
        name: "AI Summarizer",
        path: "/tools/ai-summarizer",
        description: "Summarize long texts instantly",
      },
      {
        name: "AI Report Generator",
        path: "/tools/ai-report",
        description: "Generate professional reports",
      },
      {
        name: "Blog Writer",
        path: "/tools/blog-writer",
        description: "AI-powered blog content creation",
      },
      {
        name: "AI Image Generator",
        path: "/tools/ai-image-generator",
        description: "Create stunning images with AI",
      },
      {
        name: "Language Translator",
        path: "/tools/translator",
        description: "Translate text between languages",
      },
      {
        name: "Email Responder",
        path: "/tools/email-responder",
        description: "Generate professional email responses",
      },
    ],
  },
  {
    id: "calculators",
    title: "Daily Utilities",
    description: "Everyday calculators and converters",
    icon: Calculator,
    color: "bg-ocean-400",
    tools: [
      {
        name: "BMI Calculator",
        path: "/tools/bmi-calculator",
        description: "Calculate body mass index",
      },
      {
        name: "Calorie Counter",
        path: "/tools/calorie-counter",
        description: "Track daily calorie intake",
      },
      {
        name: "Currency Converter",
        path: "/tools/currency-converter",
        description: "Live currency conversion",
      },
      {
        name: "Age Calculator",
        path: "/tools/age-calculator",
        description: "Calculate precise age",
      },
      {
        name: "Loan EMI Calculator",
        path: "/tools/emi-calculator",
        description: "Calculate loan EMI amounts",
      },
    ],
  },
  {
    id: "travel",
    title: "Travel & Visa",
    description: "Travel planning and visa assistance",
    icon: Plane,
    color: "bg-warm-beige-400",
    tools: [
      {
        name: "Schengen Budget Planner",
        path: "/tools/schengen-budget",
        description: "Plan your Schengen trip budget",
      },
      {
        name: "Visa Processing Steps",
        path: "/tools/visa-processing",
        description: "Step-by-step visa guides",
      },
      {
        name: "Language Phrase Tool",
        path: "/tools/language-phrases",
        description: "Essential travel phrases",
      },
    ],
  },
];

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const filteredCategories = toolCategories
    .map((category) => ({
      ...category,
      tools: category.tools.filter(
        (tool) =>
          tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((category) => category.tools.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background transition-colors duration-300">
      {/* Header */}
      <header className="bg-cream-100/80 dark:bg-card/80 backdrop-blur-md border-b border-warm-beige-300 dark:border-border sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-ocean-600 to-rich-beige-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-cream-50" />
                </div>
                <h1 className="text-xl font-bold text-foreground">ToolHub</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  className="pl-10 w-64 bg-background border-border text-foreground placeholder-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <ThemeToggle />
            </div>

            <div className="flex items-center space-x-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-warm-beige-300 dark:border-border">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search tools..."
                  className="pl-10 w-full bg-background border-border text-foreground placeholder-muted-foreground"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            All-in-One
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-500 to-ocean-700">
              {" "}
              Tool Suite
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Everything you need for productivity, learning, and daily tasks.
            Professional-grade tools that are completely free to use.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            >
              Explore Tools
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-border text-foreground hover:bg-accent"
            >
              View All Categories
            </Button>
          </div>
        </div>
      </section>

      {/* Tool Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Choose Your Category
            </h3>
            <p className="text-lg text-muted-foreground">
              Discover tools organized by purpose to help you work smarter
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card
                  key={category.id}
                  className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-1 bg-card border-border"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3 mb-3">
                      <div
                        className={`w-12 h-12 ${category.color} rounded-xl flex items-center justify-center shadow-lg`}
                      >
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-card-foreground">
                          {category.title}
                        </CardTitle>
                        <CardDescription className="text-sm text-muted-foreground">
                          {category.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {category.tools
                        .slice(
                          0,
                          expandedCategories.has(category.id)
                            ? category.tools.length
                            : 4
                        )
                        .map((tool, index) => (
                          <Link key={index} href={tool.path}>
                            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors group/tool">
                              <div>
                                <div className="font-medium text-card-foreground text-sm">
                                  {tool.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {tool.description}
                                </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover/tool:text-foreground transition-colors" />
                            </div>
                          </Link>
                        ))}
                      {category.tools.length > 4 && (
                        <div className="text-center pt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            onClick={() => toggleCategoryExpansion(category.id)}
                          >
                            {expandedCategories.has(category.id)
                              ? `Show Less`
                              : `View All ${category.tools.length} Tools`}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-cream-100/50 dark:bg-card/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">25+</div>
              <div className="text-muted-foreground">Free Tools</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">5</div>
              <div className="text-muted-foreground">Categories</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">
                100%
              </div>
              <div className="text-muted-foreground">Free to Use</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground mb-2">
                24/7
              </div>
              <div className="text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card dark:bg-background text-card-foreground dark:text-foreground py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-ocean-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">ToolHub</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Your one-stop destination for professional-grade online tools.
                Everything you need to boost productivity and streamline your
                workflow.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Categories</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Productivity Tools</div>
                <div>AI-Powered Tools</div>
                <div>Calculators</div>
                <div>Education</div>
                <div>Travel & Visa</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Support</h4>
              <div className="space-y-2 text-muted-foreground">
                <div>Help Center</div>
                <div>Contact Us</div>
                <div>Privacy Policy</div>
                <div>Terms of Service</div>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 mt-8 text-center text-muted-foreground">
            <p>
              &copy; 2024 ToolHub. All rights reserved. Made with ❤️ for
              productivity.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
