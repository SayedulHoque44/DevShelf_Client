'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageCircle, Volume2, Copy, Star, Search, Globe, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Phrase {
  id: string;
  english: string;
  translation: string;
  pronunciation: string;
  category: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  isBookmarked: boolean;
}

interface Language {
  code: string;
  name: string;
  flag: string;
  phrases: Phrase[];
}

const languages: Language[] = [
  {
    code: 'es',
    name: 'Spanish',
    flag: '🇪🇸',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        translation: 'Hola',
        pronunciation: 'OH-lah',
        category: 'greetings',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '2',
        english: 'Thank you',
        translation: 'Gracias',
        pronunciation: 'GRAH-see-ahs',
        category: 'politeness',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '3',
        english: 'Where is the bathroom?',
        translation: '¿Dónde está el baño?',
        pronunciation: 'DOHN-deh ehs-TAH ehl BAH-nyoh',
        category: 'directions',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '4',
        english: 'How much does this cost?',
        translation: '¿Cuánto cuesta esto?',
        pronunciation: 'KWAN-toh KWEH-stah EH-stoh',
        category: 'shopping',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '5',
        english: 'I don\'t understand',
        translation: 'No entiendo',
        pronunciation: 'noh ehn-tee-EHN-doh',
        category: 'communication',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '6',
        english: 'Can you help me?',
        translation: '¿Puedes ayudarme?',
        pronunciation: 'PWEH-dehs ah-yoo-DAHR-meh',
        category: 'help',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '7',
        english: 'I would like to order',
        translation: 'Me gustaría pedir',
        pronunciation: 'meh goo-stah-REE-ah peh-DEER',
        category: 'dining',
        difficulty: 'intermediate',
        isBookmarked: false
      },
      {
        id: '8',
        english: 'What time does it open?',
        translation: '¿A qué hora abre?',
        pronunciation: 'ah keh OH-rah AH-breh',
        category: 'time',
        difficulty: 'intermediate',
        isBookmarked: false
      }
    ]
  },
  {
    code: 'fr',
    name: 'French',
    flag: '🇫🇷',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        translation: 'Bonjour',
        pronunciation: 'bon-ZHOOR',
        category: 'greetings',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '2',
        english: 'Thank you',
        translation: 'Merci',
        pronunciation: 'mer-SEE',
        category: 'politeness',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '3',
        english: 'Where is the bathroom?',
        translation: 'Où sont les toilettes?',
        pronunciation: 'oo son lay twa-LET',
        category: 'directions',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '4',
        english: 'How much does this cost?',
        translation: 'Combien ça coûte?',
        pronunciation: 'kom-bee-AHN sah KOOT',
        category: 'shopping',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '5',
        english: 'I don\'t understand',
        translation: 'Je ne comprends pas',
        pronunciation: 'zhuh nuh kom-PRAHN pah',
        category: 'communication',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '6',
        english: 'Can you help me?',
        translation: 'Pouvez-vous m\'aider?',
        pronunciation: 'poo-vay voo meh-DAY',
        category: 'help',
        difficulty: 'basic',
        isBookmarked: false
      }
    ]
  },
  {
    code: 'de',
    name: 'German',
    flag: '🇩🇪',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        translation: 'Hallo',
        pronunciation: 'HAH-loh',
        category: 'greetings',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '2',
        english: 'Thank you',
        translation: 'Danke',
        pronunciation: 'DAHN-keh',
        category: 'politeness',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '3',
        english: 'Where is the bathroom?',
        translation: 'Wo ist die Toilette?',
        pronunciation: 'voh ist dee toy-LET-teh',
        category: 'directions',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '4',
        english: 'How much does this cost?',
        translation: 'Wie viel kostet das?',
        pronunciation: 'vee feel KOS-tet dahs',
        category: 'shopping',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '5',
        english: 'I don\'t understand',
        translation: 'Ich verstehe nicht',
        pronunciation: 'ikh fer-SHTEH-eh nikht',
        category: 'communication',
        difficulty: 'basic',
        isBookmarked: false
      }
    ]
  },
  {
    code: 'it',
    name: 'Italian',
    flag: '🇮🇹',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        translation: 'Ciao',
        pronunciation: 'chow',
        category: 'greetings',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '2',
        english: 'Thank you',
        translation: 'Grazie',
        pronunciation: 'GRAH-tsee-eh',
        category: 'politeness',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '3',
        english: 'Where is the bathroom?',
        translation: 'Dov\'è il bagno?',
        pronunciation: 'doh-VEH eel BAH-nyoh',
        category: 'directions',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '4',
        english: 'How much does this cost?',
        translation: 'Quanto costa?',
        pronunciation: 'KWAN-toh KOS-tah',
        category: 'shopping',
        difficulty: 'basic',
        isBookmarked: false
      }
    ]
  },
  {
    code: 'pt',
    name: 'Portuguese',
    flag: '🇵🇹',
    phrases: [
      {
        id: '1',
        english: 'Hello',
        translation: 'Olá',
        pronunciation: 'oh-LAH',
        category: 'greetings',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '2',
        english: 'Thank you',
        translation: 'Obrigado/Obrigada',
        pronunciation: 'oh-bree-GAH-doh/dah',
        category: 'politeness',
        difficulty: 'basic',
        isBookmarked: false
      },
      {
        id: '3',
        english: 'Where is the bathroom?',
        translation: 'Onde fica o banheiro?',
        pronunciation: 'ON-deh FEE-kah oh bahn-YAY-roh',
        category: 'directions',
        difficulty: 'basic',
        isBookmarked: false
      }
    ]
  }
];

