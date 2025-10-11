'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plane, Euro, MapPin, Calculator, PieChart, Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

interface Country {
  code: string;
  name: string;
  flag: string;
  avgDailyBudget: {
    budget: number;
    midRange: number;
    luxury: number;
  };
  currency: string;
}

interface TripSegment {
  id: string;
  country: string;
  days: number;
  budgetLevel: 'budget' | 'midRange' | 'luxury';
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  miscellaneous: number;
}

interface BudgetBreakdown {
  totalCost: number;
  dailyAverage: number;
  categoryBreakdown: {
    accommodation: number;
    food: number;
    transport: number;
    activities: number;
    miscellaneous: number;
  };
  countryBreakdown: { [key: string]: number };
}

const schengenCountries: Country[] = [
  { code: 'AT', name: 'Austria', flag: '🇦🇹', avgDailyBudget: { budget: 45, midRange: 85, luxury: 150 }, currency: 'EUR' },
  { code: 'BE', name: 'Belgium', flag: '🇧🇪', avgDailyBudget: { budget: 50, midRange: 90, luxury: 160 }, currency: 'EUR' },
  { code: 'CZ', name: 'Czech Republic', flag: '🇨🇿', avgDailyBudget: { budget: 30, midRange: 60, luxury: 120 }, currency: 'CZK' },
  { code: 'DK', name: 'Denmark', flag: '🇩🇰', avgDailyBudget: { budget: 70, midRange: 120, luxury: 200 }, currency: 'DKK' },
  { code: 'EE', name: 'Estonia', flag: '🇪🇪', avgDailyBudget: { budget: 35, midRange: 65, luxury: 110 }, currency: 'EUR' },
  { code: 'FI', name: 'Finland', flag: '🇫🇮', avgDailyBudget: { budget: 60, midRange: 110, luxury: 180 }, currency: 'EUR' },
  { code: 'FR', name: 'France', flag: '🇫🇷', avgDailyBudget: { budget: 55, midRange: 100, luxury: 180 }, currency: 'EUR' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', avgDailyBudget: { budget: 50, midRange: 90, luxury: 160 }, currency: 'EUR' },
  { code: 'GR', name: 'Greece', flag: '🇬🇷', avgDailyBudget: { budget: 40, midRange: 75, luxury: 140 }, currency: 'EUR' },
  { code: 'HU', name: 'Hungary', flag: '🇭🇺', avgDailyBudget: { budget: 30, midRange: 55, luxury: 100 }, currency: 'HUF' },
  { code: 'IS', name: 'Iceland', flag: '🇮🇸', avgDailyBudget: { budget: 80, midRange: 140, luxury: 250 }, currency: 'ISK' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹', avgDailyBudget: { budget: 45, midRange: 85, luxury: 150 }, currency: 'EUR' },
  { code: 'LV', name: 'Latvia', flag: '🇱🇻', avgDailyBudget: { budget: 35, midRange: 65, luxury: 110 }, currency: 'EUR' },
  { code: 'LI', name: 'Liechtenstein', flag: '🇱🇮', avgDailyBudget: { budget: 90, midRange: 150, luxury: 250 }, currency: 'CHF' },
  { code: 'LT', name: 'Lithuania', flag: '🇱🇹', avgDailyBudget: { budget: 35, midRange: 65, luxury: 110 }, currency: 'EUR' },
  { code: 'LU', name: 'Luxembourg', flag: '🇱🇺', avgDailyBudget: { budget: 70, midRange: 120, luxury: 200 }, currency: 'EUR' },
  { code: 'MT', name: 'Malta', flag: '🇲🇹', avgDailyBudget: { budget: 40, midRange: 75, luxury: 130 }, currency: 'EUR' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', avgDailyBudget: { budget: 55, midRange: 100, luxury: 170 }, currency: 'EUR' },
  { code: 'NO', name: 'Norway', flag: '🇳🇴', avgDailyBudget: { budget: 90, midRange: 150, luxury: 250 }, currency: 'NOK' },
  { code: 'PL', name: 'Poland', flag: '🇵🇱', avgDailyBudget: { budget: 30, midRange: 55, luxury: 100 }, currency: 'PLN' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹', avgDailyBudget: { budget: 35, midRange: 65, luxury: 120 }, currency: 'EUR' },
  { code: 'SK', name: 'Slovakia', flag: '🇸🇰', avgDailyBudget: { budget: 30, midRange: 55, luxury: 100 }, currency: 'EUR' },
  { code: 'SI', name: 'Slovenia', flag: '🇸🇮', avgDailyBudget: { budget: 40, midRange: 70, luxury: 120 }, currency: 'EUR' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸', avgDailyBudget: { budget: 40, midRange: 75, luxury: 140 }, currency: 'EUR' },
  { code: 'SE', name: 'Sweden', flag: '🇸🇪', avgDailyBudget: { budget: 65, midRange: 115, luxury: 190 }, currency: 'SEK' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', avgDailyBudget: { budget: 100, midRange: 170, luxury: 300 }, currency: 'CHF' }
];

export default function SchengenBudgetPlanner() {
  const [tripSegments, setTripSegments] = useState<TripSegment[]>([]);
  const [newSegment, setNewSegment] = useState<Partial<TripSegment>>({
    country: '',
    days: 1,
    budgetLevel: 'midRange'
  });
  const [budgetBreakdown, setBudgetBreakdown] = useState<BudgetBreakdown | null>(null);
  const [tripNotes, setTripNotes] = useState('');

  const addTripSegment = () => {
    if (!newSegment.country || !newSegment.days) return;

    const country = schengenCountries.find(c => c.code === newSegment.country);
    if (!country) return;

    const baseBudget = country.avgDailyBudget[newSegment.budgetLevel as keyof typeof country.avgDailyBudget];
    
    const segment: TripSegment = {
      id: Date.now().toString(),
      country: newSegment.country,
      days: newSegment.days,
      budgetLevel: newSegment.budgetLevel as 'budget' | 'midRange' | 'luxury',
      accommodation: Math.round(baseBudget * 0.4),
      food: Math.round(baseBudget * 0.3),
      transport: Math.round(baseBudget * 0.15),
      activities: Math.round(baseBudget * 0.1),
      miscellaneous: Math.round(baseBudget * 0.05)
    };

    setTripSegments(prev => [...prev, segment]);
    setNewSegment({ country: '', days: 1, budgetLevel: 'midRange' });
  };

  const removeSegment = (id: string) => {
    setTripSegments(prev => prev.filter(segment => segment.id !== id));
  };

  const updateSegment = (id: string, field: keyof TripSegment, value: any) => {
    setTripSegments(prev => prev.map(segment => 
      segment.id === id ? { ...segment, [field]: value } : segment
    ));
  };

  const calculateBudget = () => {
    if (tripSegments.length === 0) return;

    let totalCost = 0;
    let totalDays = 0;
    const categoryBreakdown = {
      accommodation: 0,
      food: 0,
      transport: 0,
      activities: 0,
      miscellaneous: 0
    };
    const countryBreakdown: { [key: string]: number } = {};

    tripSegments.forEach(segment => {
      const segmentTotal = (segment.accommodation + segment.food + segment.transport + 
                           segment.activities + segment.miscellaneous) * segment.days;
      
      totalCost += segmentTotal;
      totalDays += segment.days;
      
      categoryBreakdown.accommodation += segment.accommodation * segment.days;
      categoryBreakdown.food += segment.food * segment.days;
      categoryBreakdown.transport += segment.transport * segment.days;
      categoryBreakdown.activities += segment.activities * segment.days;
      categoryBreakdown.miscellaneous += segment.miscellaneous * segment.days;
      
      const countryName = schengenCountries.find(c => c.code === segment.country)?.name || segment.country;
      countryBreakdown[countryName] = (countryBreakdown[countryName] || 0) + segmentTotal;
    });

    setBudgetBreakdown({
      totalCost,
      dailyAverage: totalDays > 0 ? totalCost / totalDays : 0,
      categoryBreakdown,
      countryBreakdown
    });
  };

  const downloadBudget = () => {
    if (!budgetBreakdown) return;

    const content = `Schengen Trip Budget Plan
Generated on: ${new Date().toLocaleDateString()}

TRIP OVERVIEW
=============
Total Trip Cost: €${budgetBreakdown.totalCost.toFixed(2)}
Daily Average: €${budgetBreakdown.dailyAverage.toFixed(2)}
Total Days: ${tripSegments.reduce((sum, segment) => sum + segment.days, 0)}

ITINERARY
=========
${tripSegments.map(segment => {
  const country = schengenCountries.find(c => c.code === segment.country);
  const dailyTotal = segment.accommodation + segment.food + segment.transport + segment.activities + segment.miscellaneous;
  return `${country?.flag} ${country?.name} - ${segment.days} days (€${(dailyTotal * segment.days).toFixed(2)})
  Daily Budget: €${dailyTotal.toFixed(2)} (${segment.budgetLevel})
  - Accommodation: €${segment.accommodation.toFixed(2)}
  - Food: €${segment.food.toFixed(2)}
  - Transport: €${segment.transport.toFixed(2)}
  - Activities: €${segment.activities.toFixed(2)}
  - Miscellaneous: €${segment.miscellaneous.toFixed(2)}`;
}).join('\n\n')}

BUDGET BREAKDOWN BY CATEGORY
============================
Accommodation: €${budgetBreakdown.categoryBreakdown.accommodation.toFixed(2)} (${((budgetBreakdown.categoryBreakdown.accommodation / budgetBreakdown.totalCost) * 100).toFixed(1)}%)
Food: €${budgetBreakdown.categoryBreakdown.food.toFixed(2)} (${((budgetBreakdown.categoryBreakdown.food / budgetBreakdown.totalCost) * 100).toFixed(1)}%)
Transport: €${budgetBreakdown.categoryBreakdown.transport.toFixed(2)} (${((budgetBreakdown.categoryBreakdown.transport / budgetBreakdown.totalCost) * 100).toFixed(1)}%)
Activities: €${budgetBreakdown.categoryBreakdown.activities.toFixed(2)} (${((budgetBreakdown.categoryBreakdown.activities / budgetBreakdown.totalCost) * 100).toFixed(1)}%)
Miscellaneous: €${budgetBreakdown.categoryBreakdown.miscellaneous.toFixed(2)} (${((budgetBreakdown.categoryBreakdown.miscellaneous / budgetBreakdown.totalCost) * 100).toFixed(1)}%)

BUDGET BREAKDOWN BY COUNTRY
===========================
${Object.entries(budgetBreakdown.countryBreakdown).map(([country, cost]) => 
  `${country}: €${cost.toFixed(2)} (${((cost / budgetBreakdown.totalCost) * 100).toFixed(1)}%)`
).join('\n')}

NOTES
=====
${tripNotes || 'No additional notes'}

IMPORTANT REMINDERS
==================
- Budget amounts are estimates based on average costs
- Actual costs may vary depending on season, location, and personal preferences
- Consider adding 10-20% buffer for unexpected expenses
- Check visa requirements and travel insurance
- Monitor exchange rates if traveling to non-Euro countries
- Keep receipts for expense tracking`;

    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'schengen-budget-plan.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const resetPlanner = () => {
    setTripSegments([]);
    setBudgetBreakdown(null);
    setTripNotes('');
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
              <Plane className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Schengen Budget Planner</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Planning Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Trip Segment */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>Plan Your Trip</span>
                </CardTitle>
                <CardDescription>
                  Add countries and duration to build your Schengen area itinerary
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Country</Label>
                    <Select 
                      value={newSegment.country} 
                      onValueChange={(value) => setNewSegment(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {schengenCountries.map(country => (
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

                  <div className="space-y-2">
                    <Label>Days</Label>
                    <Input
                      type="number"
                      min="1"
                      max="90"
                      value={newSegment.days}
                      onChange={(e) => setNewSegment(prev => ({ ...prev, days: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Budget Level</Label>
                    <Select 
                      value={newSegment.budgetLevel} 
                      onValueChange={(value: any) => setNewSegment(prev => ({ ...prev, budgetLevel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="midRange">Mid-Range</SelectItem>
                        <SelectItem value="luxury">Luxury</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button 
                      onClick={addTripSegment}
                      disabled={!newSegment.country || !newSegment.days}
                      className="w-full"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add
                    </Button>
                  </div>
                </div>

                {newSegment.country && (
                  <Alert>
                    <Euro className="h-4 w-4" />
                    <AlertDescription>
                      {(() => {
                        const country = schengenCountries.find(c => c.code === newSegment.country);
                        const budget = country?.avgDailyBudget[newSegment.budgetLevel as keyof typeof country.avgDailyBudget];
                        return `Average daily budget for ${country?.name}: €${budget} (${newSegment.budgetLevel})`;
                      })()}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Trip Segments */}
            {tripSegments.length > 0 && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Your Itinerary</CardTitle>
                  <CardDescription>
                    {tripSegments.length} destination{tripSegments.length > 1 ? 's' : ''} • {tripSegments.reduce((sum, segment) => sum + segment.days, 0)} days total
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tripSegments.map((segment, index) => {
                    const country = schengenCountries.find(c => c.code === segment.country);
                    const dailyTotal = segment.accommodation + segment.food + segment.transport + segment.activities + segment.miscellaneous;
                    
                    return (
                      <div key={segment.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{country?.flag}</span>
                            <div>
                              <h3 className="font-semibold">{country?.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {segment.days} days • {segment.budgetLevel} • €{(dailyTotal * segment.days).toFixed(2)} total
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSegment(segment.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Accommodation</Label>
                            <Input
                              type="number"
                              value={segment.accommodation}
                              onChange={(e) => updateSegment(segment.id, 'accommodation', Number(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Food</Label>
                            <Input
                              type="number"
                              value={segment.food}
                              onChange={(e) => updateSegment(segment.id, 'food', Number(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Transport</Label>
                            <Input
                              type="number"
                              value={segment.transport}
                              onChange={(e) => updateSegment(segment.id, 'transport', Number(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Activities</Label>
                            <Input
                              type="number"
                              value={segment.activities}
                              onChange={(e) => updateSegment(segment.id, 'activities', Number(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Miscellaneous</Label>
                            <Input
                              type="number"
                              value={segment.miscellaneous}
                              onChange={(e) => updateSegment(segment.id, 'miscellaneous', Number(e.target.value))}
                              className="text-sm"
                            />
                          </div>
                        </div>

                        <div className="text-center p-2 bg-background rounded">
                          <span className="font-medium">Daily Total: €{dailyTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}

                  <div className="flex space-x-3">
                    <Button onClick={calculateBudget} className="flex-1">
                      <Calculator className="w-4 h-4 mr-2" />
                      Calculate Budget
                    </Button>
                    <Button variant="outline" onClick={resetPlanner}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Notes */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Trip Notes</CardTitle>
                <CardDescription>Add any additional notes or reminders for your trip</CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={tripNotes}
                  onChange={(e) => setTripNotes(e.target.value)}
                  placeholder="Add notes about your trip plans, special requirements, or reminders..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>

          {/* Budget Summary */}
          <div className="space-y-6">
            {budgetBreakdown ? (
              <>
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Euro className="w-5 h-5 text-primary" />
                      <span>Budget Summary</span>
                    </CardTitle>
                    <CardDescription>
                      Total estimated cost for your Schengen trip
                    </CardDescription>
                    <Button size="sm" onClick={downloadBudget} className="w-full">
                      <Download className="w-3 h-3 mr-1" />
                      Download Budget Plan
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">
                        €{budgetBreakdown.totalCost.toFixed(2)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Trip Cost</div>
                    </div>

                    <div className="text-center p-3 bg-background rounded-lg">
                      <div className="text-xl font-semibold text-blue-700">
                        €{budgetBreakdown.dailyAverage.toFixed(2)}
                      </div>
                      <div className="text-sm text-primary">Average per day</div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <PieChart className="w-5 h-5 text-primary" />
                      <span>By Category</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(budgetBreakdown.categoryBreakdown).map(([category, amount]) => {
                      const percentage = (amount / budgetBreakdown.totalCost) * 100;
                      return (
                        <div key={category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{category}</span>
                            <span>€{amount.toFixed(2)}</span>
                          </div>
                          <div className="w-full bg-accent rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-muted-foreground text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>By Country</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(budgetBreakdown.countryBreakdown).map(([country, amount]) => {
                      const percentage = (amount / budgetBreakdown.totalCost) * 100;
                      const countryData = schengenCountries.find(c => c.name === country);
                      return (
                        <div key={country} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span>{countryData?.flag}</span>
                            <span className="text-sm">{country}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">€{amount.toFixed(2)}</div>
                            <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="shadow-lg border-0">
                <CardContent className="py-12 text-center text-muted-foreground">
                  <Euro className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Add destinations to see your budget breakdown</p>
                  <p className="text-sm">Plan your Schengen area trip with accurate cost estimates</p>
                </CardContent>
              </Card>
            )}

            {/* Tips */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Budget Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Add 10-20% buffer for unexpected expenses</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Book accommodations early for better rates</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Consider city passes for attractions</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Use public transport for savings</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Check free walking tours and museums</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}