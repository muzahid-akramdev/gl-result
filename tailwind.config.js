/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        bangla: ['"Hind Siliguri"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        navy: {
          950: '#070e17', 900: '#0f1e2d', 800: '#1a3a5c',
          700: '#1e4f7a', 600: '#2d6a9f', 500: '#3d85c8',
        },
        gold: {
          300: '#fde68a', 400: '#fbbf24', 500: '#f0a500',
          600: '#d97706', 700: '#b45309',
        },
        emerald: { 400: '#34d399', 500: '#10b981', 600: '#059669' },
        rose:    { 400: '#fb7185', 500: '#f43f5e' },
      },
      animation: {
        'slide-up':   'slideUp 0.4s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fadeIn 0.3s ease',
        'scale-in':   'scaleIn 0.3s cubic-bezier(0.16,1,0.3,1)',
        'shimmer':    'shimmer 1.5s infinite',
        'float':      'float 3s ease-in-out infinite',
      },
      keyframes: {
        slideUp:  { from: { opacity:0, transform:'translateY(24px)' }, to: { opacity:1, transform:'translateY(0)' } },
        fadeIn:   { from: { opacity:0 }, to: { opacity:1 } },
        scaleIn:  { from: { opacity:0, transform:'scale(0.9)' }, to: { opacity:1, transform:'scale(1)' } },
        shimmer:  { '0%,100%': { opacity:1 }, '50%': { opacity:0.4 } },
        float:    { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-6px)' } },
      },
      backdropBlur: { xs: '2px' },
    }
  },
  plugins: []
}
