/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // 의료 + 핀테크 신뢰감 (명세 4번 디자인 토큰)
        primary: '#0F6FFF',
        teal: '#0FB5AE',
        success: '#16A34A',
        warn: '#F59E0B',
        danger: '#DC2626',
        ink: '#0B1324',
        muted: '#64748B',
        surface: '#F6F8FB',
        // 참조 이미지(Curity) 의 QR 액션 버튼 색
        accent: '#DB2777',
      },
      fontFamily: {
        sans: [
          'Pretendard',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 20px -4px rgba(11, 19, 36, 0.10)',
        frame: '0 20px 60px -12px rgba(11, 19, 36, 0.35)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
