'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Info, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function BMICalculator() {
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState('metric'); // metric or imperial
  const [result, setResult] = useState<{
    bmi: number;
    category: string;
    description: string;
    color: string;
  } | null>(null);

  const calculateBMI = () => {
    if (!height || !weight) return;

    let heightInMeters = parseFloat(height);
    let weightInKg = parseFloat(weight);

    // Convert if imperial units
    if (unit === 'imperial') {
      heightInMeters = heightInMeters * 0.0254; // inches to meters
      weightInKg = weightInKg * 0.453592; // pounds to kg
    } else {
      heightInMeters = heightInMeters / 100; // cm to meters
    }

    const bmi = weightInKg / (heightInMeters * heightInMeters);
    
    let category = '';
    let description = '';
    let color = '';

    if (bmi < 16) {
      category = 'Severely Underweight';
      description = 'Seek medical attention for healthy weight gain guidance.';
      color = 'text-red-600';
    } else if (bmi < 18.5) {
      category = 'Underweight';
      description = 'Consider consulting with a healthcare provider about healthy weight gain.';
      color = 'text-yellow-600';
    } else if (bmi < 25) {
      category = 'Normal Weight';
      description = 'Great! You have a healthy weight for your height.';
      color = 'text-green-600';
    } else if (bmi < 30) {
      category = 'Overweight';
      description = 'Consider lifestyle changes like diet and exercise for better health.';
      color = 'text-orange-600';
    } else if (bmi < 35) {
      category = 'Obese Class I';
      description = 'Health risks increase. Consider consulting with a healthcare provider.';
      color = 'text-red-600';
    } else if (bmi < 40) {
      category = 'Obese Class II';
      description = 'Significant health risks. Medical consultation is recommended.';
      color = 'text-red-700';
    } else {
      category = 'Obese Class III';
      description = 'Severe health risks. Immediate medical attention is advised.';
      color = 'text-red-800';
    }

    setResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      description,
      color
    });
  };

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Calculator className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">BMI Calculator</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calculator */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                <span>Calculate Your BMI</span>
              </CardTitle>
              <CardDescription>
                Enter your height and weight to calculate your Body Mass Index
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Unit Selection */}
              <div className="flex space-x-4">
                <Button
                  variant={unit === 'metric' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('metric')}
                  className="flex-1"
                >
                  Metric (cm/kg)
                </Button>
                <Button
                  variant={unit === 'imperial' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUnit('imperial')}
                  className="flex-1"
                >
                  Imperial (in/lbs)
                </Button>
              </div>

              {/* Height Input */}
              <div className="space-y-2">
                <Label htmlFor="height">
                  Height {unit === 'metric' ? '(cm)' : '(inches)'}
                </Label>
                <Input
                  id="height"
                  type="number"
                  placeholder={unit === 'metric' ? 'e.g., 170' : 'e.g., 67'}
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Weight Input */}
              <div className="space-y-2">
                <Label htmlFor="weight">
                  Weight {unit === 'metric' ? '(kg)' : '(lbs)'}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="text-lg"
                />
              </div>

              {/* Buttons */}
              <div className="flex space-x-3">
                <Button 
                  onClick={calculateBMI} 
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={!height || !weight}
                >
                  Calculate BMI
                </Button>
                <Button variant="outline" onClick={resetCalculator}>
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Your BMI Result</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {result.bmi}
                  </div>
                  <Badge variant="secondary" className={`text-sm ${result.color} bg-gray-100`}>
                    {result.category}
                  </Badge>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {result.description}
                  </AlertDescription>
                </Alert>

                {/* BMI Chart */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">BMI Categories</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center p-2 rounded bg-blue-50">
                      <span>Underweight</span>
                      <span className="font-mono">{'<'} 18.5</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-green-50">
                      <span>Normal weight</span>
                      <span className="font-mono">18.5 - 24.9</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-yellow-50">
                      <span>Overweight</span>
                      <span className="font-mono">25.0 - 29.9</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded bg-red-50">
                      <span>Obese</span>
                      <span className="font-mono">≥ 30.0</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Information */}
          {!result && (
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span>About BMI</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">
                  Body Mass Index (BMI) is a widely used screening tool to categorize 
                  individuals based on their weight and height relationship.
                </p>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">BMI Categories:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Underweight</span>
                      <span className="font-mono text-blue-600">{'<'} 18.5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Normal weight</span>
                      <span className="font-mono text-green-600">18.5 - 24.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Overweight</span>
                      <span className="font-mono text-yellow-600">25.0 - 29.9</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Obese</span>
                      <span className="font-mono text-red-600">≥ 30.0</span>
                    </div>
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    BMI is a screening tool and should not be used as a diagnostic tool. 
                    Consult with a healthcare professional for personalized health advice.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}