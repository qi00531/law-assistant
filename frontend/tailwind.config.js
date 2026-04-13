/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        canvas: '#F7F8FA',
        ink: '#1F2937',
        muted: '#6B7280',
        line: '#E5E7EB',
        brand: '#2E5B9A',
        brandSoft: '#EAF1FB',
        warm: '#F4EFE7',
      },
      borderRadius: {
        '2.5xl': '1.5rem',
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', '"PingFang SC"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
