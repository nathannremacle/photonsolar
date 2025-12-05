import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#E67E22",
          50: "#FDF2E9",
          100: "#FAE5D3",
          200: "#F5CBA7",
          300: "#F0B27A",
          400: "#EB984E",
          500: "#E67E22",
          600: "#CA6F1E",
          700: "#AF601A",
          800: "#935116",
          900: "#784212",
          950: "#452206", // Ajout
        },
        secondary: {
          DEFAULT: "#2C3E50",
          50: "#F4F6F7",
          100: "#EAECEE",
          200: "#D5D8DC",
          300: "#ABB2B9",
          400: "#808B96",
          500: "#566573",
          600: "#2C3E50",
          700: "#273746",
          800: "#212F3C",
          900: "#17202A",
          950: "#0B1015", // Ajout de la couleur très sombre manquante
        },
        accent: {
          DEFAULT: "#1ABC9C",
          500: "#1ABC9C",
          600: "#16A085",
        },
        surface: {
          light: "#FFFFFF",
          off: "#F8FAFC",
          dark: "#0F172A",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
        'glow': '0 0 15px rgba(230, 126, 34, 0.3)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'float': '0 10px 40px -10px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url('/grid.svg')",
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};

export default config;
