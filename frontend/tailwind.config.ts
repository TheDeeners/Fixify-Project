import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E293B',
        secondary: '#334155',
        accent: {
          DEFAULT: '#F97316',
          hover: '#EA580C',
          soft: '#FFEDD5',
        },
        background: '#F1F5F9',
        surface: '#FFFFFF',
      },
    },
  },
  plugins: [],
} satisfies Config;
