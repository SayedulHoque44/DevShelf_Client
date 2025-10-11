'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Car, CheckCircle, XCircle, RotateCcw, Trophy, Clock, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
}

interface TestResult {
  score: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  incorrectAnswers: number[];
}

const mockQuestions: Question[] = [
  {
    id: 1,
    question: "What is the maximum speed limit in urban areas in most EU countries?",
    options: ["30 km/h", "50 km/h", "60 km/h", "70 km/h"],
    correctAnswer: 1,
    explanation: "In most EU urban areas, the speed limit is 50 km/h unless otherwise indicated.",
    category: "Traffic Rules"
  },
  {
    id: 2,
    question: "When should you use your headlights during the day?",
    options: ["Never", "Only in tunnels", "In poor visibility conditions", "Always"],
    correctAnswer: 2,
    explanation: "Headlights should be used during the day when visibility is poor due to weather conditions.",
    category: "Vehicle Operation"
  },
  {
    id: 3,
    question: "What does a red traffic light mean?",
    options: ["Proceed with caution", "Stop completely", "Slow down", "Yield to traffic"],
    correctAnswer: 1,
    explanation: "A red traffic light means you must stop completely and wait for green.",
    category: "Traffic Signals"
  },
  {
    id: 4,
    question: "What is the minimum following distance in good weather conditions?",
    options: ["1 second", "2 seconds", "3 seconds", "5 seconds"],
    correctAnswer: 2,
    explanation: "The 3-second rule is recommended for maintaining safe following distance in good conditions.",
    category: "Safe Driving"
  },
  {
    id: 5,
    question: "When is it mandatory to wear a seatbelt?",
    options: ["Only on highways", "Only in the front seats", "Always when driving", "Only during long trips"],
    correctAnswer: 2,
    explanation: "Seatbelts must be worn at all times when the vehicle is in motion, by all occupants.",
    category: "Safety Equipment"
  },
  {
    id: 6,
    question: "What should you do when approaching a pedestrian crossing?",
    options: ["Speed up to pass quickly", "Slow down and be prepared to stop", "Honk your horn", "Maintain current speed"],
    correctAnswer: 1,
    explanation: "Always slow down and be prepared to stop when approaching pedestrian crossings.",
    category: "Pedestrian Safety"
  },
  {
    id: 7,
    question: "What is the legal blood alcohol limit for drivers in most EU countries?",
    options: ["0.0%", "0.05%", "0.08%", "0.1%"],
    correctAnswer: 1,
    explanation: "Most EU countries have a legal limit of 0.05% BAC, with some having even lower limits.",
    category: "Legal Requirements"
  },
  {
    id: 8,
    question: "When should you check your mirrors?",
    options: ["Only when changing lanes", "Every 5-8 seconds", "Only when parking", "Once per trip"],
    correctAnswer: 1,
    explanation: "Mirrors should be checked regularly, approximately every 5-8 seconds while driving.",
    category: "Safe Driving"
  },
  {
    id: 9,
    question: "What does a yellow traffic light mean?",
    options: ["Speed up", "Prepare to stop", "Continue if safe", "Stop immediately"],
    correctAnswer: 1,
    explanation: "Yellow light means prepare to stop. Only proceed if stopping would be unsafe.",
    category: "Traffic Signals"
  },
  {
    id: 10,
    question: "What is the purpose of ABS brakes?",
    options: ["To brake faster", "To prevent wheel lockup", "To save fuel", "To reduce noise"],
    correctAnswer: 1,
    explanation: "ABS (Anti-lock Braking System) prevents wheels from locking up during emergency braking.",
    category: "Vehicle Systems"
  }
];

