/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8'
        },
        danger: {
          DEFAULT: '#dc2626',
          hover: '#b91c1c'
        },
        success: '#16a34a',
        text: {
          primary: '#1e293b',
          secondary: '#64748b'
        },
        border: '#e2e8f0',
        'bg-light': '#f8fafc',
        'bg-lighter': '#f1f5f9'
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem'
      }
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
} 