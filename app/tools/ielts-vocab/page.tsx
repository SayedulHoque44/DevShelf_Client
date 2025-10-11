'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Trophy, RotateCcw, CheckCircle, XCircle, Star, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface VocabWord {
  id: number;
  word: string;
  definition: string;
  pronunciation: string;
  partOfSpeech: string;
  example: string;
  synonyms: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  ieltsFrequency: number;
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  correctWords: string[];
  incorrectWords: string[];
}

const vocabularyData: VocabWord[] = [
  {
    id: 1,
    word: "Accommodate",
    definition: "To provide lodging or sufficient space for",
    pronunciation: "/əˈkɒmədeɪt/",
    partOfSpeech: "verb",
    example: "The hotel can accommodate up to 200 guests.",
    synonyms: ["house", "lodge", "shelter", "provide for"],
    difficulty: "intermediate",
    category: "General",
    ieltsFrequency: 8
  },
  {
    id: 2,
    word: "Substantial",
    definition: "Of considerable importance, size, or worth",
    pronunciation: "/səbˈstænʃəl/",
    partOfSpeech: "adjective",
    example: "There has been substantial progress in medical research.",
    synonyms: ["significant", "considerable", "large", "important"],
    difficulty: "advanced",
    category: "Academic",
    ieltsFrequency: 9
  },
  {
    id: 3,
    word: "Phenomenon",
    definition: "A fact or situation that is observed to exist or happen",
    pronunciation: "/fɪˈnɒmɪnən/",
    partOfSpeech: "noun",
    example: "Climate change is a global phenomenon.",
    synonyms: ["occurrence", "event", "happening", "manifestation"],
    difficulty: "advanced",
    category: "Academic",
    ieltsFrequency: 7
  },
  {
    id: 4,
    word: "Enhance",
    definition: "To intensify, increase, or further improve the quality of",
    pronunciation: "/ɪnˈhɑːns/",
    partOfSpeech: "verb",
    example: "Technology can enhance learning experiences.",
    synonyms: ["improve", "boost", "strengthen", "augment"],
    difficulty: "intermediate",
    category: "General",
    ieltsFrequency: 8
  },
  {
    id: 5,
    word: "Comprehensive",
    definition: "Complete and including everything that is necessary",
    pronunciation: "/ˌkɒmprɪˈhensɪv/",
    partOfSpeech: "adjective",
    example: "The report provides a comprehensive analysis of the situation.",
    synonyms: ["complete", "thorough", "extensive", "detailed"],
    difficulty: "advanced",
    category: "Academic",
    ieltsFrequency: 9
  },
  {
    id: 6,
    word: "Inevitable",
    definition: "Certain to happen; unavoidable",
    pronunciation: "/ɪnˈevɪtəbəl/",
    partOfSpeech: "adjective",
    example: "Change is inevitable in any organization.",
    synonyms: ["unavoidable", "certain", "inescapable", "bound to happen"],
    difficulty: "advanced",
    category: "General",
    ieltsFrequency: 7
  },
  {
    id: 7,
    word: "Fluctuate",
    definition: "To rise and fall irregularly in number or amount",
    pronunciation: "/ˈflʌktʃueɪt/",
    partOfSpeech: "verb",
    example: "Stock prices fluctuate throughout the trading day.",
    synonyms: ["vary", "change", "oscillate", "shift"],
    difficulty: "intermediate",
    category: "Academic",
    ieltsFrequency: 6
  },
  {
    id: 8,
    word: "Advocate",
    definition: "To publicly recommend or support",
    pronunciation: "/ˈædvəkeɪt/",
    partOfSpeech: "verb",
    example: "Many experts advocate for renewable energy sources.",
    synonyms: ["support", "promote", "champion", "endorse"],
    difficulty: "intermediate",
    category: "General",
    ieltsFrequency: 8
  },
  {
    id: 9,
    word: "Deteriorate",
    definition: "To become progressively worse",
    pronunciation: "/dɪˈtɪəriəreɪt/",
    partOfSpeech: "verb",
    example: "The building's condition has deteriorated over time.",
    synonyms: ["worsen", "decline", "degrade", "decay"],
    difficulty: "advanced",
    category: "General",
    ieltsFrequency: 6
  },
  {
    id: 10,
    word: "Preliminary",
    definition: "Denoting an action or event preceding or done in preparation for something",
    pronunciation: "/prɪˈlɪmɪnəri/",
    partOfSpeech: "adjective",
    example: "The preliminary results look promising.",
    synonyms: ["initial", "preparatory", "introductory", "early"],
    difficulty: "advanced",
    category: "Academic",
    ieltsFrequency: 7
  }
];

