'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Download, Eye, Star, Globe, Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CVTemplate {
  id: string;
  name: string;
  description: string;
  country: string;
  industry: string[];
  style: 'modern' | 'classic' | 'creative' | 'minimal';
  rating: number;
  downloads: number;
  preview: string;
  features: string[];
  sections: string[];
}

const cvTemplates: CVTemplate[] = [
  {
    id: 'uk-professional',
    name: 'UK Professional',
    description: 'Traditional British CV format perfect for corporate roles',
    country: 'United Kingdom',
    industry: ['Finance', 'Consulting', 'Legal', 'Corporate'],
    style: 'classic',
    rating: 4.8,
    downloads: 15420,
    preview: '/templates/uk-professional.jpg',
    features: ['2 pages', 'Professional layout', 'Skills section', 'References'],
    sections: ['Personal Details', 'Professional Summary', 'Work Experience', 'Education', 'Skills', 'References']
  },
  {
    id: 'us-modern',
    name: 'US Modern Resume',
    description: 'Contemporary American resume format with clean design',
    country: 'United States',
    industry: ['Technology', 'Marketing', 'Healthcare', 'Education'],
    style: 'modern',
    rating: 4.9,
    downloads: 23150,
    preview: '/templates/us-modern.jpg',
    features: ['1 page', 'ATS-friendly', 'Modern design', 'Objective statement'],
    sections: ['Contact Info', 'Objective', 'Experience', 'Education', 'Skills', 'Achievements']
  },
  {
    id: 'german-technical',
    name: 'German Technical CV',
    description: 'Detailed German CV format ideal for engineering and technical roles',
    country: 'Germany',
    industry: ['Engineering', 'Technology', 'Manufacturing', 'Research'],
    style: 'classic',
    rating: 4.7,
    downloads: 8930,
    preview: '/templates/german-technical.jpg',
    features: ['2-3 pages', 'Photo included', 'Detailed format', 'Chronological'],
    sections: ['Personal Data', 'Photo', 'Professional Experience', 'Education', 'Skills', 'Languages', 'Hobbies']
  },
  {
    id: 'french-elegant',
    name: 'French Elegant CV',
    description: 'Sophisticated French CV with elegant typography',
    country: 'France',
    industry: ['Fashion', 'Luxury', 'Arts', 'Hospitality'],
    style: 'creative',
    rating: 4.6,
    downloads: 12340,
    preview: '/templates/french-elegant.jpg',
    features: ['1-2 pages', 'Photo section', 'Elegant design', 'Personal interests'],
    sections: ['État Civil', 'Photo', 'Expérience Professionnelle', 'Formation', 'Compétences', 'Centres d\'intérêt']
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic Minimal',
    description: 'Clean Scandinavian design perfect for Nordic countries',
    country: 'Sweden/Norway/Denmark',
    industry: ['Design', 'Sustainability', 'Technology', 'Consulting'],
    style: 'minimal',
    rating: 4.8,
    downloads: 9870,
    preview: '/templates/nordic-minimal.jpg',
    features: ['1 page', 'Minimal design', 'Clean layout', 'Focus on content'],
    sections: ['Personal Information', 'Profile', 'Work Experience', 'Education', 'Skills', 'Languages']
  },
  {
    id: 'australian-standard',
    name: 'Australian Standard',
    description: 'Standard Australian CV format for various industries',
    country: 'Australia',
    industry: ['Mining', 'Agriculture', 'Tourism', 'Healthcare'],
    style: 'classic',
    rating: 4.5,
    downloads: 7650,
    preview: '/templates/australian-standard.jpg',
    features: ['2 pages', 'No photo', 'Skills focus', 'Referees'],
    sections: ['Personal Details', 'Career Objective', 'Key Skills', 'Employment History', 'Education', 'Referees']
  },
  {
    id: 'canadian-bilingual',
    name: 'Canadian Bilingual',
    description: 'Bilingual Canadian resume format (English/French)',
    country: 'Canada',
    industry: ['Government', 'Education', 'Healthcare', 'Technology'],
    style: 'modern',
    rating: 4.7,
    downloads: 11200,
    preview: '/templates/canadian-bilingual.jpg',
    features: ['1-2 pages', 'Bilingual ready', 'Professional', 'Skills-based'],
    sections: ['Contact Information', 'Professional Summary', 'Core Competencies', 'Professional Experience', 'Education', 'Languages']
  },
  {
    id: 'dutch-creative',
    name: 'Dutch Creative',
    description: 'Creative Dutch CV perfect for design and creative industries',
    country: 'Netherlands',
    industry: ['Design', 'Advertising', 'Media', 'Arts'],
    style: 'creative',
    rating: 4.9,
    downloads: 6540,
    preview: '/templates/dutch-creative.jpg',
    features: ['1 page', 'Creative layout', 'Portfolio links', 'Visual elements'],
    sections: ['Persoonlijke Gegevens', 'Profiel', 'Werkervaring', 'Opleiding', 'Vaardigheden', 'Portfolio']
  }
];

const countries = [
  'All Countries',
  'United Kingdom',
  'United States',
  'Germany',
  'France',
  'Sweden/Norway/Denmark',
  'Australia',
  'Canada',
  'Netherlands'
];

