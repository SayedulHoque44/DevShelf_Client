"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Download,
  Plus,
  X,
  Loader2,
  Check,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  generateResumePDF,
  type ResumeData,
  type ResumeDesign,
} from "@/lib/resume-pdf-generator";
import {
  resumeTemplates,
  type ResumeTemplateId,
  getTemplateById,
} from "@/lib/resume-templates";

interface Experience {
  id: string;
  position: string;
  company: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  degree: string;
  institution: string;
  year: string;
  grade: string;
}

function ResumeBuilderContent() {
  const searchParams = useSearchParams();
  const templateParam = searchParams?.get(
    "template"
  ) as ResumeTemplateId | null;

  const [activeTab, setActiveTab] = useState("personal");
  const [templateId, setTemplateId] = useState<ResumeTemplateId>(
    templateParam && resumeTemplates.find((t) => t.id === templateParam)
      ? templateParam
      : "modern-sidebar"
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  // Update template when URL param changes
  useEffect(() => {
    if (templateParam && resumeTemplates.find((t) => t.id === templateParam)) {
      setTemplateId(templateParam);
    }
  }, [templateParam]);

  const [resumeData, setResumeData] = useState<ResumeData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedIn: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
  });

  const [newSkill, setNewSkill] = useState("");

  const addExperience = () => {
    const newExp: Experience = {
      id: Date.now().toString(),
      position: "",
      company: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    };
    setResumeData((prev) => ({
      ...prev,
      experience: [...prev.experience, newExp],
    }));
  };

  const updateExperience = (
    id: string,
    field: keyof Experience,
    value: any
  ) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.map((exp) =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    }));
  };

  const removeExperience = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((exp) => exp.id !== id),
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      year: "",
      grade: "",
    };
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, newEdu],
    }));
  };

  const updateEducation = (
    id: string,
    field: keyof Education,
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.map((edu) =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (id: string) => {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((edu) => edu.id !== id),
    }));
  };

  const addSkill = () => {
    if (newSkill.trim() && !resumeData.skills.includes(newSkill.trim())) {
      setResumeData((prev) => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()],
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const updatePersonalInfo = (
    field: keyof ResumeData["personalInfo"],
    value: string
  ) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value },
    }));
  };

  const handleDownloadPDF = async () => {
    console.log("Download button clicked, templateId:", templateId);

    if (!resumeData.personalInfo.fullName) {
      toast({
        title: "Missing Information",
        description: "Please enter your full name to generate the resume.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Map template ID to design type for PDF generation
      const designMap: Record<ResumeTemplateId, ResumeDesign> = {
        classic: "classic",
        "modern-sidebar": "modern-sidebar",
        "modern-two-column": "modern-two-column",
        "modern-minimal": "modern-minimal",
      };
      const design = designMap[templateId] || "modern-sidebar";
      console.log(
        "Generating PDF with design:",
        design,
        "for template:",
        templateId
      );

      const pdfBlob = await generateResumePDF(resumeData, design);
      console.log("PDF generated successfully, size:", pdfBlob.size);

      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.personalInfo.fullName.replace(
        /\s+/g,
        "-"
      )}-Resume.pdf`;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // Clean up after a short delay to ensure download starts
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Resume Downloaded",
        description:
          "Your resume has been successfully generated and downloaded.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      console.error("Template ID:", templateId);
      console.error(
        "Error details:",
        error instanceof Error ? error.stack : error
      );
      toast({
        title: "Error",
        description: `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }. Please check console for details.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString + "-01");
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border sticky top-0 z-50">
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
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Resume Builder
              </h1>
            </div>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDownloadPDF();
              }}
              disabled={isGenerating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </>
              )}
            </Button>
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
                  <span>Build Your Resume</span>
                </CardTitle>
                <CardDescription>
                  Fill in your information to create a professional resume
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="personal">Personal</TabsTrigger>
                    <TabsTrigger value="experience">Experience</TabsTrigger>
                    <TabsTrigger value="education">Education</TabsTrigger>
                    <TabsTrigger value="skills">Skills</TabsTrigger>
                  </TabsList>

                  {/* Personal Information */}
                  <TabsContent value="personal" className="space-y-4 mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={resumeData.personalInfo.fullName}
                          onChange={(e) =>
                            updatePersonalInfo("fullName", e.target.value)
                          }
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personalInfo.email}
                          onChange={(e) =>
                            updatePersonalInfo("email", e.target.value)
                          }
                          placeholder="john@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={resumeData.personalInfo.phone}
                          onChange={(e) =>
                            updatePersonalInfo("phone", e.target.value)
                          }
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={resumeData.personalInfo.location}
                          onChange={(e) =>
                            updatePersonalInfo("location", e.target.value)
                          }
                          placeholder="New York, NY"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personalInfo.linkedIn}
                          onChange={(e) =>
                            updatePersonalInfo("linkedIn", e.target.value)
                          }
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={resumeData.personalInfo.website}
                          onChange={(e) =>
                            updatePersonalInfo("website", e.target.value)
                          }
                          placeholder="johndoe.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="summary">Professional Summary</Label>
                      <Textarea
                        id="summary"
                        value={resumeData.summary}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        placeholder="Brief summary of your professional background and key achievements..."
                        rows={4}
                      />
                    </div>
                  </TabsContent>

                  {/* Experience */}
                  <TabsContent value="experience" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Work Experience</h3>
                      <Button onClick={addExperience} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Experience
                      </Button>
                    </div>
                    {resumeData.experience.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>
                          No experience added yet. Click &quot;Add
                          Experience&quot; to get started.
                        </p>
                      </div>
                    ) : (
                      resumeData.experience.map((exp, idx) => {
                        const expId = exp.id || idx.toString();
                        return (
                          <Card key={expId} className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">
                                  Experience Entry
                                </h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeExperience(expId)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Position</Label>
                                  <Input
                                    value={exp.position}
                                    onChange={(e) =>
                                      updateExperience(
                                        expId,
                                        "position",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Software Engineer"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Company</Label>
                                  <Input
                                    value={exp.company}
                                    onChange={(e) =>
                                      updateExperience(
                                        expId,
                                        "company",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Tech Corp"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Start Date</Label>
                                  <Input
                                    type="month"
                                    value={exp.startDate}
                                    onChange={(e) =>
                                      updateExperience(
                                        expId,
                                        "startDate",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>End Date</Label>
                                  <Input
                                    type="month"
                                    value={exp.endDate}
                                    onChange={(e) =>
                                      updateExperience(
                                        expId,
                                        "endDate",
                                        e.target.value
                                      )
                                    }
                                    disabled={exp.current}
                                  />
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`current-${expId}`}
                                  checked={exp.current}
                                  onCheckedChange={(checked) =>
                                    updateExperience(expId, "current", checked)
                                  }
                                />
                                <Label
                                  htmlFor={`current-${expId}`}
                                  className="cursor-pointer"
                                >
                                  Currently working here
                                </Label>
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={exp.description}
                                  onChange={(e) =>
                                    updateExperience(
                                      expId,
                                      "description",
                                      e.target.value
                                    )
                                  }
                                  placeholder="Describe your responsibilities and achievements..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>

                  {/* Education */}
                  <TabsContent value="education" className="space-y-4 mt-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">Education</h3>
                      <Button onClick={addEducation} size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Education
                      </Button>
                    </div>
                    {resumeData.education.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>
                          No education added yet. Click &quot;Add
                          Education&quot; to get started.
                        </p>
                      </div>
                    ) : (
                      resumeData.education.map((edu, idx) => {
                        const eduId = edu.id || idx.toString();
                        return (
                          <Card key={eduId} className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Education Entry</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeEducation(eduId)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Degree</Label>
                                  <Input
                                    value={edu.degree}
                                    onChange={(e) =>
                                      updateEducation(
                                        eduId,
                                        "degree",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Bachelor of Science"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Institution</Label>
                                  <Input
                                    value={edu.institution}
                                    onChange={(e) =>
                                      updateEducation(
                                        eduId,
                                        "institution",
                                        e.target.value
                                      )
                                    }
                                    placeholder="University Name"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Year</Label>
                                  <Input
                                    value={edu.year}
                                    onChange={(e) =>
                                      updateEducation(
                                        eduId,
                                        "year",
                                        e.target.value
                                      )
                                    }
                                    placeholder="2023"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Grade/GPA</Label>
                                  <Input
                                    value={edu.grade}
                                    onChange={(e) =>
                                      updateEducation(
                                        eduId,
                                        "grade",
                                        e.target.value
                                      )
                                    }
                                    placeholder="3.8/4.0"
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        );
                      })
                    )}
                  </TabsContent>

                  {/* Skills */}
                  <TabsContent value="skills" className="space-y-4 mt-4">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skills</h3>
                      <div className="flex space-x-2">
                        <Input
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill..."
                          onKeyPress={(e) => e.key === "Enter" && addSkill()}
                        />
                        <Button onClick={addSkill}>Add</Button>
                      </div>
                      {resumeData.skills.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>
                            No skills added yet. Add your first skill above.
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {resumeData.skills.map((skill) => (
                            <Badge
                              key={skill}
                              variant="secondary"
                              className="text-sm py-1 px-3"
                            >
                              {skill}
                              <button
                                onClick={() => removeSkill(skill)}
                                className="ml-2 hover:text-destructive"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0 sticky top-20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resume Preview</CardTitle>
                    <CardDescription>
                      Live preview of your resume (A4 size)
                    </CardDescription>
                  </div>
                  <div className="space-y-2">
                    <Label>Resume Template</Label>
                    <Select
                      value={templateId}
                      onValueChange={(value) =>
                        setTemplateId(value as ResumeTemplateId)
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {resumeTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {getTemplateById(templateId).description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  className="bg-white p-8 rounded-lg border shadow-sm min-h-[800px] text-sm transition-all"
                  style={{
                    aspectRatio: "210 / 297", // A4 aspect ratio
                    maxWidth: "100%",
                  }}
                >
                  {templateId === "classic" ? (
                    <ClassicPreview data={resumeData} formatDate={formatDate} />
                  ) : templateId === "modern-sidebar" ? (
                    <ModernSidebarPreview
                      data={resumeData}
                      formatDate={formatDate}
                    />
                  ) : templateId === "modern-two-column" ? (
                    <ModernTwoColumnPreview
                      data={resumeData}
                      formatDate={formatDate}
                    />
                  ) : templateId === "modern-minimal" ? (
                    <ModernMinimalPreview
                      data={resumeData}
                      formatDate={formatDate}
                    />
                  ) : (
                    <ModernSidebarPreview
                      data={resumeData}
                      formatDate={formatDate}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Modern Sidebar Preview Component (Two-column with colored sidebar)
function ModernSidebarPreview({
  data,
  formatDate,
}: {
  data: ResumeData;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="flex h-full -m-8">
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gradient-to-b from-gray-700 to-gray-800 text-white p-4">
        <div className="space-y-5">
          {/* Name */}
          <div>
            <h1 className="text-lg font-bold uppercase leading-tight mb-1">
              {data.personalInfo.fullName || "Your Name"}
            </h1>
            {data.personalInfo.email && (
              <div className="text-[10px] text-gray-300 mt-1">
                {data.personalInfo.email}
              </div>
            )}
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-gray-600 pb-1">
              Contact
            </h2>
            <div className="space-y-1.5">
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="break-words">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="break-words">
                    {data.personalInfo.location}
                  </span>
                </div>
              )}
              {data.personalInfo.linkedIn && (
                <div className="flex items-start gap-1.5 text-[10px]">
                  <Linkedin className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {data.personalInfo.linkedIn}
                  </span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-start gap-1.5 text-[10px]">
                  <Globe className="w-3 h-3 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {data.personalInfo.website}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-gray-600 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-[11px]">
                      {edu.degree || "Degree"}
                    </div>
                    <div className="text-gray-300 text-[10px]">
                      {edu.institution || "Institution"}
                    </div>
                    {edu.year && (
                      <div className="text-gray-400 text-[9px]">{edu.year}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider mb-2 border-b border-gray-600 pb-1">
                Skills
              </h2>
              <div className="space-y-0.5">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="text-[10px] text-gray-300">
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 bg-white p-4 text-gray-800">
        <div className="space-y-5">
          {/* Profile/Summary */}
          {data.summary && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 border-b-2 border-gray-800 pb-1">
                Profile
              </h2>
              <p className="text-[10px] leading-relaxed text-gray-700 mt-1">
                {data.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {data.experience.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 border-b-2 border-gray-800 pb-1">
                Professional Experience
              </h2>
              <div className="space-y-3">
                {data.experience.map((exp, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex-1">
                        <h3 className="font-bold text-[11px]">
                          {exp.position || "Position"}
                        </h3>
                        <div className="text-[10px] text-gray-600 italic">
                          {exp.company || "Company"}
                        </div>
                      </div>
                      <div className="text-[9px] text-gray-500 ml-2 flex-shrink-0">
                        {formatDate(exp.startDate) || "Start"} -{" "}
                        {exp.current
                          ? "Present"
                          : formatDate(exp.endDate) || "End"}
                      </div>
                    </div>
                    {exp.description && (
                      <div className="text-[10px] text-gray-700 mt-1.5 space-y-0.5">
                        {exp.description
                          .split(/[.!?]+/)
                          .filter((s) => s.trim())
                          .slice(0, 4)
                          .map((sentence, i) => (
                            <div key={i} className="pl-2">
                              • {sentence.trim()}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modern Two-Column Preview Component (Full width header, two columns below)
function ModernTwoColumnPreview({
  data,
  formatDate,
}: {
  data: ResumeData;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="space-y-4 -m-8">
      {/* Header spanning full width */}
      <div className="bg-gray-800 text-white p-6">
        <h1 className="text-3xl font-bold uppercase mb-1">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-sm text-gray-300">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.email && data.personalInfo.phone && (
            <span className="mx-2">•</span>
          )}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && (
            <>
              <span className="mx-2">•</span>
              <span>{data.personalInfo.location}</span>
            </>
          )}
        </div>
      </div>

      <div className="px-6 pb-6">
        {/* Summary */}
        {data.summary && (
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase tracking-widest mb-2 text-gray-700">
              Professional Summary
            </h2>
            <p className="text-sm leading-relaxed text-gray-700">
              {data.summary}
            </p>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column - Experience */}
          <div className="space-y-4">
            {data.experience.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700 border-b border-gray-300 pb-1">
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {data.experience.map((exp, idx) => (
                    <div
                      key={idx}
                      className="relative pl-4 border-l-2 border-gray-300"
                    >
                      <div className="absolute -left-2 top-0 w-3 h-3 bg-gray-800 rounded-full"></div>
                      <div className="mb-2">
                        <h3 className="font-bold text-sm">
                          {exp.position || "Position"}
                        </h3>
                        <div className="text-xs text-gray-600">
                          {exp.company || "Company"}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(exp.startDate) || "Start"} -{" "}
                          {exp.current
                            ? "Present"
                            : formatDate(exp.endDate) || "End"}
                        </div>
                      </div>
                      {exp.description && (
                        <p className="text-xs text-gray-700 leading-relaxed">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Education & Skills */}
          <div className="space-y-4">
            {data.education.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700 border-b border-gray-300 pb-1">
                  Education
                </h2>
                <div className="space-y-3">
                  {data.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="font-semibold text-sm">
                        {edu.degree || "Degree"}
                      </div>
                      <div className="text-xs text-gray-600">
                        {edu.institution || "Institution"}
                      </div>
                      {(edu.year || edu.grade) && (
                        <div className="text-xs text-gray-500 mt-1">
                          {edu.year}
                          {edu.year && edu.grade && " • "}
                          {edu.grade}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.skills.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-700 border-b border-gray-300 pb-1">
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Minimal Preview Component (Beige color scheme, circular profile picture placeholder)
function ModernMinimalPreview({
  data,
  formatDate,
}: {
  data: ResumeData;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="flex h-full -m-8 bg-[#f5f1eb]">
      {/* Left Sidebar - Beige */}
      <div className="w-[35%] bg-[#e8ddd4] p-4">
        <div className="space-y-5">
          {/* Profile Picture Placeholder */}
          <div className="w-20 h-20 bg-white rounded-full mx-auto mb-3 border-4 border-[#f5f1eb] flex items-center justify-center">
            <div className="text-gray-400 text-[10px] text-center">Photo</div>
          </div>

          {/* Name */}
          <div className="text-center">
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {data.personalInfo.fullName.split(" ")[0] || "Your"}
            </h1>
            <h1 className="text-base font-bold text-gray-900 leading-tight">
              {data.personalInfo.fullName.split(" ").slice(1).join(" ") ||
                "Name"}
            </h1>
            <div className="text-[10px] text-gray-700 mt-1">
              {data.personalInfo.email || "Title"}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-800 border-b border-gray-400 pb-1">
              Contact
            </h2>
            <div className="space-y-1.5">
              {data.personalInfo.phone && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                  <Phone className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="break-words">{data.personalInfo.phone}</span>
                </div>
              )}
              {data.personalInfo.email && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                  <Mail className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="break-words">{data.personalInfo.email}</span>
                </div>
              )}
              {data.personalInfo.location && (
                <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                  <MapPin className="w-3 h-3 text-gray-600 flex-shrink-0" />
                  <span className="break-words">
                    {data.personalInfo.location}
                  </span>
                </div>
              )}
              {data.personalInfo.website && (
                <div className="flex items-start gap-1.5 text-[10px] text-gray-700">
                  <Globe className="w-3 h-3 text-gray-600 flex-shrink-0 mt-0.5" />
                  <span className="break-words">
                    {data.personalInfo.website}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          {data.education.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-800 border-b border-gray-400 pb-1">
                Education
              </h2>
              <div className="space-y-2">
                {data.education.map((edu, idx) => (
                  <div key={idx}>
                    <div className="font-semibold text-[11px] text-gray-900">
                      {edu.degree || "Degree"}
                    </div>
                    <div className="text-gray-600 italic text-[10px]">
                      ({edu.year || "Year"})
                    </div>
                    <div className="text-gray-700 text-[10px]">
                      {edu.institution || "Institution"}
                    </div>
                    {edu.grade && (
                      <div className="text-gray-600 text-[9px]">
                        GPA: {edu.grade}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {data.skills.length > 0 && (
            <div>
              <h2 className="text-[10px] font-bold uppercase tracking-wider mb-1.5 text-gray-800 border-b border-gray-400 pb-1">
                Skill
              </h2>
              <div className="space-y-0.5">
                {data.skills.map((skill, idx) => (
                  <div key={idx} className="text-[10px] text-gray-700">
                    • {skill}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Content - Light Beige */}
      <div className="flex-1 bg-[#f5f1eb] p-4">
        <div className="space-y-5">
          {/* Profile */}
          {data.summary && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-1.5 text-gray-800 border-b border-dashed border-gray-400 pb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mr-1.5"></span>
                Profile
              </h2>
              <p className="text-[10px] leading-relaxed text-gray-700 mt-1.5">
                {data.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {data.experience.length > 0 && (
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-wider mb-2.5 text-gray-800 border-b border-dashed border-gray-400 pb-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-gray-800 rounded-full mr-1.5"></span>
                Work Experience
              </h2>
              <div className="space-y-3">
                {data.experience.map((exp, idx) => (
                  <div key={idx}>
                    <h3 className="font-bold text-[11px] text-gray-900">
                      {exp.position || "Position"}
                    </h3>
                    <div className="text-[10px] text-gray-600 italic">
                      {exp.company || "Company"} (
                      {formatDate(exp.startDate) || "Start"} -{" "}
                      {exp.current
                        ? "present"
                        : formatDate(exp.endDate) || "End"}
                      )
                    </div>
                    {exp.description && (
                      <div className="text-[10px] text-gray-700 mt-1.5 space-y-0.5">
                        {exp.description
                          .split(/[.!?]+/)
                          .filter((s) => s.trim())
                          .map((sentence, i) => (
                            <div key={i} className="pl-2">
                              • {sentence.trim()}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modern Design Preview Component (Legacy - keeping for backward compatibility)
function ModernPreview({
  data,
  formatDate,
}: {
  data: ResumeData;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="space-y-5">
      {/* Header with accent */}
      <div className="bg-[#336699] text-white p-6 -m-8 mb-4 rounded-t-lg">
        <h1 className="text-2xl font-bold mb-2">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-sm space-y-1">
          {data.personalInfo.email && <div>{data.personalInfo.email}</div>}
          {data.personalInfo.phone && <div>{data.personalInfo.phone}</div>}
          {data.personalInfo.location && (
            <div>{data.personalInfo.location}</div>
          )}
          <div className="flex gap-3 mt-2">
            {data.personalInfo.linkedIn && (
              <span className="text-xs">
                LinkedIn: {data.personalInfo.linkedIn}
              </span>
            )}
            {data.personalInfo.website && (
              <span className="text-xs">
                Website: {data.personalInfo.website}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-base font-bold text-[#336699] mb-2 uppercase tracking-wide">
            Professional Summary
          </h2>
          <p className="text-gray-700 leading-relaxed">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[#336699] mb-3 uppercase tracking-wide">
            Professional Experience
          </h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {exp.position || "Position"}
                    </h3>
                    <div className="text-sm text-gray-600">
                      {exp.company || "Company"}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(exp.startDate) || "Start"} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                  </div>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[#336699] mb-3 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-3">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <h3 className="font-semibold text-gray-900">
                  {edu.degree || "Degree"}
                </h3>
                <div className="text-sm text-gray-600">
                  {edu.institution || "Institution"}
                  {edu.year && ` • ${edu.year}`}
                  {edu.grade && ` • ${edu.grade}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-[#336699] mb-3 uppercase tracking-wide">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill, idx) => (
              <span
                key={idx}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Classic Design Preview Component
function ClassicPreview({
  data,
  formatDate,
}: {
  data: ResumeData;
  formatDate: (date: string) => string;
}) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center border-b-2 border-black pb-3">
        <h1 className="text-lg font-bold mb-1.5">
          {data.personalInfo.fullName || "Your Name"}
        </h1>
        <div className="text-[10px] text-gray-700">
          {data.personalInfo.email && <span>{data.personalInfo.email}</span>}
          {data.personalInfo.phone && <span className="mx-1.5">|</span>}
          {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
          {data.personalInfo.location && <span className="mx-1.5">|</span>}
          {data.personalInfo.location && (
            <span>{data.personalInfo.location}</span>
          )}
          {data.personalInfo.linkedIn && (
            <>
              <span className="mx-1.5">|</span>
              <span>LinkedIn: {data.personalInfo.linkedIn}</span>
            </>
          )}
          {data.personalInfo.website && (
            <>
              <span className="mx-1.5">|</span>
              <span>Website: {data.personalInfo.website}</span>
            </>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div>
          <h2 className="text-[11px] font-bold text-black mb-1.5 uppercase tracking-wide border-b border-gray-300 pb-1">
            Professional Summary
          </h2>
          <p className="text-[10px] text-gray-700 leading-relaxed mt-1.5">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold text-black mb-2.5 uppercase tracking-wide border-b border-gray-300 pb-1">
            Professional Experience
          </h2>
          <div className="space-y-3 mt-2">
            {data.experience.map((exp, idx) => (
              <div key={idx} className="pl-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h3 className="font-bold text-[11px] text-gray-900">
                      {exp.position || "Position"}
                    </h3>
                    <div className="text-[10px] text-gray-700">
                      {exp.company || "Company"}
                    </div>
                  </div>
                  <div className="text-[9px] text-gray-600 ml-2 flex-shrink-0">
                    {formatDate(exp.startDate) || "Start"} -{" "}
                    {exp.current ? "Present" : formatDate(exp.endDate) || "End"}
                  </div>
                </div>
                {exp.description && (
                  <div className="text-[10px] text-gray-700 mt-1.5 leading-relaxed">
                    {exp.description
                      .split(/[.!?]+/)
                      .filter((s) => s.trim())
                      .map((sentence, i) => (
                        <div key={i} className="ml-3">
                          • {sentence.trim()}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold text-black mb-2.5 uppercase tracking-wide border-b border-gray-300 pb-1">
            Education
          </h2>
          <div className="space-y-2 mt-2 pl-3">
            {data.education.map((edu, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-[11px] text-gray-900">
                  {edu.degree || "Degree"}
                </h3>
                <div className="text-[10px] text-gray-700">
                  {edu.institution || "Institution"}
                  {edu.year && `, ${edu.year}`}
                  {edu.grade && ` - ${edu.grade}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div>
          <h2 className="text-[11px] font-bold text-black mb-2.5 uppercase tracking-wide border-b border-gray-300 pb-1">
            Skills
          </h2>
          <div className="grid grid-cols-3 gap-1.5 mt-2 pl-3">
            {data.skills.map((skill, idx) => (
              <div key={idx} className="text-[10px] text-gray-700">
                • {skill}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ResumeBuilder() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading resume builder...</p>
          </div>
        </div>
      }
    >
      <ResumeBuilderContent />
    </Suspense>
  );
}
