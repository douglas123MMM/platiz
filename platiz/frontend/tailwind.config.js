/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: { 50: '#FDF8EC', 100: '#F9EDC8', 200: '#F2DD93', 300: '#EBCB5E', 400: '#E5C158', 500: '#D4A832', 600: '#B8922A', 700: '#936E20', 800: '#75561A', 900: '#554016' },
        dark: { 50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#1e293b', 800: '#111827', 900: '#0a0a0f', 950: '#050508' },
        cyan: { 400: '#00D4FF', 500: '#00B8D4', 600: '#0097A7' },
        purple: { 400: '#A855F7', 500: '#9333EA', 600: '#7C3AED' },
        emerald: { 400: '#34D399', 500: '#10B981' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Bodoni Moda', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-gold': 'glowGold 2s ease-in-out infinite alternate',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'shimmer': 'shimmer 3s ease-in-out infinite',
        'liquid-morph': 'liquidMorph 8s ease-in-out infinite',
        'aurora': 'aurora 8s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        glowGold: { '0%': { boxShadow: '0 0 5px rgba(255, 215, 0, 0.3)' }, '100%': { boxShadow: '0 0 25px rgba(255, 215, 0, 0.6)' } },
        pulseSoft: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.7' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        liquidMorph: { '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }, '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' } },
        aurora: { '0%': { backgroundPosition: '0% 50%' }, '50%': { backgroundPosition: '100% 50%' }, '100%': { backgroundPosition: '0% 50%' } },
      },
    },
  },
  plugins: [],
};
