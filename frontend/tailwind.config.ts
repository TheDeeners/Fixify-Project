import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7F1D3A', // Burgundy
          hover: '#69172F',
          dark: '#541225',
          light: '#932444',
        },
        secondary: {
          DEFAULT: '#A83255', // Lighter Burgundy / Rosewood
          hover: '#932747',
          light: '#BC4B6E',
        },
        background: '#F8F3F0', // Cream
        surface: '#FFFFFF', // Pure White
        text: {
          DEFAULT: '#29232A', // Dark Plum/Charcoal
          muted: '#6E676F',
          light: '#978F98',
        },
        border: {
          DEFAULT: '#E8DDD9', // Soft Warm Cream Border
          dark: '#D4C6C0',
        },
        accent: {
          DEFAULT: '#7F1D3A',
          hover: '#69172F',
          soft: '#F3E8EB',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
} satisfies Config;
