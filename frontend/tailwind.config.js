/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Tailwind CSS가 적용될 파일
    './public/index.html', // public 폴더 내의 HTML 파일
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [require('daisyui')], // daisyUI 플러그인 추가
};
