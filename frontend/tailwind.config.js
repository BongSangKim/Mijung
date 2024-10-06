/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Tailwind CSS가 적용될 파일
    './public/index.html', // public 폴더 내의 HTML 파일
  ],
  theme: {
    extend: {
      colors: {
        peach: {
          light: '#FFE5D6',
          DEFAULT: '#FFCBB5', // Peach Fuzz (PANTONE 13-1023)
          dark: '#E5A08D',
        },
        coral: '#FF6F61', // Vibrant coral
        mint: '#00A170', // Fresh mint
        sunflower: '#FFC300', // Bright sunflower
        blueberry: '#4A0E4E', // Deep blueberry
        background: {
          light: '#FFF9F5',
          DEFAULT: '#FFF0E6',
          dark: '#FFE7D6',
        },
        text: {
          light: '#4A4A4A',
          DEFAULT: '#333333',
          dark: '#1A1A1A',
        },
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active'],
      scale: ['active'],
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms', 'daisyui'),
  ],
};
