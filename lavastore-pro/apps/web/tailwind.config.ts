import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // ── Paleta Material You — extraída do Stitch ────────────────────────
      colors: {
        'tertiary-fixed': '#ffdbcb',
        'surface-dim': '#dadada',
        'tertiary-container': '#b74e00',
        'on-primary-container': '#cbffc2',
        background: '#f9f9f9',
        'on-tertiary-fixed': '#341100',
        'inverse-primary': '#88d982',
        'outline-variant': '#bfcaba',
        'on-tertiary': '#ffffff',
        'on-tertiary-fixed-variant': '#793100',
        'on-secondary-container': '#003670',
        'on-secondary-fixed-variant': '#00468c',
        tertiary: '#903c00',
        'secondary-fixed': '#d6e3ff',
        'surface-container-highest': '#e2e2e2',
        surface: '#f9f9f9',
        'primary-container': '#2e7d32',
        'secondary-container': '#64a1ff',
        'surface-variant': '#e2e2e2',
        'on-error': '#ffffff',
        'surface-container': '#eeeeee',
        secondary: '#005db7',
        outline: '#707a6c',
        'on-tertiary-container': '#ffeee7',
        'on-background': '#1a1c1c',
        'error-container': '#ffdad6',
        'on-secondary': '#ffffff',
        'on-surface-variant': '#40493d',
        'on-primary-fixed': '#002204',
        'primary-fixed': '#a3f69c',
        'secondary-fixed-dim': '#a9c7ff',
        'on-secondary-fixed': '#001b3d',
        'surface-container-low': '#f3f3f3',
        'inverse-on-surface': '#f0f1f1',
        'surface-container-lowest': '#ffffff',
        'on-primary': '#ffffff',
        'surface-container-high': '#e8e8e8',
        'on-surface': '#1a1c1c',
        'surface-tint': '#1b6d24',
        'surface-bright': '#f9f9f9',
        'on-error-container': '#93000a',
        primary: '#0d631b',
        'tertiary-fixed-dim': '#ffb691',
        'primary-fixed-dim': '#88d982',
        'on-primary-fixed-variant': '#005312',
        'inverse-surface': '#2f3131',
        error: '#ba1a1a',
      },
      // ── Tipografia ────────────────────────────────────────────────────────
      fontFamily: {
        headline: ['Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      // ── Border radius (sem cantos vivos — valor mínimo: md = 0.75rem) ────
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.375rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.5rem',
        '2xl': '2rem',
        '3xl': '2.5rem',
        '4xl': '3rem',
        full: '9999px',
      },
      // ── Animações ─────────────────────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
