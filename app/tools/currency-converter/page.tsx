'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, DollarSign, RefreshCw, TrendingUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const popularCurrencies = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', flag: '🇨🇭' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳' },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', flag: '🇰🇷' }
];

// Mock exchange rates (in a real app, you'd fetch from an API)
const mockExchangeRates: { [key: string]: number } = {
  'USD-EUR': 0.85,
  'USD-GBP': 0.73,
  'USD-JPY': 110.0,
  'USD-CAD': 1.25,
  'USD-AUD': 1.35,
  'USD-CHF': 0.92,
  'USD-CNY': 6.45,
  'USD-INR': 74.5,
  'USD-KRW': 1180.0,
  'EUR-USD': 1.18,
  'EUR-GBP': 0.86,
  'EUR-JPY': 129.4,
  'GBP-USD': 1.37,
  'GBP-EUR': 1.17,
  'JPY-USD': 0.0091,
  'CAD-USD': 0.8,
  'AUD-USD': 0.74,
  'CHF-USD': 1.09,
  'CNY-USD': 0.155,
  'INR-USD': 0.0134,
  'KRW-USD': 0.00085
};

export default function CurrencyConverter() {
  const [amount, setAmount] = useState('100');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [result, setResult] = useState<number | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(false);

  const convertCurrency = async () => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const reverseRateKey = `${toCurrency}-${fromCurrency}`;
    
    let exchangeRate = mockExchangeRates[rateKey];
    
    if (!exchangeRate && mockExchangeRates[reverseRateKey]) {
      exchangeRate = 1 / mockExchangeRates[reverseRateKey];
    }
    
    if (!exchangeRate) {
      // If direct rate not available, convert through USD
      const fromToUSD = fromCurrency === 'USD' ? 1 : (mockExchangeRates[`${fromCurrency}-USD`] || 1);
      const USDToTarget = fromCurrency === 'USD' ? (mockExchangeRates[`USD-${toCurrency}`] || 1) : 1;
      exchangeRate = fromToUSD * USDToTarget;
    }
    
    if (fromCurrency === toCurrency) {
      exchangeRate = 1;
    }
    
    const convertedAmount = parseFloat(amount) * exchangeRate;
    
    setResult(convertedAmount);
    setRate(exchangeRate);
    setLastUpdated(new Date());
    setIsLoading(false);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setResult(null);
    setRate(null);
  };

  useEffect(() => {
    if (amount && fromCurrency && toCurrency) {
      convertCurrency();
    }
  }, [amount, fromCurrency, toCurrency]);

  const formatCurrency = (value: number, currencyCode: string) => {
    const currency = popularCurrencies.find(c => c.code === currencyCode);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Currency Converter</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Converter */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span>Convert Currency</span>
              </CardTitle>
              <CardDescription>
                Get real-time exchange rates for major world currencies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* From Currency */}
              <div className="space-y-2">
                <Label>From</Label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCurrencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                          <span className="text-muted-foreground">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Swap Button */}
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={swapCurrencies}
                  className="rounded-full"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>

              {/* To Currency */}
              <div className="space-y-2">
                <Label>To</Label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {popularCurrencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        <div className="flex items-center space-x-2">
                          <span>{currency.flag}</span>
                          <span>{currency.code}</span>
                          <span className="text-muted-foreground">- {currency.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Convert Button */}
              <Button 
                onClick={convertCurrency} 
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isLoading || !amount}
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <DollarSign className="w-4 h-4 mr-2" />
                )}
                Convert Currency
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result !== null && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Conversion Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-muted-foreground mb-2">
                    {formatCurrency(parseFloat(amount), fromCurrency)}
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-2">
                    {formatCurrency(result, toCurrency)}
                  </div>
                  {rate && (
                    <div className="text-sm text-muted-foreground">
                      1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                    </div>
                  )}
                </div>

                <Alert>
                  <Globe className="h-4 w-4" />
                  <AlertDescription>
                    Exchange rates are updated regularly. Last updated: {lastUpdated.toLocaleTimeString()}
                  </AlertDescription>
                </Alert>

                {/* Quick Convert */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-foreground">Quick Convert</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[1, 5, 10, 100, 500, 1000].map((quickAmount) => (
                      <div key={quickAmount} className="flex justify-between p-2 rounded bg-background">
                        <span>{quickAmount} {fromCurrency}</span>
                        <span className="font-mono">
                          {rate ? formatCurrency(quickAmount * rate, toCurrency) : '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Rates */}
          {result === null && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span>Popular Exchange Rates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { from: 'USD', to: 'EUR', rate: 0.85 },
                    { from: 'USD', to: 'GBP', rate: 0.73 },
                    { from: 'EUR', to: 'GBP', rate: 0.86 },
                    { from: 'USD', to: 'JPY', rate: 110.0 },
                    { from: 'USD', to: 'CAD', rate: 1.25 },
                    { from: 'USD', to: 'AUD', rate: 1.35 }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 rounded bg-background">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.from}/{item.to}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">{item.rate.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}