const countries = [
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪' },
  { code: 'AT', name: 'Austria', flag: '🇦🇹' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴' }
];

export default function DrivingLicensePractice() {
  const [selectedCountry, setSelectedCountry] = useState('');
  const [testMode, setTestMode] = useState<'practice' | 'exam' | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes for exam mode

  const startTest = (mode: 'practice' | 'exam') => {
    setTestMode(mode);
    setTestStarted(true);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setTestCompleted(false);
    setTestResult(null);
    setStartTime(new Date());
    
    if (mode === 'exam') {
      setTimeLeft(1800); // 30 minutes
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
    
    if (testMode === 'practice') {
      setShowExplanation(true);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    } else {
      finishTest();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const finishTest = () => {
    const endTime = new Date();
    const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    
    let correctAnswers = 0;
    const incorrectAnswers: number[] = [];
    
    selectedAnswers.forEach((answer, index) => {
      if (answer === mockQuestions[index].correctAnswer) {
        correctAnswers++;
      } else {
        incorrectAnswers.push(index);
      }
    });
    
    const score = Math.round((correctAnswers / mockQuestions.length) * 100);
    const passed = score >= 80; // 80% passing grade
    
    setTestResult({
      score,
      totalQuestions: mockQuestions.length,
      passed,
      timeSpent,
      incorrectAnswers
    });
    
    setTestCompleted(true);
  };

  const restartTest = () => {
    setTestStarted(false);
    setTestMode(null);
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowExplanation(false);
    setTestCompleted(false);
    setTestResult(null);
    setStartTime(null);
    setTimeLeft(1800);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  if (!testStarted) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Car className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Driving License Practice</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            {/* Welcome Section */}
            <Card className="shadow-lg border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">EU Driving License Practice Test</CardTitle>
                <CardDescription className="text-lg">
                  Prepare for your driving license exam with our comprehensive practice tests
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Country Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Your Country</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose your country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <div className="flex items-center space-x-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Test Mode Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-blue-200">
                    <CardContent className="p-6 text-center">
                      <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Practice Mode</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Learn with instant feedback and explanations
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li>• Immediate feedback</li>
                        <li>• Detailed explanations</li>
                        <li>• No time limit</li>
                        <li>• Review answers</li>
                      </ul>
                      <Button 
                        onClick={() => startTest('practice')}
                        className="w-full"
                        disabled={!selectedCountry}
                      >
                        Start Practice
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-md transition-shadow border-2 hover:border-green-200">
                    <CardContent className="p-6 text-center">
                      <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Exam Mode</h3>
                      <p className="text-muted-foreground text-sm mb-4">
                        Simulate real exam conditions
                      </p>
                      <ul className="text-sm text-muted-foreground space-y-1 mb-4">
                        <li>• 30-minute time limit</li>
                        <li>• No immediate feedback</li>
                        <li>• 80% to pass</li>
                        <li>• Final score report</li>
                      </ul>
                      <Button 
                        onClick={() => startTest('exam')}
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={!selectedCountry}
                      >
                        Start Exam
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {!selectedCountry && (
                  <Alert>
                    <Car className="h-4 w-4" />
                    <AlertDescription>
                      Please select your country to access region-specific driving rules and regulations.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Car className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">EU Standards</h3>
                  <p className="text-sm text-muted-foreground">Questions based on European driving regulations and best practices</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Comprehensive</h3>
                  <p className="text-sm text-muted-foreground">Covers all topics: traffic rules, safety, signs, and vehicle operation</p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Trophy className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Track Progress</h3>
                  <p className="text-sm text-muted-foreground">Monitor your improvement and identify areas for study</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (testCompleted && testResult) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
        {/* Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center space-x-2">
                <Car className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Test Results</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                testResult.passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {testResult.passed ? (
                  <CheckCircle className="w-10 h-10 text-primary" />
                ) : (
                  <XCircle className="w-10 h-10 text-destructive" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {testResult.passed ? 'Congratulations!' : 'Keep Practicing!'}
              </CardTitle>
              <CardDescription className="text-lg">
                {testResult.passed 
                  ? 'You passed the driving test!' 
                  : 'You need 80% to pass. Review the questions and try again.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="text-center">
                <div className="text-4xl font-bold mb-2">
                  <span className={testResult.passed ? 'text-primary' : 'text-destructive'}>
                    {testResult.score}%
                  </span>
                </div>
                <p className="text-muted-foreground">
                  {mockQuestions.length - testResult.incorrectAnswers.length} out of {testResult.totalQuestions} correct
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{testResult.score}%</div>
                  <div className="text-sm text-muted-foreground">Final Score</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{formatTime(testResult.timeSpent)}</div>
                  <div className="text-sm text-muted-foreground">Time Spent</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{testResult.incorrectAnswers.length}</div>
                  <div className="text-sm text-muted-foreground">Incorrect Answers</div>
                </div>
              </div>

              {/* Incorrect Answers Review */}
              {testResult.incorrectAnswers.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Review Incorrect Answers</h3>
                  {testResult.incorrectAnswers.map((questionIndex) => {
                    const question = mockQuestions[questionIndex];
                    const userAnswer = selectedAnswers[questionIndex];
                    return (
                      <Card key={questionIndex} className="border-red-200">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start space-x-2">
                              <Badge variant="destructive" className="mt-1">Q{questionIndex + 1}</Badge>
                              <div className="flex-1">
                                <p className="font-medium">{question.question}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">
                                    <span className="text-destructive">Your answer:</span> {question.options[userAnswer]}
                                  </p>
                                  <p className="text-sm">
                                    <span className="text-primary">Correct answer:</span> {question.options[question.correctAnswer]}
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-2">{question.explanation}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 justify-center">
                <Button onClick={restartTest} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Another Test
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Back to Tools
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const question = mockQuestions[currentQuestion];
  const selectedAnswer = selectedAnswers[currentQuestion];

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-cream-50 via-ocean-50 to-warm-beige-100 dark:from-background dark:via-background dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={restartTest}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Car className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">
                  {testMode === 'practice' ? 'Practice Mode' : 'Exam Mode'}
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {testMode === 'exam' && (
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className={`font-mono ${timeLeft < 300 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              )}
              <div className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {mockQuestions.length}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          {/* Question Card */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="secondary">{question.category}</Badge>
                <span className="text-sm text-muted-foreground">Question {currentQuestion + 1}</span>
              </div>
              <CardTitle className="text-xl leading-relaxed">{question.question}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Answer Options */}
              <div className="space-y-3">
                {question.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === question.correctAnswer;
                  const showResult = showExplanation && testMode === 'practice';
                  
                  let buttonClass = "w-full p-4 text-left border-2 rounded-lg transition-colors ";
                  
                  if (showResult) {
                    if (isCorrect) {
                      buttonClass += "border-green-500 bg-background text-green-800";
                    } else if (isSelected && !isCorrect) {
                      buttonClass += "border-red-500 bg-red-50 text-red-800";
                    } else {
                      buttonClass += "border-border bg-background text-muted-foreground";
                    }
                  } else if (isSelected) {
                    buttonClass += "border-blue-500 bg-background text-blue-800";
                  } else {
                    buttonClass += "border-border hover:border-blue-300 hover:bg-background";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={showResult}
                      className={buttonClass}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                        {showResult && isCorrect && (
                          <CheckCircle className="w-5 h-5 text-primary ml-auto" />
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <XCircle className="w-5 h-5 text-destructive ml-auto" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Explanation */}
              {showExplanation && testMode === 'practice' && (
                <Alert className="border-blue-200 bg-background">
                  <AlertDescription className="text-blue-800">
                    <strong>Explanation:</strong> {question.explanation}
                  </AlertDescription>
                </Alert>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={previousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-2">
                  {testMode === 'exam' && (
                    <Button onClick={finishTest} variant="outline">
                      Finish Test
                    </Button>
                  )}
                  
                  {selectedAnswer !== undefined && (
                    <Button onClick={nextQuestion}>
                      {currentQuestion === mockQuestions.length - 1 ? 'Finish' : 'Next'}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}