export default function IELTSVocabulary() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [currentMode, setCurrentMode] = useState<'study' | 'quiz' | 'flashcards'>('study');
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<VocabWord[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [quizAnswers, setQuizAnswers] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [showFlashcardAnswer, setShowFlashcardAnswer] = useState(false);
  const [masteredWords, setMasteredWords] = useState<Set<number>>(new Set());

  const categories = ['all', 'General', 'Academic'];
  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const filteredWords = vocabularyData.filter(word => {
    const categoryMatch = selectedCategory === 'all' || word.category === selectedCategory;
    const difficultyMatch = selectedDifficulty === 'all' || word.difficulty === selectedDifficulty;
    return categoryMatch && difficultyMatch;
  });

  const currentWord = filteredWords[currentWordIndex] || vocabularyData[0];

  const startQuiz = () => {
    const shuffledWords = [...filteredWords].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizQuestions(shuffledWords);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
    setSelectedAnswer('');
    setShowResult(false);
    setQuizMode(true);
    setStartTime(new Date());
  };

  const generateQuizOptions = (correctWord: VocabWord) => {
    const otherWords = vocabularyData.filter(w => w.id !== correctWord.id);
    const wrongOptions = otherWords.sort(() => Math.random() - 0.5).slice(0, 3);
    const allOptions = [correctWord, ...wrongOptions].sort(() => Math.random() - 0.5);
    return allOptions.map(w => w.definition);
  };

  const handleQuizAnswer = (answer: string) => {
    setSelectedAnswer(answer);
    const newAnswers = [...quizAnswers];
    newAnswers[currentQuizIndex] = answer;
    setQuizAnswers(newAnswers);
  };

  const nextQuizQuestion = () => {
    if (currentQuizIndex < quizQuestions.length - 1) {
      setCurrentQuizIndex(currentQuizIndex + 1);
      setSelectedAnswer(quizAnswers[currentQuizIndex + 1] || '');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const endTime = new Date();
    const timeSpent = startTime ? Math.floor((endTime.getTime() - startTime.getTime()) / 1000) : 0;
    
    let correctCount = 0;
    const correctWords: string[] = [];
    const incorrectWords: string[] = [];

    quizQuestions.forEach((word, index) => {
      if (quizAnswers[index] === word.definition) {
        correctCount++;
        correctWords.push(word.word);
      } else {
        incorrectWords.push(word.word);
      }
    });

    const score = Math.round((correctCount / quizQuestions.length) * 100);

    setQuizResult({
      score,
      totalQuestions: quizQuestions.length,
      timeSpent,
      correctWords,
      incorrectWords
    });

    setShowResult(true);
  };

  const resetQuiz = () => {
    setQuizMode(false);
    setShowResult(false);
    setQuizResult(null);
    setCurrentQuizIndex(0);
    setQuizAnswers([]);
    setSelectedAnswer('');
  };

  const toggleWordMastery = (wordId: number) => {
    const newMastered = new Set(masteredWords);
    if (newMastered.has(wordId)) {
      newMastered.delete(wordId);
    } else {
      newMastered.add(wordId);
    }
    setMasteredWords(newMastered);
  };

  const nextWord = () => {
    if (currentWordIndex < filteredWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1);
    } else {
      setCurrentWordIndex(0);
    }
    setShowFlashcardAnswer(false);
  };

  const previousWord = () => {
    if (currentWordIndex > 0) {
      setCurrentWordIndex(currentWordIndex - 1);
    } else {
      setCurrentWordIndex(filteredWords.length - 1);
    }
    setShowFlashcardAnswer(false);
  };

  if (quizMode && showResult && quizResult) {
    return (
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <header className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Tools</span>
              </Link>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Quiz Results</h1>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${
                quizResult.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                {quizResult.score >= 70 ? (
                  <Trophy className="w-10 h-10 text-primary" />
                ) : (
                  <Target className="w-10 h-10 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {quizResult.score >= 70 ? 'Excellent Work!' : 'Keep Practicing!'}
              </CardTitle>
              <CardDescription className="text-lg">
                You scored {quizResult.score}% on your IELTS vocabulary quiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{quizResult.score}%</div>
                  <div className="text-sm text-muted-foreground">Score</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{Math.floor(quizResult.timeSpent / 60)}:{(quizResult.timeSpent % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-muted-foreground">Time</div>
                </div>
                <div className="text-center p-4 bg-background rounded-lg">
                  <div className="text-2xl font-bold text-foreground">{quizResult.correctWords.length}/{quizResult.totalQuestions}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
              </div>

              {quizResult.incorrectWords.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Words to Review</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quizResult.incorrectWords.map((word) => (
                      <div key={word} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <span className="font-medium text-red-800">{word}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-4 justify-center">
                <Button onClick={startQuiz}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Take Another Quiz
                </Button>
                <Button onClick={resetQuiz} variant="outline">
                  Back to Study
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (quizMode) {
    const currentQuizWord = quizQuestions[currentQuizIndex];
    const options = generateQuizOptions(currentQuizWord);
    const progress = ((currentQuizIndex + 1) / quizQuestions.length) * 100;

    return (
      <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <header className="bg-card/80 backdrop-blur-md border-b border-border">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button variant="ghost" onClick={resetQuiz}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center space-x-2">
                <Brain className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-semibold text-foreground">Vocabulary Quiz</h1>
              </div>
              <div className="text-sm text-muted-foreground">
                {currentQuizIndex + 1} of {quizQuestions.length}
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-2xl text-center">
                  What does "<span className="text-primary">{currentQuizWord.word}</span>" mean?
                </CardTitle>
                <div className="text-center text-muted-foreground">
                  <span className="text-sm">{currentQuizWord.pronunciation}</span>
                  <Badge variant="secondary" className="ml-2">{currentQuizWord.partOfSpeech}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(option)}
                      className={`w-full p-4 text-left border-2 rounded-lg transition-colors ${
                        selectedAnswer === option
                          ? 'border-purple-500 bg-background text-purple-800'
                          : 'border-border hover:border-purple-300 hover:bg-background'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex justify-between pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuizIndex(Math.max(0, currentQuizIndex - 1))}
                    disabled={currentQuizIndex === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={nextQuizQuestion}
                    disabled={!selectedAnswer}
                  >
                    {currentQuizIndex === quizQuestions.length - 1 ? 'Finish Quiz' : 'Next'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">IELTS Vocabulary Builder</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Mode Selection */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Study Mode</CardTitle>
                <CardDescription>Choose how you want to learn vocabulary</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant={currentMode === 'study' ? 'default' : 'outline'}
                    onClick={() => setCurrentMode('study')}
                    className="h-20 flex flex-col space-y-2"
                  >
                    <BookOpen className="w-6 h-6" />
                    <span>Study Words</span>
                  </Button>
                  <Button
                    variant={currentMode === 'flashcards' ? 'default' : 'outline'}
                    onClick={() => setCurrentMode('flashcards')}
                    className="h-20 flex flex-col space-y-2"
                  >
                    <Target className="w-6 h-6" />
                    <span>Flashcards</span>
                  </Button>
                  <Button
                    onClick={startQuiz}
                    className="h-20 flex flex-col space-y-2 bg-gradient-to-r from-purple-600 to-blue-600"
                  >
                    <Brain className="w-6 h-6" />
                    <span>Take Quiz</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category === 'all' ? 'All Categories' : category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty</label>
                    <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {difficulties.map(difficulty => (
                          <SelectItem key={difficulty} value={difficulty}>
                            {difficulty === 'all' ? 'All Levels' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Word Display */}
            {currentMode === 'study' && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge variant={currentWord.difficulty === 'advanced' ? 'destructive' : currentWord.difficulty === 'intermediate' ? 'default' : 'secondary'}>
                        {currentWord.difficulty}
                      </Badge>
                      <Badge variant="outline">{currentWord.category}</Badge>
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < currentWord.ieltsFrequency / 2 ? 'text-yellow-400 fill-current' : 'text-muted-foreground'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleWordMastery(currentWord.id)}
                      className={masteredWords.has(currentWord.id) ? 'text-primary' : 'text-muted-foreground'}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </Button>
                  </div>
                  <CardTitle className="text-3xl">{currentWord.word}</CardTitle>
                  <CardDescription className="text-lg">{currentWord.pronunciation}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Definition</h3>
                    <p className="text-foreground">{currentWord.definition}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Example</h3>
                    <p className="text-foreground italic">"{currentWord.example}"</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Synonyms</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentWord.synonyms.map((synonym, index) => (
                        <Badge key={index} variant="secondary">{synonym}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={previousWord}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      {currentWordIndex + 1} of {filteredWords.length}
                    </span>
                    <Button onClick={nextWord}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Flashcard Mode */}
            {currentMode === 'flashcards' && (
              <Card className="shadow-lg border-0 min-h-[400px]">
                <CardContent className="p-8 flex flex-col justify-center items-center text-center space-y-6">
                  <div className="space-y-2">
                    <Badge variant={currentWord.difficulty === 'advanced' ? 'destructive' : currentWord.difficulty === 'intermediate' ? 'default' : 'secondary'}>
                      {currentWord.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentWord.category}</Badge>
                  </div>
                  
                  {!showFlashcardAnswer ? (
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold">{currentWord.word}</h2>
                      <p className="text-xl text-muted-foreground">{currentWord.pronunciation}</p>
                      <Button onClick={() => setShowFlashcardAnswer(true)}>
                        Show Definition
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h2 className="text-4xl font-bold">{currentWord.word}</h2>
                      <p className="text-xl text-muted-foreground">{currentWord.pronunciation}</p>
                      <p className="text-lg">{currentWord.definition}</p>
                      <p className="text-muted-foreground italic">"{currentWord.example}"</p>
                      <div className="flex space-x-4">
                        <Button variant="outline" onClick={() => {
                          toggleWordMastery(currentWord.id);
                          nextWord();
                        }}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Know It
                        </Button>
                        <Button onClick={nextWord}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Study More
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between w-full pt-4">
                    <Button variant="ghost" onClick={previousWord}>
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground self-center">
                      {currentWordIndex + 1} of {filteredWords.length}
                    </span>
                    <Button variant="ghost" onClick={nextWord}>
                      Next
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{masteredWords.size}</div>
                  <div className="text-sm text-muted-foreground">Words Mastered</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{filteredWords.length}</div>
                  <div className="text-sm text-muted-foreground">Total Words</div>
                </div>
                <Progress value={(masteredWords.size / filteredWords.length) * 100} className="w-full" />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>IELTS Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Focus on high-frequency words for better exam performance</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Practice using new words in context</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Review synonyms to improve your writing variety</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Learn pronunciation to boost speaking scores</span>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Beginner words:</span>
                  <span className="font-medium">{vocabularyData.filter(w => w.difficulty === 'beginner').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Intermediate words:</span>
                  <span className="font-medium">{vocabularyData.filter(w => w.difficulty === 'intermediate').length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Advanced words:</span>
                  <span className="font-medium">{vocabularyData.filter(w => w.difficulty === 'advanced').length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}