'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, FileText, Zap, Copy, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AISummarizer() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState('');
  const [summaryType, setSummaryType] = useState('bullet');
  const [summaryLength, setSummaryLength] = useState('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [wordCount, setWordCount] = useState(0);

  const handleInputChange = (value: string) => {
    setInputText(value);
    setWordCount(value.trim().split(/\s+/).filter(word => word.length > 0).length);
  };

  const generateSummary = async () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock AI summary generation based on parameters
    const mockSummaries = {
      bullet: {
        short: `• Key findings from the provided text
• Main arguments and supporting evidence presented
• Critical conclusions and recommendations`,
        medium: `• The text presents several important concepts and findings
• Key stakeholders and their roles are clearly defined
• Multiple perspectives on the topic are discussed and analyzed
• Practical implications and applications are outlined
• Recommendations for future action or consideration are provided`,
        long: `• Comprehensive analysis of the main topic with detailed exploration of key themes
• Identification of primary stakeholders, their motivations, and interconnected relationships
• In-depth examination of multiple viewpoints and contrasting perspectives on the subject matter
• Detailed discussion of methodologies, approaches, and frameworks used in the analysis
• Thorough evaluation of evidence, data sources, and supporting documentation
• Clear articulation of practical implications, real-world applications, and potential impact
• Strategic recommendations for implementation, future research, and policy considerations`
      },
      paragraph: {
        short: `This text covers the main points and presents key findings that are relevant to the topic. The content provides essential information and draws important conclusions.`,
        medium: `The provided text presents a comprehensive overview of the subject matter, highlighting key findings and important considerations. The content explores various aspects of the topic, discussing relevant stakeholders, methodologies, and implications. The analysis provides valuable insights and practical recommendations for moving forward.`,
        long: `The text provides an extensive analysis of the subject matter, offering detailed insights into multiple facets of the topic. It presents comprehensive findings based on thorough research and analysis, examining various perspectives and approaches. The content discusses the roles and responsibilities of key stakeholders, evaluates different methodologies and frameworks, and considers both immediate and long-term implications. The analysis concludes with practical recommendations and actionable insights that can be applied in real-world scenarios, making it a valuable resource for decision-making and future planning.`
      },
      executive: {
        short: `**Executive Summary**
Key findings indicate significant opportunities for improvement. Immediate action recommended based on analysis.`,
        medium: `**Executive Summary**

**Overview:** The analysis reveals important insights across multiple dimensions of the topic.

**Key Findings:** Several critical factors have been identified that impact overall outcomes and performance.

**Recommendations:** Strategic actions are recommended to address identified challenges and capitalize on opportunities.

**Next Steps:** Implementation should begin immediately with focus on high-priority initiatives.`,
        long: `**Executive Summary**

**Executive Overview:** This comprehensive analysis examines critical aspects of the subject matter, providing actionable insights for strategic decision-making.

**Key Findings:** The research has identified several significant factors that directly impact outcomes, including stakeholder dynamics, operational efficiencies, and market conditions.

**Strategic Implications:** The findings suggest both immediate opportunities and long-term considerations that require attention from leadership and key stakeholders.

**Recommendations:** A multi-phase approach is recommended, prioritizing high-impact initiatives while building foundation for sustainable long-term success.

**Implementation Timeline:** Immediate action items should be addressed within the next quarter, with ongoing monitoring and adjustment based on emerging results and market conditions.

**Resource Requirements:** Successful implementation will require dedicated resources, cross-functional collaboration, and executive sponsorship.`
      }
    };
    
    const selectedSummary = mockSummaries[summaryType as keyof typeof mockSummaries][summaryLength as keyof typeof mockSummaries.bullet];
    setSummary(selectedSummary);
    setIsLoading(false);
  };

  const copySummary = async () => {
    await navigator.clipboard.writeText(summary);
  };

  const downloadSummary = () => {
    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'summary.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetSummarizer = () => {
    setInputText('');
    setSummary('');
    setWordCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">AI Summarizer</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <span>Input Text</span>
              </CardTitle>
              <CardDescription>
                Paste your text here and let AI create a concise summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Text Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="input-text">Text to Summarize</Label>
                  <Badge variant="secondary" className="text-xs">
                    {wordCount} words
                  </Badge>
                </div>
                <Textarea
                  id="input-text"
                  placeholder="Paste your article, document, or any text you want to summarize..."
                  value={inputText}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="min-h-[300px] resize-none"
                />
              </div>

              {/* Summary Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Summary Type</Label>
                  <Select value={summaryType} onValueChange={setSummaryType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bullet">Bullet Points</SelectItem>
                      <SelectItem value="paragraph">Paragraph</SelectItem>
                      <SelectItem value="executive">Executive Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Summary Length</Label>
                  <Select value={summaryLength} onValueChange={setSummaryLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={generateSummary} 
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading || !inputText.trim()}
                >
                  {isLoading ? (
                    <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Generating...' : 'Generate Summary'}
                </Button>
                <Button variant="outline" onClick={resetSummarizer}>
                  Reset
                </Button>
              </div>

              {wordCount > 0 && (
                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    {wordCount < 50 
                      ? 'For best results, provide at least 50 words of text.'
                      : `Ready to summarize ${wordCount} words of content.`
                    }
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Output Section */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-purple-600" />
                <span>AI Summary</span>
              </CardTitle>
              <CardDescription>
                {summary ? 'Your generated summary' : 'Summary will appear here after processing'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-gray-600">AI is analyzing and summarizing your text...</p>
                  </div>
                </div>
              ) : summary ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Generated Summary</Label>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={copySummary}>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={downloadSummary}>
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg border min-h-[300px]">
                      <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                        {summary}
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {Math.round((wordCount - summary.split(' ').length) / wordCount * 100)}%
                      </div>
                      <div className="text-sm text-gray-600">Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {summary.split(' ').length}
                      </div>
                      <div className="text-sm text-gray-600">Words</div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-500">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter text and click "Generate Summary" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-12">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>AI Summarizer Features</CardTitle>
              <CardDescription>
                Powerful text summarization with multiple output formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">AI-Powered</h3>
                  <p className="text-sm text-gray-600">Advanced AI algorithms understand context and extract key information</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Multiple Formats</h3>
                  <p className="text-sm text-gray-600">Choose from bullet points, paragraphs, or executive summaries</p>
                </div>
                <div className="text-center p-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Fast Processing</h3>
                  <p className="text-sm text-gray-600">Get comprehensive summaries in seconds, not minutes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}