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
          light: '#B2EBF2', // 밝은 민트
          DEFAULT: '#80CBC4', // 민트 그린
          dark: '#26A69A', // 진한 민트
        },
        coral: '#6D4C41', // 브라운
        mint: {
          light: '#B2DFDB',
          DEFAULT: '#4DB6AC', // 티얼
          dark: '#00897B',
        },
        sunflower: '#FFF9C4', // 라이트 옐로우
        blueberry: '#283593', // 네이비
        peach_fuzz: '#D7CCC8', // 베이지
        background: {
          light: '#FAFAFA', // 크림색
          DEFAULT: '#F5F5F5', // 밝은 회색
          dark: '#ECEFF1', // 더 진한 회색
        },
        text: {
          light: '#546E7A',
          DEFAULT: '#37474F',
          dark: '#263238',
        },
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'Noto Sans',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
          'Segoe UI Symbol',
          'Noto Color Emoji',
        ],
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
  plugins: [require('@tailwindcss/forms', 'daisyui')],
};

// 새로운 색상 이름 제안:
// peach -> fresh-mint
// coral -> warm-brown
// mint -> calm-teal
// sunflower -> soft-yellow
// blueberry -> deep-navy
// peach_fuzz -> neutral-beige
// background -> cream-gray
