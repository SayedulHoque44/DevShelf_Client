'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Languages, ArrowRightLeft, Volume2, Copy, Download, Globe, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' }
];

// Mock translations for demonstration
const mockTranslations: { [key: string]: { [key: string]: string } } = {
  'en-es': {
    'Hello, how are you?': '¡Hola, ¿cómo estás?',
    'Good morning': 'Buenos días',
    'Thank you very much': 'Muchas gracias',
    'I love you': 'Te amo',
    'Where is the bathroom?': '¿Dónde está el baño?'
  },
  'en-fr': {
    'Hello, how are you?': 'Bonjour, comment allez-vous?',
    'Good morning': 'Bonjour',
    'Thank you very much': 'Merci beaucoup',
    'I love you': 'Je t\'aime',
    'Where is the bathroom?': 'Où sont les toilettes?'
  },
  'en-de': {
    'Hello, how are you?': 'Hallo, wie geht es dir?',
    'Good morning': 'Guten Morgen',
    'Thank you very much': 'Vielen Dank',
    'I love you': 'Ich liebe dich',
    'Where is the bathroom?': 'Wo ist die Toilette?'
  },
  'es-en': {
    '¡Hola, ¿cómo estás?': 'Hello, how are you?',
    'Buenos días': 'Good morning',
    'Muchas gracias': 'Thank you very much',
    'Te amo': 'I love you',
    '¿Dónde está el baño?': 'Where is the bathroom?'
  }
};

export default function LanguageTranslator() {
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [isTranslating, setIsTranslating] = useState(false);
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>(null);

  const translateText = async () => {
    if (!sourceText.trim()) return;

    setIsTranslating(true);
    
    // Simulate translation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock translation logic
    const translationKey = `${sourceLang}-${targetLang}`;
    const translations = mockTranslations[translationKey];
    
    let translation = '';
    if (translations && translations[sourceText.trim()]) {
      translation = translations[sourceText.trim()];
    } else {
      // Generate a mock translation based on the target language
      const targetLanguage = languages.find(lang => lang.code === targetLang);
      if (targetLanguage) {
        switch (targetLang) {
          case 'es':
            translation = `[Traducción al español]: ${sourceText}`;
            break;
          case 'fr':
            translation = `[Traduction française]: ${sourceText}`;
            break;
          case 'de':
            translation = `[Deutsche Übersetzung]: ${sourceText}`;
            break;
          case 'it':
            translation = `[Traduzione italiana]: ${sourceText}`;
            break;
          case 'pt':
            translation = `[Tradução portuguesa]: ${sourceText}`;
            break;
          case 'ru':
            translation = `[Русский перевод]: ${sourceText}`;
            break;
          case 'ja':
            translation = `[日本語翻訳]: ${sourceText}`;
            break;
          case 'ko':
            translation = `[한국어 번역]: ${sourceText}`;
            break;
          case 'zh':
            translation = `[中文翻译]: ${sourceText}`;
            break;
          case 'ar':
            translation = `[الترجمة العربية]: ${sourceText}`;
            break;
          case 'hi':
            translation = `[हिंदी अनुवाद]: ${sourceText}`;
            break;
          default:
            translation = `[Translation to ${targetLanguage.name}]: ${sourceText}`;
        }
      }
    }

    setTranslatedText(translation);
    setDetectedLanguage(sourceLang);
    setIsTranslating(false);
  };

  const swapLanguages = () => {
    const tempLang = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(tempLang);
    
    // Swap texts if both exist
    if (sourceText && translatedText) {
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
  };

  const downloadTranslation = () => {
    const content = `Original (${languages.find(l => l.code === sourceLang)?.name}):\n${sourceText}\n\nTranslation (${languages.find(l => l.code === targetLang)?.name}):\n${translatedText}`;
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'translation.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const speakText = (text: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      speechSynthesis.speak(utterance);
    }
  };

  const clearAll = () => {
    setSourceText('');
    setTranslatedText('');
    setDetectedLanguage(null);
  };

  const sourceLanguage = languages.find(lang => lang.code === sourceLang);
  const targetLanguage = languages.find(lang => lang.code === targetLang);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Languages className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Language Translator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Language Selection */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-blue-600" />
                <span>Language Selection</span>
              </CardTitle>
              <CardDescription>
                Choose source and target languages for translation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Select value={sourceLang} onValueChange={setSourceLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          <div className="flex items-center space-x-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                            <span className="text-gray-500 text-sm">({language.nativeName})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapLanguages}
                  className="mt-6"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </Button>

                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Select value={targetLang} onValueChange={setTargetLang}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.filter(lang => lang.code !== sourceLang).map((language) => (
                        <SelectItem key={language.code} value={language.code}>
                          <div className="flex items-center space-x-2">
                            <span>{language.flag}</span>
                            <span>{language.name}</span>
                            <span className="text-gray-500 text-sm">({language.nativeName})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Translation Interface */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Source Text */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{sourceLanguage?.flag}</span>
                    <span>{sourceLanguage?.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    {sourceText && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(sourceText, sourceLang)}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(sourceText)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  placeholder="Enter text to translate..."
                  className="min-h-[200px] resize-none"
                />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {sourceText.length} characters
                  </span>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearAll}
                      disabled={!sourceText && !translatedText}
                    >
                      Clear
                    </Button>
                    <Button
                      onClick={translateText}
                      disabled={!sourceText.trim() || isTranslating}
                      className="bg-gradient-to-r from-blue-600 to-purple-600"
                    >
                      {isTranslating ? 'Translating...' : 'Translate'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Translated Text */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span>{targetLanguage?.flag}</span>
                    <span>{targetLanguage?.name}</span>
                  </div>
                  <div className="flex space-x-2">
                    {translatedText && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => speakText(translatedText, targetLang)}
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(translatedText)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={downloadTranslation}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTranslating ? (
                  <div className="flex items-center justify-center min-h-[200px]">
                    <div className="text-center space-y-4">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="text-gray-600">Translating text...</p>
                    </div>
                  </div>
                ) : translatedText ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border min-h-[200px]">
                      <p className="text-gray-800 leading-relaxed">{translatedText}</p>
                    </div>
                    
                    {detectedLanguage && (
                      <Alert>
                        <Languages className="h-4 w-4" />
                        <AlertDescription>
                          Detected language: {languages.find(l => l.code === detectedLanguage)?.name}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[200px] text-gray-500">
                    <div className="text-center">
                      <Languages className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Translation will appear here</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quick Phrases */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Quick Phrases</CardTitle>
              <CardDescription>
                Common phrases for quick translation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  'Hello, how are you?',
                  'Good morning',
                  'Thank you very much',
                  'Excuse me',
                  'Where is the bathroom?',
                  'How much does this cost?',
                  'I don\'t understand',
                  'Can you help me?',
                  'What time is it?'
                ].map((phrase) => (
                  <button
                    key={phrase}
                    onClick={() => setSourceText(phrase)}
                    className="p-3 text-left border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-sm"
                  >
                    {phrase}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Translation Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Languages className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">20+ Languages</h3>
                  <p className="text-sm text-gray-600">Support for major world languages</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Volume2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Text-to-Speech</h3>
                  <p className="text-sm text-gray-600">Hear pronunciation in any language</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Copy className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Easy Copy</h3>
                  <p className="text-sm text-gray-600">One-click copy to clipboard</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Download className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Export Options</h3>
                  <p className="text-sm text-gray-600">Download translations as text files</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}