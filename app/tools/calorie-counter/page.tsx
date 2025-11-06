"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Apple,
  Plus,
  Trash2,
  Target,
  TrendingUp,
  Calendar,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  serving: string;
}

interface FoodEntry {
  id: string;
  food: Food;
  quantity: number;
  meal: "breakfast" | "lunch" | "dinner" | "snack";
  timestamp: Date;
}

interface UserProfile {
  age: number;
  gender: "male" | "female";
  weight: number;
  height: number;
  activityLevel: "sedentary" | "light" | "moderate" | "active" | "very_active";
  goal: "lose" | "maintain" | "gain";
}

const foodDatabase: Food[] = [
  {
    id: "1",
    name: "Apple",
    calories: 95,
    protein: 0.5,
    carbs: 25,
    fat: 0.3,
    serving: "1 medium (182g)",
  },
  {
    id: "2",
    name: "Banana",
    calories: 105,
    protein: 1.3,
    carbs: 27,
    fat: 0.4,
    serving: "1 medium (118g)",
  },
  {
    id: "3",
    name: "Chicken Breast",
    calories: 231,
    protein: 43.5,
    carbs: 0,
    fat: 5,
    serving: "100g",
  },
  {
    id: "4",
    name: "Brown Rice",
    calories: 216,
    protein: 5,
    carbs: 45,
    fat: 1.8,
    serving: "1 cup cooked (195g)",
  },
  {
    id: "5",
    name: "Broccoli",
    calories: 55,
    protein: 3.7,
    carbs: 11,
    fat: 0.6,
    serving: "1 cup chopped (91g)",
  },
  {
    id: "6",
    name: "Salmon",
    calories: 208,
    protein: 22,
    carbs: 0,
    fat: 12,
    serving: "100g",
  },
  {
    id: "7",
    name: "Oatmeal",
    calories: 147,
    protein: 5.4,
    carbs: 28,
    fat: 2.8,
    serving: "1 cup cooked (234g)",
  },
  {
    id: "8",
    name: "Greek Yogurt",
    calories: 100,
    protein: 17,
    carbs: 6,
    fat: 0.7,
    serving: "170g container",
  },
  {
    id: "9",
    name: "Almonds",
    calories: 164,
    protein: 6,
    carbs: 6,
    fat: 14,
    serving: "28g (23 almonds)",
  },
  {
    id: "10",
    name: "Sweet Potato",
    calories: 112,
    protein: 2,
    carbs: 26,
    fat: 0.1,
    serving: "1 medium (128g)",
  },
  {
    id: "11",
    name: "Eggs",
    calories: 155,
    protein: 13,
    carbs: 1.1,
    fat: 11,
    serving: "2 large eggs",
  },
  {
    id: "12",
    name: "Spinach",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fat: 0.4,
    serving: "100g",
  },
  {
    id: "13",
    name: "Quinoa",
    calories: 222,
    protein: 8,
    carbs: 39,
    fat: 3.6,
    serving: "1 cup cooked (185g)",
  },
  {
    id: "14",
    name: "Avocado",
    calories: 234,
    protein: 2.9,
    carbs: 12,
    fat: 21,
    serving: "1 medium (150g)",
  },
  {
    id: "15",
    name: "Whole Wheat Bread",
    calories: 81,
    protein: 4,
    carbs: 14,
    fat: 1.1,
    serving: "1 slice (28g)",
  },
];

