'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, Clock, Gift, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface AgeResult {
  years: number;
  months: number;
  days: number;
  totalDays: number;
  totalWeeks: number;
  totalMonths: number;
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  nextBirthday: {
    date: Date;
    daysUntil: number;
    dayOfWeek: string;
  };
  zodiacSign: string;
  birthDayOfWeek: string;
  lifeEvents: string[];
}

export default function AgeCalculator() {
  const [birthDate, setBirthDate] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<AgeResult | null>(null);

  const zodiacSigns = [
    { name: 'Capricorn', start: [12, 22], end: [1, 19], symbol: '♑' },
    { name: 'Aquarius', start: [1, 20], end: [2, 18], symbol: '♒' },
    { name: 'Pisces', start: [2, 19], end: [3, 20], symbol: '♓' },
    { name: 'Aries', start: [3, 21], end: [4, 19], symbol: '♈' },
    { name: 'Taurus', start: [4, 20], end: [5, 20], symbol: '♉' },
    { name: 'Gemini', start: [5, 21], end: [6, 20], symbol: '♊' },
    { name: 'Cancer', start: [6, 21], end: [7, 22], symbol: '♋' },
    { name: 'Leo', start: [7, 23], end: [8, 22], symbol: '♌' },
    { name: 'Virgo', start: [8, 23], end: [9, 22], symbol: '♍' },
    { name: 'Libra', start: [9, 23], end: [10, 22], symbol: '♎' },
    { name: 'Scorpio', start: [10, 23], end: [11, 21], symbol: '♏' },
    { name: 'Sagittarius', start: [11, 22], end: [12, 21], symbol: '♐' }
  ];

  const getZodiacSign = (date: Date): string => {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    for (const sign of zodiacSigns) {
      const [startMonth, startDay] = sign.start;
      const [endMonth, endDay] = sign.end;

      if (
        (month === startMonth && day >= startDay) ||
        (month === endMonth && day <= endDay) ||
        (startMonth > endMonth && (month === startMonth || month === endMonth))
      ) {
        return `${sign.symbol} ${sign.name}`;
      }
    }
    return '♑ Capricorn'; // Default fallback
  };

  const getLifeEvents = (years: number): string[] => {
    const events = [];
    
    if (years >= 1) events.push('🎂 First birthday celebration');
    if (years >= 5) events.push('🎒 Started school');
    if (years >= 10) events.push('🔢 Reached double digits');
    if (years >= 13) events.push('🧑‍🦱 Became a teenager');
    if (years >= 16) events.push('🚗 Driving age in many countries');
    if (years >= 18) events.push('🗳️ Legal adult in most countries');
    if (years >= 21) events.push('🍷 Legal drinking age in US');
    if (years >= 25) events.push('🧠 Brain fully developed');
    if (years >= 30) events.push('🎯 Entered the thirties');
    if (years >= 40) events.push('💪 Life begins at 40');
    if (years >= 50) events.push('🌟 Half a century milestone');
    if (years >= 60) events.push('🎖️ Senior citizen status');
    if (years >= 65) events.push('🏖️ Retirement age in many countries');
    if (years >= 70) events.push('💎 Platinum years');
    if (years >= 80) events.push('👑 Octogenarian status');
    if (years >= 90) events.push('🏆 Nonagenarian achievement');
    if (years >= 100) events.push('🎊 Centenarian celebration');

    return events.slice(-5); // Return last 5 events
  };

  const calculateAge = () => {
    if (!birthDate) return;

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      alert('Birth date cannot be in the future!');
      return;
    }

    // Calculate exact age
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const lastMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += lastMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate totals
    const totalDays = Math.floor((target.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;

    // Calculate next birthday
    const nextBirthday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday <= target) {
      nextBirthday.setFullYear(target.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    const dayOfWeek = nextBirthday.toLocaleDateString('en-US', { weekday: 'long' });

    // Get zodiac sign
    const zodiacSign = getZodiacSign(birth);

    // Get birth day of week
    const birthDayOfWeek = birth.toLocaleDateString('en-US', { weekday: 'long' });

    // Get life events
    const lifeEvents = getLifeEvents(years);

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      totalSeconds,
      nextBirthday: {
        date: nextBirthday,
        daysUntil: daysUntilBirthday,
        dayOfWeek
      },
      zodiacSign,
      birthDayOfWeek,
      lifeEvents
    });
  };

  const reset = () => {
    setBirthDate('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-semibold text-gray-900">Age Calculator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <span>Calculate Your Age</span>
                </CardTitle>
                <CardDescription>
                  Enter your birth date to calculate your precise age and get interesting statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="birthDate">Birth Date</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetDate">Calculate Age On</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button 
                    onClick={calculateAge} 
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={!birthDate}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Calculate Age
                  </Button>
                  <Button variant="outline" onClick={reset}>
                    Reset
                  </Button>
                </div>

                {!birthDate && (
                  <Alert>
                    <Calendar className="h-4 w-4" />
                    <AlertDescription>
                      Please enter your birth date to calculate your age.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Quick Facts */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Did You Know?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>The average human heart beats about 100,000 times per day</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>You blink approximately 15-20 times per minute</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>Your body produces about 25 million new cells every second</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <span>The average person walks about 7,500 steps per day</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* Main Age Display */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span>Your Age</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="text-4xl font-bold text-purple-600">
                        {result.years} years, {result.months} months, {result.days} days
                      </div>
                      <div className="text-lg text-gray-600">
                        Born on a {result.birthDayOfWeek}
                      </div>
                      <div className="text-lg">
                        Zodiac Sign: {result.zodiacSign}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Statistics */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Detailed Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{result.totalDays.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Days</div>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{result.totalWeeks.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Weeks</div>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{result.totalMonths.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Months</div>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{result.totalHours.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Hours</div>
                      </div>
                      <div className="p-4 bg-pink-50 rounded-lg">
                        <div className="text-2xl font-bold text-pink-600">{result.totalMinutes.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Minutes</div>
                      </div>
                      <div className="p-4 bg-indigo-50 rounded-lg">
                        <div className="text-2xl font-bold text-indigo-600">{result.totalSeconds.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">Total Seconds</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Next Birthday */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Gift className="w-5 h-5 text-purple-600" />
                      <span>Next Birthday</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="text-2xl font-bold text-purple-600">
                        {result.nextBirthday.daysUntil} days
                      </div>
                      <div className="text-gray-600">
                        {result.nextBirthday.date.toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        You'll turn {result.years + 1} on a {result.nextBirthday.dayOfWeek}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Life Events */}
                {result.lifeEvents.length > 0 && (
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-purple-600" />
                        <span>Life Milestones</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {result.lifeEvents.map((event, index) => (
                          <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                            <span className="text-sm">{event}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Enter your birth date to see your age calculation</p>
                  <p className="text-sm">Get detailed statistics and interesting facts about your life</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}