const industries = [
  'All Industries',
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Engineering',
  'Design',
  'Marketing',
  'Legal',
  'Consulting'
];

const styles = [
  'All Styles',
  'modern',
  'classic',
  'creative',
  'minimal'
];

export default function CVTemplates() {
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedIndustry, setSelectedIndustry] = useState('All Industries');
  const [selectedStyle, setSelectedStyle] = useState('All Styles');
  const [previewTemplate, setPreviewTemplate] = useState<CVTemplate | null>(null);

  const filteredTemplates = cvTemplates.filter(template => {
    const countryMatch = selectedCountry === 'All Countries' || template.country === selectedCountry;
    const industryMatch = selectedIndustry === 'All Industries' || template.industry.includes(selectedIndustry);
    const styleMatch = selectedStyle === 'All Styles' || template.style === selectedStyle;
    return countryMatch && industryMatch && styleMatch;
  });

  const downloadTemplate = (template: CVTemplate) => {
    // In a real app, this would download the actual template file
    alert(`Downloading ${template.name} template...`);
  };

  const previewTemplateHandler = (template: CVTemplate) => {
    setPreviewTemplate(template);
  };

  const closePreview = () => {
    setPreviewTemplate(null);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">CV Templates</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Professional CV Templates</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose from country-specific CV templates designed for different industries and career levels. 
              All templates are professionally designed and ATS-friendly.
            </p>
          </div>

          {/* Filters */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Filter Templates</CardTitle>
              <CardDescription>Find the perfect CV template for your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Industry</label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Style</label>
                  <Select value={selectedStyle} onValueChange={setSelectedStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styles.map(style => (
                        <SelectItem key={style} value={style}>
                          {style === 'All Styles' ? style : style.charAt(0).toUpperCase() + style.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Showing {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''}
            </p>
            <div className="text-sm text-muted-foreground">
              Total downloads: {cvTemplates.reduce((sum, template) => sum + template.downloads, 0).toLocaleString()}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="shadow-lg border-0 hover:shadow-xl transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{template.country}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{template.rating}</span>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Preview Image Placeholder */}
                  <div className="aspect-[3/4] bg-accent rounded-lg flex items-center justify-center border">
                    <div className="text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">CV Preview</p>
                    </div>
                  </div>

                  {/* Template Info */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Industries</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.industry.slice(0, 3).map((industry) => (
                          <Badge key={industry} variant="secondary" className="text-xs">
                            {industry}
                          </Badge>
                        ))}
                        {template.industry.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.industry.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Features</h4>
                      <div className="space-y-1">
                        {template.features.slice(0, 2).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <div className="w-1.5 h-1.5 bg-background0 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{template.downloads.toLocaleString()} downloads</span>
                      <Badge 
                        variant={template.style === 'modern' ? 'default' : 
                                template.style === 'creative' ? 'destructive' :
                                template.style === 'minimal' ? 'outline' : 'secondary'}
                        className="text-xs"
                      >
                        {template.style}
                      </Badge>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => previewTemplateHandler(template)}
                      className="flex-1"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => downloadTemplate(template)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Results */}
          {filteredTemplates.length === 0 && (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No templates found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your filters to see more templates</p>
                <Button 
                  onClick={() => {
                    setSelectedCountry('All Countries');
                    setSelectedIndustry('All Industries');
                    setSelectedStyle('All Styles');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}

          {/* CV Tips */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>CV Writing Tips by Country</CardTitle>
              <CardDescription>Important considerations for different regions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <span>🇺🇸</span>
                    <span>United States</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Keep to 1 page for most roles</li>
                    <li>• No photo or personal details</li>
                    <li>• Focus on achievements</li>
                    <li>• Use action verbs</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <span>🇬🇧</span>
                    <span>United Kingdom</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• 2 pages maximum</li>
                    <li>• Include personal statement</li>
                    <li>• List references</li>
                    <li>• Reverse chronological order</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center space-x-2">
                    <span>🇩🇪</span>
                    <span>Germany</span>
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Include professional photo</li>
                    <li>• Very detailed format</li>
                    <li>• Include personal information</li>
                    <li>• Attach certificates</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{previewTemplate.name}</h3>
                  <p className="text-muted-foreground">{previewTemplate.description}</p>
                </div>
                <Button variant="ghost" onClick={closePreview}>
                  ×
                </Button>
              </div>
              
              <div className="space-y-6">
                {/* Template Sections */}
                <div>
                  <h4 className="font-semibold mb-3">Template Sections</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {previewTemplate.sections.map((section, index) => (
                      <Badge key={index} variant="outline" className="justify-center">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-semibold mb-3">Features</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {previewTemplate.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 bg-background0 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preview Image Placeholder */}
                <div className="aspect-[3/4] bg-accent rounded-lg flex items-center justify-center border">
                  <div className="text-center text-muted-foreground">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Full CV Preview</p>
                    <p className="text-sm">Download to see complete template</p>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button 
                    onClick={() => downloadTemplate(previewTemplate)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Template
                  </Button>
                  <Button variant="outline" onClick={closePreview} className="flex-1">
                    Close Preview
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}