export default function CalorieCounter() {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    age: 30,
    gender: "male",
    weight: 70,
    height: 175,
    activityLevel: "moderate",
    goal: "maintain",
  });

  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedMeal, setSelectedMeal] = useState<
    "breakfast" | "lunch" | "dinner" | "snack"
  >("breakfast");
  const [showProfile, setShowProfile] = useState(false);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { weight, height, age, gender } = userProfile;
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const activityMultipliers = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(bmr * activityMultipliers[userProfile.activityLevel]);
  };

  // Calculate daily calorie goal based on user's goal
  const calculateCalorieGoal = () => {
    const tdee = calculateTDEE();
    switch (userProfile.goal) {
      case "lose":
        return tdee - 500; // 500 calorie deficit for ~1lb/week loss
      case "gain":
        return tdee + 500; // 500 calorie surplus for ~1lb/week gain
      default:
        return tdee;
    }
  };

  const filteredFoods = foodDatabase.filter((food) =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addFoodEntry = () => {
    if (!selectedFood) return;

    const entry: FoodEntry = {
      id: Date.now().toString(),
      food: selectedFood,
      quantity,
      meal: selectedMeal,
      timestamp: new Date(),
    };

    setFoodEntries((prev) => [...prev, entry]);
    setSelectedFood(null);
    setQuantity(1);
    setSearchTerm("");
  };

  const removeFoodEntry = (id: string) => {
    setFoodEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const getTodaysEntries = () => {
    const today = new Date().toDateString();
    return foodEntries.filter(
      (entry) => entry.timestamp.toDateString() === today
    );
  };

  const calculateTotalNutrition = () => {
    const todaysEntries = getTodaysEntries();
    return todaysEntries.reduce(
      (total, entry) => ({
        calories: total.calories + entry.food.calories * entry.quantity,
        protein: total.protein + entry.food.protein * entry.quantity,
        carbs: total.carbs + entry.food.carbs * entry.quantity,
        fat: total.fat + entry.food.fat * entry.quantity,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const getMealEntries = (meal: string) => {
    return getTodaysEntries().filter((entry) => entry.meal === meal);
  };

  const getMealCalories = (meal: string) => {
    return getMealEntries(meal).reduce(
      (total, entry) => total + entry.food.calories * entry.quantity,
      0
    );
  };

  const totalNutrition = calculateTotalNutrition();
  const calorieGoal = calculateCalorieGoal();
  const remainingCalories = calorieGoal - totalNutrition.calories;
  const progressPercentage = Math.min(
    (totalNutrition.calories / calorieGoal) * 100,
    100
  );

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Tools</span>
            </Link>
            <div className="flex items-center space-x-2">
              <Apple className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                Calorie Counter
              </h1>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
            >
              Profile
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Daily Summary */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span>Today&apos;s Summary</span>
                </CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Calorie Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">Calories</span>
                    <span className="text-lg">
                      {Math.round(totalNutrition.calories)} / {calorieGoal}
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="w-full h-3" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Consumed: {Math.round(totalNutrition.calories)}</span>
                    <span
                      className={
                        remainingCalories >= 0
                          ? "text-primary"
                          : "text-destructive"
                      }
                    >
                      {remainingCalories >= 0 ? "Remaining" : "Over"}:{" "}
                      {Math.abs(remainingCalories)}
                    </span>
                  </div>
                </div>

                {/* Macronutrients */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(totalNutrition.protein)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Protein</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(totalNutrition.carbs)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Carbs</div>
                  </div>
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round(totalNutrition.fat)}g
                    </div>
                    <div className="text-sm text-muted-foreground">Fat</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Add Food */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="w-5 h-5 text-primary" />
                  <span>Add Food</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search */}
                <div className="space-y-2">
                  <Label>Search Food</Label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search for food..."
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Food Results */}
                {searchTerm && (
                  <div className="max-h-48 overflow-y-auto space-y-2">
                    {filteredFoods.map((food) => (
                      <button
                        key={food.id}
                        onClick={() => setSelectedFood(food)}
                        className={`w-full p-3 text-left border rounded-lg transition-colors ${
                          selectedFood?.id === food.id
                            ? "border-green-500 bg-background"
                            : "border-border hover:border-green-300 hover:bg-background"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{food.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {food.serving}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {food.calories} cal
                            </div>
                            <div className="text-xs text-muted-foreground">
                              P: {food.protein}g C: {food.carbs}g F: {food.fat}g
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected Food Details */}
                {selectedFood && (
                  <div className="p-4 bg-background rounded-lg space-y-4">
                    <div>
                      <h4 className="font-semibold">{selectedFood.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedFood.serving}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          min="0.1"
                          step="0.1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Meal</Label>
                        <Select
                          value={selectedMeal}
                          onValueChange={(value: any) => setSelectedMeal(value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                            <SelectItem value="snack">Snack</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center text-sm">
                      <div>
                        <div className="font-medium">
                          {Math.round(selectedFood.calories * quantity)}
                        </div>
                        <div className="text-muted-foreground">Calories</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {Math.round(selectedFood.protein * quantity * 10) /
                            10}
                          g
                        </div>
                        <div className="text-muted-foreground">Protein</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {Math.round(selectedFood.carbs * quantity * 10) / 10}g
                        </div>
                        <div className="text-muted-foreground">Carbs</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {Math.round(selectedFood.fat * quantity * 10) / 10}g
                        </div>
                        <div className="text-muted-foreground">Fat</div>
                      </div>
                    </div>

                    <Button onClick={addFoodEntry} className="w-full">
                      Add to{" "}
                      {selectedMeal.charAt(0).toUpperCase() +
                        selectedMeal.slice(1)}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Meals */}
            {["breakfast", "lunch", "dinner", "snack"].map((meal) => {
              const mealEntries = getMealEntries(meal);
              const mealCalories = getMealCalories(meal);

              return (
                <Card key={meal} className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="capitalize">{meal}</span>
                      <span className="text-lg font-normal">
                        {mealCalories} cal
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {mealEntries.length > 0 ? (
                      <div className="space-y-3">
                        {mealEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex items-center justify-between p-3 bg-background rounded-lg"
                          >
                            <div className="flex-1">
                              <div className="font-medium">
                                {entry.food.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {entry.quantity} × {entry.food.serving}
                              </div>
                            </div>
                            <div className="text-right mr-4">
                              <div className="font-medium">
                                {Math.round(
                                  entry.food.calories * entry.quantity
                                )}{" "}
                                cal
                              </div>
                              <div className="text-xs text-muted-foreground">
                                P:{" "}
                                {Math.round(
                                  entry.food.protein * entry.quantity * 10
                                ) / 10}
                                g C:{" "}
                                {Math.round(
                                  entry.food.carbs * entry.quantity * 10
                                ) / 10}
                                g F:{" "}
                                {Math.round(
                                  entry.food.fat * entry.quantity * 10
                                ) / 10}
                                g
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFoodEntry(entry.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">
                        No foods added to {meal}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Card */}
            {showProfile && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Age</Label>
                      <Input
                        type="number"
                        value={userProfile.age}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            age: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender</Label>
                      <Select
                        value={userProfile.gender}
                        onValueChange={(value) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            gender: value as "male" | "female",
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Weight (kg)</Label>
                      <Input
                        type="number"
                        value={userProfile.weight}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            weight: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Height (cm)</Label>
                      <Input
                        type="number"
                        value={userProfile.height}
                        onChange={(e) =>
                          setUserProfile((prev) => ({
                            ...prev,
                            height: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Activity Level</Label>
                    <Select
                      value={userProfile.activityLevel}
                      onValueChange={(value: any) =>
                        setUserProfile((prev) => ({
                          ...prev,
                          activityLevel: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentary">Sedentary</SelectItem>
                        <SelectItem value="light">Light Activity</SelectItem>
                        <SelectItem value="moderate">
                          Moderate Activity
                        </SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="very_active">Very Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Goal</Label>
                    <Select
                      value={userProfile.goal}
                      onValueChange={(value: any) =>
                        setUserProfile((prev) => ({ ...prev, goal: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lose">Lose Weight</SelectItem>
                        <SelectItem value="maintain">
                          Maintain Weight
                        </SelectItem>
                        <SelectItem value="gain">Gain Weight</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span>Daily Goals</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {calorieGoal}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Calorie Goal
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>BMR:</span>
                    <span className="font-medium">
                      {Math.round(calculateBMR())} cal
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>TDEE:</span>
                    <span className="font-medium">{calculateTDEE()} cal</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Goal:</span>
                    <span className="font-medium capitalize">
                      {userProfile.goal} weight
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Nutrition Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Aim for 0.8-1g protein per kg body weight</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Include fruits and vegetables in every meal</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Stay hydrated with 8-10 glasses of water daily</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-background0 rounded-full mt-2"></div>
                  <span>Choose whole grains over refined carbs</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
