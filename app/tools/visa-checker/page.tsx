'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plane, CheckCircle, XCircle, AlertTriangle, Clock, FileText, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Country {
  code: string;
  name: string;
  flag: string;
  region: string;
}

interface VisaRequirement {
  destinationCountry: string;
  requirement: 'visa_free' | 'visa_on_arrival' | 'visa_required' | 'eta_required';
  maxStay: string;
  notes: string;
  processingTime?: string;
  cost?: string;
  validityPeriod?: string;
}

const countries: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', region: 'North America' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', region: 'Europe' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', region: 'Europe' },
  { code: 'FR', name: 'France', flag: '🇫🇷', region: 'Europe' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', region: 'Asia' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', region: 'Oceania' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', region: 'North America' },
  { code: 'CN', name: 'China', flag: '🇨🇳', region: 'Asia' },
  { code: 'IN', name: 'India', flag: '🇮🇳', region: 'Asia' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', region: 'South America' },
  { code: 'ZA', name: 'South Africa', flag: '🇿🇦', region: 'Africa' },
  { code: 'RU', name: 'Russia', flag: '🇷🇺', region: 'Europe/Asia' },
  { code: 'MX', name: 'Mexico', flag: '🇲🇽', region: 'North America' },
  { code: 'TH', name: 'Thailand', flag: '🇹🇭', region: 'Asia' },
  { code: 'EG', name: 'Egypt', flag: '🇪🇬', region: 'Africa' },
  { code: 'TR', name: 'Turkey', flag: '🇹🇷', region: 'Europe/Asia' },
  { code: 'AE', name: 'UAE', flag: '🇦🇪', region: 'Middle East' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
  { code: 'MY', name: 'Malaysia', flag: '🇲🇾', region: 'Asia' },
  { code: 'ID', name: 'Indonesia', flag: '🇮🇩', region: 'Asia' }
];

// Mock visa requirements data
const visaRequirements: { [key: string]: VisaRequirement[] } = {
  'US': [
    { destinationCountry: 'GB', requirement: 'eta_required', maxStay: '6 months', notes: 'ETA required from 2024', processingTime: '3 days', cost: '$10' },
    { destinationCountry: 'DE', requirement: 'visa_free', maxStay: '90 days', notes: 'Schengen area - 90 days in 180-day period' },
    { destinationCountry: 'JP', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes only' },
    { destinationCountry: 'AU', requirement: 'eta_required', maxStay: '90 days', notes: 'ETA required', processingTime: '1 day', cost: '$20' },
    { destinationCountry: 'CN', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '4-10 days', cost: '$140' },
    { destinationCountry: 'IN', requirement: 'visa_required', maxStay: '30-180 days', notes: 'e-Visa available', processingTime: '3-5 days', cost: '$25-100' },
    { destinationCountry: 'BR', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes' },
    { destinationCountry: 'RU', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '10-20 days', cost: '$160' },
    { destinationCountry: 'TH', requirement: 'visa_free', maxStay: '30 days', notes: 'By air, 15 days by land' },
    { destinationCountry: 'EG', requirement: 'visa_on_arrival', maxStay: '30 days', notes: 'Available at airports', cost: '$25' }
  ],
  'GB': [
    { destinationCountry: 'US', requirement: 'eta_required', maxStay: '90 days', notes: 'ESTA required', processingTime: '72 hours', cost: '$21' },
    { destinationCountry: 'DE', requirement: 'visa_free', maxStay: '90 days', notes: 'EU/Schengen area' },
    { destinationCountry: 'JP', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes only' },
    { destinationCountry: 'AU', requirement: 'eta_required', maxStay: '90 days', notes: 'ETA required', processingTime: '1 day', cost: '$20' },
    { destinationCountry: 'CN', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '4-10 days', cost: '$140' },
    { destinationCountry: 'IN', requirement: 'visa_required', maxStay: '30-180 days', notes: 'e-Visa available', processingTime: '3-5 days', cost: '$25-100' },
    { destinationCountry: 'CA', requirement: 'eta_required', maxStay: '6 months', notes: 'eTA required', processingTime: 'Minutes', cost: '$7' },
    { destinationCountry: 'BR', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes' },
    { destinationCountry: 'RU', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '10-20 days', cost: '$160' },
    { destinationCountry: 'TH', requirement: 'visa_free', maxStay: '30 days', notes: 'Tourist purposes' }
  ],
  'DE': [
    { destinationCountry: 'US', requirement: 'eta_required', maxStay: '90 days', notes: 'ESTA required', processingTime: '72 hours', cost: '$21' },
    { destinationCountry: 'GB', requirement: 'visa_free', maxStay: '6 months', notes: 'Tourist purposes' },
    { destinationCountry: 'JP', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes only' },
    { destinationCountry: 'AU', requirement: 'eta_required', maxStay: '90 days', notes: 'ETA required', processingTime: '1 day', cost: '$20' },
    { destinationCountry: 'CN', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '4-10 days', cost: '$140' },
    { destinationCountry: 'IN', requirement: 'visa_required', maxStay: '30-180 days', notes: 'e-Visa available', processingTime: '3-5 days', cost: '$25-100' },
    { destinationCountry: 'CA', requirement: 'eta_required', maxStay: '6 months', notes: 'eTA required', processingTime: 'Minutes', cost: '$7' },
    { destinationCountry: 'BR', requirement: 'visa_free', maxStay: '90 days', notes: 'Tourist purposes' },
    { destinationCountry: 'RU', requirement: 'visa_required', maxStay: 'Varies', notes: 'Tourist visa required', processingTime: '10-20 days', cost: '$160' },
    { destinationCountry: 'TH', requirement: 'visa_free', maxStay: '30 days', notes: 'Tourist purposes' }
  ]
};

export default function VisaChecker() {
  const [fromCountry, setFromCountry] = useState('');
  const [toCountry, setToCountry] = useState('');
  const [visaInfo, setVisaInfo] = useState<VisaRequirement | null>(null);
  const [showResult, setShowResult] = useState(false);

  const checkVisa = () => {
    if (!fromCountry || !toCountry) return;

    const requirements = visaRequirements[fromCountry];
    if (requirements) {
      const requirement = requirements.find(req => req.destinationCountry === toCountry);
      if (requirement) {
        setVisaInfo(requirement);
        setShowResult(true);
        return;
      }
    }

    // Default fallback
    setVisaInfo({
      destinationCountry: toCountry,
      requirement: 'visa_required',
      maxStay: 'Varies',
      notes: 'Please check with the embassy or consulate for specific requirements.',
      processingTime: 'Varies',
      cost: 'Varies'
    });
    setShowResult(true);
  };

  const getRequirementIcon = (requirement: string) => {
    switch (requirement) {
      case 'visa_free':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'visa_on_arrival':
        return <Clock className="w-6 h-6 text-blue-600" />;
      case 'eta_required':
        return <FileText className="w-6 h-6 text-orange-600" />;
      case 'visa_required':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <AlertTriangle className="w-6 h-6 text-gray-600" />;
    }
  };

  const getRequirementColor = (requirement: string) => {
    switch (requirement) {
      case 'visa_free':
        return 'bg-green-50 border-green-200';
      case 'visa_on_arrival':
        return 'bg-blue-50 border-blue-200';
      case 'eta_required':
        return 'bg-orange-50 border-orange-200';
      case 'visa_required':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRequirementText = (requirement: string) => {
    switch (requirement) {
      case 'visa_free':
        return 'Visa Free';
      case 'visa_on_arrival':
        return 'Visa on Arrival';
      case 'eta_required':
        return 'ETA/ESTA Required';
      case 'visa_required':
        return 'Visa Required';
      default:
        return 'Check Requirements';
    }
  };

  const reset = () => {
    setFromCountry('');
    setToCountry('');
    setVisaInfo(null);
    setShowResult(false);
  };

  const fromCountryData = countries.find(c => c.code === fromCountry);
  const toCountryData = countries.find(c => c.code === toCountry);

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
              <Plane className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">Visa Requirements Checker</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  <span>Check Visa Requirements</span>
                </CardTitle>
                <CardDescription>
                  Select your passport country and destination to check visa requirements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* From Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Passport Country</label>
                  <Select value={fromCountry} onValueChange={setFromCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your passport country" />
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

                {/* To Country */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination Country</label>
                  <Select value={toCountry} onValueChange={setToCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.filter(c => c.code !== fromCountry).map((country) => (
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

                {/* Check Button */}
                <Button 
                  onClick={checkVisa}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!fromCountry || !toCountry}
                  size="lg"
                >
                  <Plane className="w-4 h-4 mr-2" />
                  Check Visa Requirements
                </Button>

                {showResult && (
                  <Button onClick={reset} variant="outline" className="w-full">
                    Check Another Country
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Popular Destinations */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Popular Destinations</CardTitle>
                <CardDescription>Quick access to frequently checked countries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['US', 'GB', 'DE', 'JP', 'AU', 'CA'].map((countryCode) => {
                    const country = countries.find(c => c.code === countryCode);
                    return (
                      <button
                        key={countryCode}
                        onClick={() => setToCountry(countryCode)}
                        className="p-3 text-center border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                      >
                        <div className="text-2xl mb-1">{country?.flag}</div>
                        <div className="text-xs font-medium">{country?.name}</div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {showResult && visaInfo && fromCountryData && toCountryData ? (
              <>
                <Card className={`shadow-lg border-2 ${getRequirementColor(visaInfo.requirement)}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRequirementIcon(visaInfo.requirement)}
                        <div>
                          <CardTitle className="text-xl">{getRequirementText(visaInfo.requirement)}</CardTitle>
                          <CardDescription>
                            {fromCountryData.flag} {fromCountryData.name} → {toCountryData.flag} {toCountryData.name}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={visaInfo.requirement === 'visa_free' ? 'default' : 
                                visaInfo.requirement === 'visa_on_arrival' ? 'secondary' :
                                visaInfo.requirement === 'eta_required' ? 'outline' : 'destructive'}
                      >
                        {getRequirementText(visaInfo.requirement)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">Maximum Stay</h4>
                        <p className="text-gray-700">{visaInfo.maxStay}</p>
                      </div>
                      {visaInfo.processingTime && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Processing Time</h4>
                          <p className="text-gray-700">{visaInfo.processingTime}</p>
                        </div>
                      )}
                      {visaInfo.cost && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Cost</h4>
                          <p className="text-gray-700">{visaInfo.cost}</p>
                        </div>
                      )}
                      {visaInfo.validityPeriod && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">Validity Period</h4>
                          <p className="text-gray-700">{visaInfo.validityPeriod}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Important Notes</h4>
                      <p className="text-gray-700">{visaInfo.notes}</p>
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Visa requirements can change. Always verify with official embassy sources before traveling.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Travel Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Check passport validity - many countries require 6 months remaining validity</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Ensure you have blank pages in your passport for stamps</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Consider travel insurance for international trips</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <span>Check if you need specific vaccinations for your destination</span>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="py-12 text-center text-gray-500">
                  <Plane className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select your passport country and destination to check visa requirements</p>
                </CardContent>
              </Card>
            )}

            {/* Visa Types Info */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Visa Requirement Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-800">Visa Free</h4>
                    <p className="text-sm text-gray-600">No visa required for short-term visits</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-800">Visa on Arrival</h4>
                    <p className="text-sm text-gray-600">Visa issued at the port of entry</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-800">ETA/ESTA Required</h4>
                    <p className="text-sm text-gray-600">Electronic travel authorization needed</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Visa Required</h4>
                    <p className="text-sm text-gray-600">Must obtain visa before travel</p>
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