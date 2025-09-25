'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, User, Building, Briefcase, Download, Copy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CoverLetterData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
  };
  jobInfo: {
    position: string;
    company: string;
    hiringManager: string;
    jobSource: string;
  };
  experience: {
    currentRole: string;
    yearsExperience: string;
    keySkills: string;
    achievements: string;
  };
  motivation: {
    whyCompany: string;
    whyRole: string;
    contribution: string;
  };
}

export default function CoverLetterGenerator() {
  const [coverLetterData, setCoverLetterData] = useState<CoverLetterData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: ''
    },
    jobInfo: {
      position: '',
      company: '',
      hiringManager: '',
      jobSource: ''
    },
    experience: {
      currentRole: '',
      yearsExperience: '',
      keySkills: '',
      achievements: ''
    },
    motivation: {
      whyCompany: '',
      whyRole: '',
      contribution: ''
    }
  });

  const [generatedLetter, setGeneratedLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [template, setTemplate] = useState('professional');

  const updatePersonalInfo = (field: keyof CoverLetterData['personalInfo'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateJobInfo = (field: keyof CoverLetterData['jobInfo'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      jobInfo: { ...prev.jobInfo, [field]: value }
    }));
  };

  const updateExperience = (field: keyof CoverLetterData['experience'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      experience: { ...prev.experience, [field]: value }
    }));
  };

  const updateMotivation = (field: keyof CoverLetterData['motivation'], value: string) => {
    setCoverLetterData(prev => ({
      ...prev,
      motivation: { ...prev.motivation, [field]: value }
    }));
  };

  const generateCoverLetter = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { personalInfo, jobInfo, experience, motivation } = coverLetterData;
    
    const templates = {
      professional: `${personalInfo.fullName}
${personalInfo.email} | ${personalInfo.phone}
${personalInfo.address}

${new Date().toLocaleDateString()}

${jobInfo.hiringManager ? `${jobInfo.hiringManager}` : 'Hiring Manager'}
${jobInfo.company}

Dear ${jobInfo.hiringManager ? jobInfo.hiringManager : 'Hiring Manager'},

I am writing to express my strong interest in the ${jobInfo.position} position at ${jobInfo.company}. ${jobInfo.jobSource ? `I discovered this opportunity through ${jobInfo.jobSource} and` : ''} I am excited about the possibility of contributing to your team.

With ${experience.yearsExperience} years of experience as a ${experience.currentRole}, I have developed strong expertise in ${experience.keySkills}. In my current role, I have successfully ${experience.achievements}, which I believe directly aligns with the requirements for this position.

What particularly attracts me to ${jobInfo.company} is ${motivation.whyCompany}. I am especially drawn to this ${jobInfo.position} role because ${motivation.whyRole}. I am confident that I can contribute to your team by ${motivation.contribution}.

I would welcome the opportunity to discuss how my background and enthusiasm can benefit ${jobInfo.company}. Thank you for considering my application. I look forward to hearing from you soon.

Sincerely,
${personalInfo.fullName}`,

      creative: `Hello ${jobInfo.hiringManager ? jobInfo.hiringManager : 'there'}!

I'm ${personalInfo.fullName}, and I'm thrilled to apply for the ${jobInfo.position} position at ${jobInfo.company}. ${jobInfo.jobSource ? `I came across this amazing opportunity on ${jobInfo.jobSource}, and` : ''} I knew immediately that this was the perfect fit for me.

Here's what I bring to the table: ${experience.yearsExperience} years of hands-on experience as a ${experience.currentRole}, where I've mastered ${experience.keySkills}. But here's what makes me different – ${experience.achievements}. This isn't just work for me; it's my passion.

Why ${jobInfo.company}? Simple. ${motivation.whyCompany} Your company's vision resonates with my own values, and I see this ${jobInfo.position} role as the perfect opportunity to ${motivation.whyRole}.

I'm not just looking for any job – I'm looking for the right opportunity to make a real impact. I believe I can help ${jobInfo.company} by ${motivation.contribution}, and I'm excited to show you exactly how.

Let's chat! I'd love to discuss how we can work together to achieve great things.

Best regards,
${personalInfo.fullName}
${personalInfo.email} | ${personalInfo.phone}`,

      formal: `${personalInfo.fullName}
${personalInfo.address}
${personalInfo.email}
${personalInfo.phone}

${new Date().toLocaleDateString()}

${jobInfo.hiringManager ? `${jobInfo.hiringManager}` : 'Hiring Manager'}
${jobInfo.company}

Subject: Application for ${jobInfo.position} Position

Dear Sir/Madam,

I am writing to formally apply for the ${jobInfo.position} position advertised at ${jobInfo.company}. ${jobInfo.jobSource ? `I learned of this opportunity through ${jobInfo.jobSource}.` : ''}

I possess ${experience.yearsExperience} years of professional experience in the capacity of ${experience.currentRole}. My core competencies include ${experience.keySkills}. During my tenure in previous roles, I have demonstrated my capabilities through ${experience.achievements}.

My interest in ${jobInfo.company} stems from ${motivation.whyCompany}. The ${jobInfo.position} position particularly appeals to me because ${motivation.whyRole}. I am confident that my professional background enables me to ${motivation.contribution}.

I would be honored to discuss my qualifications in greater detail at your convenience. I thank you for your time and consideration of my application.

Yours faithfully,
${personalInfo.fullName}`
    };
    
    setGeneratedLetter(templates[template as keyof typeof templates]);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedLetter);
  };

  const downloadLetter = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedLetter], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${coverLetterData.jobInfo.position || 'position'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetForm = () => {
    setCoverLetterData({
      personalInfo: { fullName: '', email: '', phone: '', address: '' },
      jobInfo: { position: '', company: '', hiringManager: '', jobSource: '' },
      experience: { currentRole: '', yearsExperience: '', keySkills: '', achievements: '' },
      motivation: { whyCompany: '', whyRole: '', contribution: '' }
    });
    setGeneratedLetter('');
  };

  const isFormValid = () => {
    const { personalInfo, jobInfo, experience, motivation } = coverLetterData;
    return personalInfo.fullName && personalInfo.email && 
           jobInfo.position && jobInfo.company && 
           experience.currentRole && experience.keySkills &&
           motivation.whyCompany && motivation.whyRole;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">Cover Letter Generator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="space-y-6">
            {/* Personal Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Personal Information</span>
                </CardTitle>
                <CardDescription>
                  Your contact details and basic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={coverLetterData.personalInfo.fullName}
                      onChange={(e) => updatePersonalInfo('fullName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={coverLetterData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={coverLetterData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={coverLetterData.personalInfo.address}
                      onChange={(e) => updatePersonalInfo('address', e.target.value)}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Job Information */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building className="w-5 h-5 text-indigo-600" />
                  <span>Job Information</span>
                </CardTitle>
                <CardDescription>
                  Details about the position and company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="position">Position *</Label>
                    <Input
                      id="position"
                      value={coverLetterData.jobInfo.position}
                      onChange={(e) => updateJobInfo('position', e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company *</Label>
                    <Input
                      id="company"
                      value={coverLetterData.jobInfo.company}
                      onChange={(e) => updateJobInfo('company', e.target.value)}
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hiringManager">Hiring Manager</Label>
                    <Input
                      id="hiringManager"
                      value={coverLetterData.jobInfo.hiringManager}
                      onChange={(e) => updateJobInfo('hiringManager', e.target.value)}
                      placeholder="Jane Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobSource">Where did you find this job?</Label>
                    <Input
                      id="jobSource"
                      value={coverLetterData.jobInfo.jobSource}
                      onChange={(e) => updateJobInfo('jobSource', e.target.value)}
                      placeholder="LinkedIn, Indeed, Company website"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Experience */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  <span>Experience & Skills</span>
                </CardTitle>
                <CardDescription>
                  Your professional background and achievements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentRole">Current/Recent Role *</Label>
                    <Input
                      id="currentRole"
                      value={coverLetterData.experience.currentRole}
                      onChange={(e) => updateExperience('currentRole', e.target.value)}
                      placeholder="Senior Developer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yearsExperience">Years of Experience</Label>
                    <Input
                      id="yearsExperience"
                      value={coverLetterData.experience.yearsExperience}
                      onChange={(e) => updateExperience('yearsExperience', e.target.value)}
                      placeholder="5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keySkills">Key Skills *</Label>
                  <Textarea
                    id="keySkills"
                    value={coverLetterData.experience.keySkills}
                    onChange={(e) => updateExperience('keySkills', e.target.value)}
                    placeholder="JavaScript, React, Node.js, Python, project management..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="achievements">Key Achievements</Label>
                  <Textarea
                    id="achievements"
                    value={coverLetterData.experience.achievements}
                    onChange={(e) => updateExperience('achievements', e.target.value)}
                    placeholder="Led a team of 5 developers, increased system performance by 40%, delivered projects on time..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Motivation */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Motivation & Interest</CardTitle>
                <CardDescription>
                  Why you want this job and what you can contribute
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whyCompany">Why this company? *</Label>
                  <Textarea
                    id="whyCompany"
                    value={coverLetterData.motivation.whyCompany}
                    onChange={(e) => updateMotivation('whyCompany', e.target.value)}
                    placeholder="I admire the company's innovative approach to technology and commitment to sustainability..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whyRole">Why this role? *</Label>
                  <Textarea
                    id="whyRole"
                    value={coverLetterData.motivation.whyRole}
                    onChange={(e) => updateMotivation('whyRole', e.target.value)}
                    placeholder="This position aligns perfectly with my career goals and allows me to utilize my technical skills..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contribution">What can you contribute?</Label>
                  <Textarea
                    id="contribution"
                    value={coverLetterData.motivation.contribution}
                    onChange={(e) => updateMotivation('contribution', e.target.value)}
                    placeholder="bringing innovative solutions, improving team productivity, mentoring junior developers..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span>Cover Letter Preview</span>
                </CardTitle>
                <CardDescription>
                  {generatedLetter ? 'Your generated cover letter' : 'Fill the form to generate your cover letter'}
                </CardDescription>
                <div className="flex items-center space-x-4">
                  <div className="space-y-2">
                    <Label>Template Style</Label>
                    <Select value={template} onValueChange={setTemplate}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="creative">Creative</SelectItem>
                        <SelectItem value="formal">Formal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex space-x-2 pt-6">
                    <Button
                      onClick={generateCoverLetter}
                      disabled={isGenerating || !isFormValid()}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      {isGenerating ? 'Generating...' : 'Generate'}
                    </Button>
                    <Button variant="outline" onClick={resetForm}>
                      Reset
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {generatedLetter ? (
                  <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg border shadow-sm min-h-[500px]">
                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                        {generatedLetter}
                      </pre>
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={copyToClipboard} className="flex-1">
                        <Copy className="w-4 h-4 mr-2" />
                        Copy to Clipboard
                      </Button>
                      <Button onClick={downloadLetter} variant="outline">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Fill out the form to generate your cover letter</p>
                    <p className="text-sm">All required fields (*) must be completed</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isFormValid() && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Please fill in all required fields (*) to generate your cover letter.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}