const categories = [
  'all',
  'greetings',
  'politeness',
  'directions',
  'shopping',
  'dining',
  'communication',
  'help',
  'time',
  'emergency'
];

export default function LanguagePhrases() {
  const [selectedLanguage, setSelectedLanguage] = useState('es');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookmarkedPhrases, setBookmarkedPhrases] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('phrases');

  const currentLanguage = languages.find(lang => lang.code === selectedLanguage);
  
  const filteredPhrases = currentLanguage?.phrases.filter(phrase => {
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesSearch = phrase.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         phrase.translation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  const bookmarkedPhrasesData = currentLanguage?.phrases.filter(phrase => 
    bookmarkedPhrases.has(`${selectedLanguage}-${phrase.id}`)
  ) || [];

  const toggleBookmark = (phraseId: string) => {
    const key = `${selectedLanguage}-${phraseId}`;
    setBookmarkedPhrases(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };

  const speakPhrase = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      speechSynthesis.speak(utterance);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const PhraseCard = ({ phrase }: { phrase: Phrase }) => {
    const isBookmarked = bookmarkedPhrases.has(`${selectedLanguage}-${phrase.id}`);
    
    return (
      <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{phrase.english}</h3>
                <p className="text-xl text-blue-600 font-medium mt-1">{phrase.translation}</p>
                <p className="text-sm text-gray-500 mt-1">/{phrase.pronunciation}/</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(phrase.difficulty)}>
                  {phrase.difficulty}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleBookmark(phrase.id)}
                  className={isBookmarked ? 'text-yellow-500' : 'text-gray-400'}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Badge variant="outline" className="capitalize">
                {phrase.category}
              </Badge>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => speakPhrase(phrase.translation, selectedLanguage)}
                >
                  <Volume2 className="w-3 h-3 mr-1" />
                  Listen
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(phrase.translation)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">Travel Phrases</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Language Selection & Filters */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-green-600" />
                <span>Essential Travel Phrases</span>
              </CardTitle>
              <CardDescription>
                Learn essential phrases for your travels with pronunciation guides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map(language => (
                        <SelectItem key={language.code} value={language.code}>
                          <div className="flex items-center space-x-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search phrases..."
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phrases">All Phrases ({filteredPhrases.length})</TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Bookmark className="w-4 h-4 mr-2" />
                Bookmarks ({bookmarkedPhrasesData.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="phrases" className="space-y-6">
              {/* Phrases Grid */}
              {filteredPhrases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPhrases.map(phrase => (
                    <PhraseCard key={phrase.id} phrase={phrase} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-lg border-0">
                  <CardContent className="py-12 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No phrases found</p>
                    <p className="text-sm">Try adjusting your search or category filter</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="bookmarks" className="space-y-6">
              {/* Bookmarked Phrases */}
              {bookmarkedPhrasesData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarkedPhrasesData.map(phrase => (
                    <PhraseCard key={phrase.id} phrase={phrase} />
                  ))}
                </div>
              ) : (
                <Card className="shadow-lg border-0">
                  <CardContent className="py-12 text-center text-gray-500">
                    <Bookmark className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No bookmarked phrases</p>
                    <p className="text-sm">Bookmark phrases to save them for quick access</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Language Stats */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Language Learning Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Volume2 className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Practice Pronunciation</h3>
                  <p className="text-sm text-gray-600">Use the audio feature to hear correct pronunciation</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Start with Basics</h3>
                  <p className="text-sm text-gray-600">Master basic phrases before moving to advanced ones</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Bookmark className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Bookmark Favorites</h3>
                  <p className="text-sm text-gray-600">Save important phrases for quick reference</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <MessageCircle className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Practice Daily</h3>
                  <p className="text-sm text-gray-600">Regular practice helps with retention and fluency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}