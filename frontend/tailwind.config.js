/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        neon: {
          primary: '#6C5CFF',
          cyan: '#00D1FF',
          green: '#00FFA3',
          gold: '#FFB800',
          danger: '#FF4D6D',
        },
        cyber: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#172554',
          900: '#08111f',
          950: '#020611',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        dark: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#dee2e6',
          300: '#ced4da',
          400: '#adb5bd',
          500: '#6c757d',
          600: '#495057',
          700: '#343a40',
          800: '#212529',
          900: '#0d1117',
          950: '#080c12',
        }
      },
      fontFamily: {
        arabic: ['Cairo', 'Noto Sans Arabic', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.4s ease-out',
        'aurora': 'aurora 14s ease-in-out infinite alternate',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'scan': 'scan 5s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 158, 11, 0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(245, 158, 11, 0)' }
        },
        slideIn: {
          'from': { transform: 'translateY(-10px)', opacity: 0 },
          'to': { transform: 'translateY(0)', opacity: 1 }
        },
        fadeIn: {
          'from': { opacity: 0 },
          'to': { opacity: 1 }
        },
        aurora: {
          '0%': { transform: 'translate3d(0, 0, 0) scale(1)', opacity: '0.75' },
          '100%': { transform: 'translate3d(-3%, 2%, 0) scale(1.04)', opacity: '1' }
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 24px rgba(108, 92, 255, 0.18)' },
          '50%': { boxShadow: '0 0 42px rgba(0, 209, 255, 0.26)' }
        },
        scan: {
          '0%': { transform: 'translateX(120%)' },
          '100%': { transform: 'translateX(-120%)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
