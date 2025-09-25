'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Brain, Download, Copy, RefreshCw, BarChart, TrendingUp, Users, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

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
}

export default function AIReportGenerator() {
  const [reportData, setReportData] = useState<ReportData>({
    title: '',
    reportType: '',
    industry: '',
    audience: '',
    keyPoints: '',
    dataPoints: '',
    timeframe: '',
    includeCharts: true,
    includeRecommendations: true,
    includeExecutiveSummary: true
  });

  const [generatedReport, setGeneratedReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    'Business Analysis',
    'Market Research',
    'Financial Report',
    'Project Status',
    'Performance Review',
    'Competitive Analysis',
    'Risk Assessment',
    'Strategic Planning',
    'Customer Analysis',
    'Technical Report'
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Retail',
    'Manufacturing',
    'Education',
    'Real Estate',
    'Consulting',
    'Marketing',
    'Non-profit'
  ];

  const audiences = [
    'Executive Leadership',
    'Board of Directors',
    'Stakeholders',
    'Team Members',
    'Clients',
    'Investors',
    'Department Heads',
    'External Partners',
    'Regulatory Bodies',
    'General Public'
  ];

  const generateReport = async () => {
    if (!reportData.title || !reportData.reportType || !reportData.keyPoints) return;

    setIsGenerating(true);

    // Simulate AI generation delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    const report = `# ${reportData.title}

${reportData.includeExecutiveSummary ? `## Executive Summary

This ${reportData.reportType.toLowerCase()} provides a comprehensive analysis of key findings and insights for the ${reportData.timeframe || 'current period'}. The report examines critical factors affecting ${reportData.industry || 'the organization'} and presents actionable recommendations for ${reportData.audience || 'stakeholders'}.

**Key Highlights:**
- Comprehensive analysis of current market conditions
- Data-driven insights and performance metrics
- Strategic recommendations for future growth
- Risk assessment and mitigation strategies

---

` : ''}## Introduction

This report presents a detailed ${reportData.reportType.toLowerCase()} focusing on ${reportData.keyPoints}. The analysis covers the ${reportData.timeframe || 'specified timeframe'} and is designed to provide ${reportData.audience || 'stakeholders'} with actionable insights and strategic direction.

## Methodology

Our analysis employed a multi-faceted approach combining:
- Quantitative data analysis
- Market research and benchmarking
- Stakeholder interviews and surveys
- Industry best practices review
- Competitive landscape assessment

## Key Findings

### Primary Insights
${reportData.keyPoints.split('\n').map(point => point.trim() ? `- ${point.trim()}` : '').filter(Boolean).join('\n')}

### Data Analysis
${reportData.dataPoints ? `
The following data points were analyzed during this study:
${reportData.dataPoints.split('\n').map(point => point.trim() ? `- ${point.trim()}` : '').filter(Boolean).join('\n')}

**Performance Metrics:**
- Overall performance shows positive trends
- Key indicators demonstrate growth potential
- Market positioning remains competitive
- Operational efficiency has improved by 15%
` : `
Our analysis reveals several critical trends:
- Market conditions show positive momentum
- Operational metrics indicate strong performance
- Customer satisfaction levels remain high
- Growth opportunities have been identified
`}

${reportData.includeCharts ? `## Data Visualization

*[Chart 1: Performance Trends Over Time]*
This chart illustrates the key performance indicators over the ${reportData.timeframe || 'analysis period'}, showing clear upward trends in critical metrics.

*[Chart 2: Market Comparison]*
Comparative analysis against industry benchmarks demonstrates competitive positioning and areas for improvement.

*[Chart 3: Risk Assessment Matrix]*
Visual representation of identified risks plotted against probability and impact factors.

` : ''}## Analysis and Discussion

### Market Environment
The current market environment presents both opportunities and challenges. Our analysis indicates that ${reportData.industry || 'the industry'} is experiencing significant transformation driven by technological advancement and changing consumer preferences.

### Competitive Landscape
The competitive analysis reveals a dynamic marketplace with established players and emerging disruptors. Key differentiators include innovation capacity, customer service excellence, and operational efficiency.

### Performance Assessment
Current performance metrics demonstrate strong fundamentals with room for strategic improvement. The organization shows resilience and adaptability in the face of market challenges.

## Risk Assessment

### Identified Risks
1. **Market Volatility**: Economic uncertainties may impact performance
2. **Competitive Pressure**: Increased competition in key market segments
3. **Regulatory Changes**: Potential policy shifts affecting operations
4. **Technology Disruption**: Rapid technological changes requiring adaptation

### Mitigation Strategies
- Diversification of revenue streams
- Enhanced competitive intelligence
- Proactive regulatory compliance
- Investment in innovation and technology

${reportData.includeRecommendations ? `## Recommendations

Based on our comprehensive analysis, we recommend the following strategic actions:

### Short-term Actions (0-6 months)
1. **Optimize Current Operations**: Focus on efficiency improvements and cost optimization
2. **Enhance Customer Experience**: Implement customer feedback systems and service improvements
3. **Strengthen Market Position**: Increase marketing efforts in high-potential segments

### Medium-term Initiatives (6-18 months)
1. **Technology Investment**: Upgrade systems and processes for improved performance
2. **Market Expansion**: Explore new geographic or demographic markets
3. **Partnership Development**: Form strategic alliances to enhance capabilities

### Long-term Strategy (18+ months)
1. **Innovation Leadership**: Establish R&D capabilities for future growth
2. **Sustainable Practices**: Implement ESG initiatives for long-term value
3. **Digital Transformation**: Complete digital modernization across all operations

## Implementation Roadmap

### Phase 1: Foundation (Months 1-3)
- Establish project governance structure
- Secure necessary resources and budget
- Begin immediate optimization initiatives

### Phase 2: Execution (Months 4-12)
- Implement core recommendations
- Monitor progress against key metrics
- Adjust strategies based on results

### Phase 3: Optimization (Months 13-18)
- Refine and optimize implemented solutions
- Expand successful initiatives
- Prepare for long-term strategic shifts

` : ''}## Conclusion

This ${reportData.reportType.toLowerCase()} demonstrates that while challenges exist, there are significant opportunities for growth and improvement. The recommended strategies provide a clear path forward for achieving organizational objectives and maintaining competitive advantage.

Success will depend on effective implementation, continuous monitoring, and the ability to adapt to changing market conditions. Regular review and updates to this analysis will ensure continued relevance and effectiveness.

## Appendices

### Appendix A: Data Sources
- Industry reports and market research
- Internal performance data
- Stakeholder interviews
- Competitive intelligence

### Appendix B: Methodology Details
- Statistical analysis methods
- Survey design and implementation
- Interview protocols
- Data validation procedures

---

*Report generated on ${new Date().toLocaleDateString()} | Confidential and Proprietary*`;

    setGeneratedReport(report);
    setIsGenerating(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedReport);
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedReport], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${reportData.title || 'ai-generated-report'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetForm = () => {
    setReportData({
      title: '',
      reportType: '',
      industry: '',
      audience: '',
      keyPoints: '',
      dataPoints: '',
      timeframe: '',
      includeCharts: true,
      includeRecommendations: true,
      includeExecutiveSummary: true
    });
    setGeneratedReport('');
  };

  const updateField = (field: keyof ReportData, value: any) => {
    setReportData(prev => ({ ...prev, [field]: value }));
  };

  const isFormValid = () => {
    return reportData.title && reportData.reportType && reportData.keyPoints;
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
              <Brain className="w-6 h-6 text-indigo-600" />
              <h1 className="text-xl font-semibold text-gray-900">AI Report Generator</h1>
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
                  <FileText className="w-5 h-5 text-indigo-600" />
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
                      onChange={(e) => updateField('title', e.target.value)}
                      placeholder="Q4 2024 Business Performance Analysis"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Report Type *</Label>
                      <Select value={reportData.reportType} onValueChange={(value) => updateField('reportType', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select report type" />
                        </SelectTrigger>
                        <SelectContent>
                          {reportTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Industry</Label>
                      <Select value={reportData.industry} onValueChange={(value) => updateField('industry', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map(industry => (
                            <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Target Audience</Label>
                      <Select value={reportData.audience} onValueChange={(value) => updateField('audience', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select audience" />
                        </SelectTrigger>
                        <SelectContent>
                          {audiences.map(audience => (
                            <SelectItem key={audience} value={audience}>{audience}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Timeframe</Label>
                      <Input
                        value={reportData.timeframe}
                        onChange={(e) => updateField('timeframe', e.target.value)}
                        placeholder="Q4 2024, Last 6 months, etc."
                      />
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
                      onChange={(e) => updateField('keyPoints', e.target.value)}
                      placeholder="Enter key points, one per line:&#10;- Revenue growth analysis&#10;- Market share expansion&#10;- Customer satisfaction metrics&#10;- Operational efficiency improvements"
                      rows={6}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataPoints">Data Points & Metrics</Label>
                    <Textarea
                      id="dataPoints"
                      value={reportData.dataPoints}
                      onChange={(e) => updateField('dataPoints', e.target.value)}
                      placeholder="Enter specific data points:&#10;- Revenue: $2.5M (15% increase)&#10;- Customer base: 10,000 users&#10;- Market share: 25%&#10;- Satisfaction score: 4.2/5"
                      rows={4}
                    />
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
                        onCheckedChange={(checked) => updateField('includeExecutiveSummary', checked)}
                      />
                      <Label htmlFor="executiveSummary" className="text-sm">Include Executive Summary</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="charts"
                        checked={reportData.includeCharts}
                        onCheckedChange={(checked) => updateField('includeCharts', checked)}
                      />
                      <Label htmlFor="charts" className="text-sm">Include Chart Placeholders</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="recommendations"
                        checked={reportData.includeRecommendations}
                        onCheckedChange={(checked) => updateField('includeRecommendations', checked)}
                      />
                      <Label htmlFor="recommendations" className="text-sm">Include Recommendations</Label>
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
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Brain className="w-4 h-4 mr-2" />
                    )}
                    {isGenerating ? 'Generating Report...' : 'Generate Report'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>

                {!isFormValid() && (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      Please fill in the required fields: Report Title, Report Type, and Key Points.
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
                  <BarChart className="w-5 h-5 text-indigo-600" />
                  <span>Generated Report</span>
                </CardTitle>
                <CardDescription>
                  {generatedReport ? 'Your AI-generated professional report' : 'Report will appear here after generation'}
                </CardDescription>
                {generatedReport && (
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={copyToClipboard}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </Button>
                    <Button size="sm" onClick={downloadReport} variant="outline">
                      <Download className="w-3 h-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600">AI is generating your professional report...</p>
                      <p className="text-sm text-gray-500">This may take a few moments</p>
                    </div>
                  </div>
                ) : generatedReport ? (
                  <div className="bg-white p-6 rounded-lg border shadow-sm max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
                      {generatedReport}
                    </pre>
                  </div>
                ) : (
                  <div className="py-12 text-center text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Configure your report and click "Generate Report" to get started</p>
                    <p className="text-sm">AI will create a comprehensive professional report based on your inputs</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Features Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>AI Report Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">AI-Powered</h4>
                      <p className="text-xs text-gray-600">Advanced AI generates professional content</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Customizable</h4>
                      <p className="text-xs text-gray-600">Tailored to your industry and audience</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Professional</h4>
                      <p className="text-xs text-gray-600">Business-ready format and structure</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Multi-Purpose</h4>
                      <p className="text-xs text-gray-600">Various report types and formats</p>
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