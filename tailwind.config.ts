import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Custom Color Palette - Primary Colors
        ocean: {
          50: "hsl(var(--ocean-50))",
          100: "hsl(var(--ocean-100))",
          200: "hsl(var(--ocean-200))",
          300: "hsl(var(--ocean-300))",
          400: "hsl(var(--ocean-400))",
          500: "hsl(var(--ocean-500))", // Base color #BBDCE5
          600: "hsl(var(--ocean-600))",
          700: "hsl(var(--ocean-700))",
          800: "hsl(var(--ocean-800))",
          900: "hsl(var(--ocean-900))",
          950: "hsl(var(--ocean-950))",
        },
        cream: {
          50: "hsl(var(--cream-50))",
          100: "hsl(var(--cream-100))",
          200: "hsl(var(--cream-200))",
          300: "hsl(var(--cream-300))",
          400: "hsl(var(--cream-400))",
          500: "hsl(var(--cream-500))", // Base color #ECEEDF
          600: "hsl(var(--cream-600))",
          700: "hsl(var(--cream-700))",
          800: "hsl(var(--cream-800))",
          900: "hsl(var(--cream-900))",
          950: "hsl(var(--cream-950))",
        },
        "warm-beige": {
          50: "hsl(var(--warm-beige-50))",
          100: "hsl(var(--warm-beige-100))",
          200: "hsl(var(--warm-beige-200))",
          300: "hsl(var(--warm-beige-300))",
          400: "hsl(var(--warm-beige-400))",
          500: "hsl(var(--warm-beige-500))", // Base color #D9C4B0
          600: "hsl(var(--warm-beige-600))",
          700: "hsl(var(--warm-beige-700))",
          800: "hsl(var(--warm-beige-800))",
          900: "hsl(var(--warm-beige-900))",
          950: "hsl(var(--warm-beige-950))",
        },
        "rich-beige": {
          50: "hsl(var(--rich-beige-50))",
          100: "hsl(var(--rich-beige-100))",
          200: "hsl(var(--rich-beige-200))",
          300: "hsl(var(--rich-beige-300))",
          400: "hsl(var(--rich-beige-400))",
          500: "hsl(var(--rich-beige-500))", // Base color #CFAB8D
          600: "hsl(var(--rich-beige-600))",
          700: "hsl(var(--rich-beige-700))",
          800: "hsl(var(--rich-beige-800))",
          900: "hsl(var(--rich-beige-900))",
          950: "hsl(var(--rich-beige-950))",
        },
        // Semantic Colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
