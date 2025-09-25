'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, CheckCircle, Clock, AlertTriangle, Download, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

interface VisaStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  requirements: string[];
  tips: string[];
  status: 'pending' | 'in_progress' | 'completed';
  isOptional: boolean;
}

interface VisaProcess {
  country: string;
  visaType: string;
  totalTime: string;
  difficulty: 'easy' | 'moderate' | 'difficult';
  cost: string;
  steps: VisaStep[];
}

const visaProcesses: { [key: string]: { [key: string]: VisaProcess } } = {
  'US': {
    'tourist': {
      country: 'United States',
      visaType: 'B-1/B-2 Tourist Visa',
      totalTime: '2-8 weeks',
      difficulty: 'moderate',
      cost: '$160 + fees',
      steps: [
        {
          id: '1',
          title: 'Complete DS-160 Form',
          description: 'Fill out the online nonimmigrant visa application',
          estimatedTime: '1-2 hours',
          requirements: [
            'Valid passport',
            'Digital photo (2x2 inches)',
            'Travel itinerary',
            'Employment information'
          ],
          tips: [
            'Save your application frequently',
            'Have all documents ready before starting',
            'Use your legal name exactly as in passport'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '2',
          title: 'Pay Visa Fee',
          description: 'Pay the non-refundable visa application fee',
          estimatedTime: '15 minutes',
          requirements: [
            'Credit/debit card or bank transfer',
            'DS-160 confirmation number'
          ],
          tips: [
            'Keep payment receipt',
            'Fee is non-refundable even if visa is denied'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '3',
          title: 'Schedule Interview',
          description: 'Book appointment at US Embassy/Consulate',
          estimatedTime: '30 minutes',
          requirements: [
            'DS-160 confirmation page',
            'Fee payment receipt',
            'Valid passport'
          ],
          tips: [
            'Schedule as early as possible',
            'Check wait times for your location',
            'Bring confirmation to interview'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '4',
          title: 'Gather Supporting Documents',
          description: 'Collect all required documentation',
          estimatedTime: '1-3 days',
          requirements: [
            'Bank statements (3-6 months)',
            'Employment letter',
            'Travel itinerary',
            'Hotel reservations',
            'Return flight tickets',
            'Invitation letter (if applicable)'
          ],
          tips: [
            'Organize documents in order',
            'Bring originals and copies',
            'Translate non-English documents'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '5',
          title: 'Attend Visa Interview',
          description: 'Appear for interview at embassy/consulate',
          estimatedTime: '2-4 hours (including wait time)',
          requirements: [
            'Passport',
            'DS-160 confirmation',
            'Interview appointment letter',
            'Supporting documents',
            'Visa fee receipt'
          ],
          tips: [
            'Arrive 15 minutes early',
            'Dress professionally',
            'Be honest and concise',
            'Bring only required items'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '6',
          title: 'Wait for Processing',
          description: 'Embassy processes your application',
          estimatedTime: '3-10 business days',
          requirements: [
            'Completed interview',
            'All documents submitted'
          ],
          tips: [
            'Check status online regularly',
            'Be patient during processing',
            'Avoid making travel plans until approved'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '7',
          title: 'Collect Passport',
          description: 'Retrieve passport with visa (if approved)',
          estimatedTime: '1 day',
          requirements: [
            'Collection receipt',
            'Valid ID'
          ],
          tips: [
            'Check visa details for accuracy',
            'Note visa validity dates',
            'Make copies for travel'
          ],
          status: 'pending',
          isOptional: false
        }
      ]
    },
    'student': {
      country: 'United States',
      visaType: 'F-1 Student Visa',
      totalTime: '3-12 weeks',
      difficulty: 'difficult',
      cost: '$160 + SEVIS fee $350',
      steps: [
        {
          id: '1',
          title: 'Receive I-20 Form',
          description: 'Get I-20 from SEVP-approved school',
          estimatedTime: '1-4 weeks',
          requirements: [
            'Acceptance letter from school',
            'Financial documents',
            'Academic transcripts'
          ],
          tips: [
            'Apply to schools early',
            'Ensure school is SEVP-approved',
            'Keep I-20 safe - you\'ll need it for travel'
          ],
          status: 'pending',
          isOptional: false
        },
        {
          id: '2',
          title: 'Pay SEVIS Fee',
          description: 'Pay Student and Exchange Visitor Information System fee',
          estimatedTime: '30 minutes',
          requirements: [
            'I-20 form',
            'Credit card or bank transfer'
          ],
          tips: [
            'Pay at least 3 days before interview',
            'Keep receipt for interview',
            'Fee is separate from visa fee'
          ],
          status: 'pending',
          isOptional: false
        }
      ]
    }
  },
  'UK': {
    'tourist': {
      country: 'United Kingdom',
      visaType: 'Standard Visitor Visa',
      totalTime: '3-8 weeks',
      difficulty: 'moderate',
      cost: '£100-£822',
      steps: [
        {
          id: '1',
          title: 'Complete Online Application',
          description: 'Fill out visa application on gov.uk',
          estimatedTime: '1-2 hours',
          requirements: [
            'Valid passport',
            'Digital photo',
            'Travel details',
            'Financial information'
          ],
          tips: [
            'Save application regularly',
            'Have all information ready',
            'Use correct visa type'
          ],
          status: 'pending',
          isOptional: false
        }
      ]
    }
  },
  'CA': {
    'tourist': {
      country: 'Canada',
      visaType: 'Temporary Resident Visa',
      totalTime: '2-6 weeks',
      difficulty: 'moderate',
      cost: 'CAD $100',
      steps: [
        {
          id: '1',
          title: 'Determine Eligibility',
          description: 'Check if you need a visa or can apply for eTA',
          estimatedTime: '15 minutes',
          requirements: [
            'Valid passport',
            'Country of citizenship information'
          ],
          tips: [
            'Some countries are visa-exempt',
            'Check latest requirements',
            'eTA is faster if eligible'
          ],
          status: 'pending',
          isOptional: false
        }
      ]
    }
  }
};

export default function VisaProcessingSteps() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedVisaType, setSelectedVisaType] = useState('');
  const [currentProcess, setCurrentProcess] = useState<VisaProcess | null>(null);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [stepStatuses, setStepStatuses] = useState<{ [key: string]: 'pending' | 'in_progress' | 'completed' }>({});

  const countries = Object.keys(visaProcesses);
  const visaTypes = selectedCountry ? Object.keys(visaProcesses[selectedCountry]) : [];

  const loadProcess = () => {
    if (selectedCountry && selectedVisaType) {
      const process = visaProcesses[selectedCountry][selectedVisaType];
      setCurrentProcess(process);
      
      // Initialize step statuses
      const statuses: { [key: string]: 'pending' | 'in_progress' | 'completed' } = {};
      process.steps.forEach(step => {
        statuses[step.id] = 'pending';
      });
      setStepStatuses(statuses);
    }
  };

  const updateStepStatus = (stepId: string, status: 'pending' | 'in_progress' | 'completed') => {
    setStepStatuses(prev => ({ ...prev, [stepId]: status }));
  };

  const getCompletedSteps = () => {
    return Object.values(stepStatuses).filter(status => status === 'completed').length;
  };

  const getTotalSteps = () => {
    return currentProcess ? currentProcess.steps.length : 0;
  };

  const getProgressPercentage = () => {
    const total = getTotalSteps();
    const completed = getCompletedSteps();
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const downloadGuide = () => {
    if (!currentProcess) return;

    const content = `${currentProcess.country} ${currentProcess.visaType} - Processing Guide
Generated on: ${new Date().toLocaleDateString()}

OVERVIEW
========
Visa Type: ${currentProcess.visaType}
Country: ${currentProcess.country}
Estimated Time: ${currentProcess.totalTime}
Difficulty: ${currentProcess.difficulty}
Cost: ${currentProcess.cost}

STEP-BY-STEP PROCESS
===================

${currentProcess.steps.map((step, index) => `
STEP ${index + 1}: ${step.title}
${step.isOptional ? '(OPTIONAL)' : '(REQUIRED)'}
Estimated Time: ${step.estimatedTime}

Description:
${step.description}

Requirements:
${step.requirements.map(req => `• ${req}`).join('\n')}

Tips:
${step.tips.map(tip => `• ${tip}`).join('\n')}

${'='.repeat(50)}
`).join('')}

IMPORTANT NOTES
===============
• Processing times are estimates and may vary
• All requirements must be met for successful application
• Keep copies of all documents
• Check embassy website for latest updates
• Consider applying well in advance of travel dates

DISCLAIMER
==========
This guide is for informational purposes only. Always check official embassy/consulate websites for the most current and accurate information.`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${currentProcess.country.toLowerCase()}-${currentProcess.visaType.toLowerCase().replace(/\s+/g, '-')}-guide.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'difficult': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Visa Processing Steps</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Selection */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Select Visa Type</CardTitle>
              <CardDescription>
                Choose your destination country and visa type to see the step-by-step process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">🇺🇸 United States</SelectItem>
                      <SelectItem value="UK">🇬🇧 United Kingdom</SelectItem>
                      <SelectItem value="CA">🇨🇦 Canada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Visa Type</label>
                  <Select 
                    value={selectedVisaType} 
                    onValueChange={setSelectedVisaType}
                    disabled={!selectedCountry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      {visaTypes.map(type => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)} Visa
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={loadProcess}
                    disabled={!selectedCountry || !selectedVisaType}
                    className="w-full"
                  >
                    Load Process
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Process Overview */}
          {currentProcess && (
            <>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{currentProcess.visaType}</CardTitle>
                      <CardDescription>{currentProcess.country}</CardDescription>
                    </div>
                    <Button onClick={downloadGuide} variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Download Guide
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{currentProcess.totalTime}</div>
                      <div className="text-sm text-gray-600">Processing Time</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{currentProcess.cost}</div>
                      <div className="text-sm text-gray-600">Total Cost</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Badge className={getDifficultyColor(currentProcess.difficulty)}>
                        {currentProcess.difficulty}
                      </Badge>
                      <div className="text-sm text-gray-600 mt-2">Difficulty</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{getTotalSteps()}</div>
                      <div className="text-sm text-gray-600">Total Steps</div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{getCompletedSteps()} of {getTotalSteps()} completed</span>
                    </div>
                    <Progress value={getProgressPercentage()} className="w-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Steps */}
              <div className="space-y-4">
                {currentProcess.steps.map((step, index) => (
                  <Card key={step.id} className="shadow-lg border-0">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(stepStatuses[step.id])}
                            <span className="text-lg font-semibold">
                              Step {index + 1}: {step.title}
                            </span>
                          </div>
                          {step.isOptional && (
                            <Badge variant="outline">Optional</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Select 
                            value={stepStatuses[step.id]} 
                            onValueChange={(value: any) => updateStepStatus(step.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                          >
                            {expandedStep === step.id ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        {step.description} • Estimated time: {step.estimatedTime}
                      </CardDescription>
                    </CardHeader>
                    
                    {expandedStep === step.id && (
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Requirements</h4>
                          <ul className="space-y-1">
                            {step.requirements.map((req, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                                <span className="text-sm">{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Tips</h4>
                          <ul className="space-y-1">
                            {step.tips.map((tip, idx) => (
                              <li key={idx} className="flex items-start space-x-2">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2"></div>
                                <span className="text-sm text-gray-600">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>

              {/* Important Notes */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Important:</strong> Processing times and requirements may change. Always check the official embassy or consulate website for the most current information before applying.
                </AlertDescription>
              </Alert>
            </>
          )}

          {/* No Process Selected */}
          {!currentProcess && (
            <Card className="shadow-lg border-0">
              <CardContent className="py-12 text-center text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Select a country and visa type to see the step-by-step process</p>
                <p className="text-sm">Get detailed guidance for your visa application</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}