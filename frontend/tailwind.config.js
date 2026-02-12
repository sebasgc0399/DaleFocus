/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Paleta principal de DaleFocus
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        // Colores para cada barrera emocional
        barrier: {
          overwhelmed: '#ef4444', // rojo
          uncertain: '#f59e0b',   // amarillo
          bored: '#8b5cf6',       // violeta
          perfectionism: '#3b82f6', // azul
        },
        // Semanticos
        success: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          DEFAULT: '#ef4444',
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        // DS v1 — Calm Premium surfaces
        surface: {
          0: 'rgb(var(--df-surface-0) / <alpha-value>)',
          1: 'rgb(var(--df-surface-1) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderColor: {
        subtle: 'rgb(var(--df-border-subtle) / <alpha-value>)',
      },
      boxShadow: {
        soft: '0 2px 8px -2px rgba(0,0,0,0.08)',
        'elevation-1': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'elevation-2': '0 4px 12px -2px rgba(0,0,0,0.08), 0 2px 6px -2px rgba(0,0,0,0.04)',
      },
      transitionDuration: {
        250: '250ms',
        320: '320ms',
      },
      transitionTimingFunction: {
        out: 'ease-out',
      },
    },
  },
  plugins: [],
};
