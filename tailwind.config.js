/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.{html,js}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e4',
        'primary-content': '#ffffff',
        secondary: '#f3f4f6',
        accent: '#0ea5e4',
        neutral: '#374151',
        'base-100': '#ffffff',
        'base-200': '#f9fafb',
        'base-300': '#f3f4f6',
        'base-content': '#1f2937',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#0ea5e4",
          "primary-content": "#ffffff",
          "secondary": "#f3f4f6",
          "accent": "#0ea5e4",
          "neutral": "#374151",
          "base-100": "#ffffff",
          "base-200": "#f9fafb",
          "base-300": "#f3f4f6",
          "base-content": "#1f2937",
          "info": "#3abff8",
          "success": "#36d399",
          "warning": "#fbbd23",
          "error": "#f87272",
        },
      },
    ],
    base: true,
    styled: true,
    utils: true,
    prefix: "",
    logs: true,
    themeRoot: ":root",
  },
}