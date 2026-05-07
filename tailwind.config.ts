import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        leather: {
          DEFAULT: '#8B5A2B',
          light: '#A87142',
          dark: '#5D3A1C',
          darker: '#3E2723',
        },
        gold: {
          DEFAULT: '#C9A961',
          light: '#E5C77E',
          dark: '#9A7B1F',
        },
        cream: {
          DEFAULT: '#F5E6D3',
          dark: '#E8D5B7',
        },
        carbon: {
          DEFAULT: '#1A0F08',
          soft: '#2A1A0F',
        },
        rust: '#A04020',
      },
      fontFamily: {
        display: ['var(--font-rye)', 'serif'],
        sans: ['var(--font-dm-sans)', 'sans-serif'],
        serif: ['var(--font-playfair)', 'serif'],
        special: ['var(--font-special-elite)', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'shimmer': 'shimmer 2s infinite linear',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #C9A961 0%, #E5C77E 100%)',
        'leather-gradient': 'linear-gradient(135deg, #1A0F08 0%, #3E2723 100%)',
        'gold-radial': 'radial-gradient(circle, rgba(201,169,97,0.15) 0%, transparent 70%)',
      },
    },
  },
  plugins: [],
};

export default config;
