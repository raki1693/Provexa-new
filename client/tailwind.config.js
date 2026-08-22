/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        provexa: {
          navy: '#1B4F72',
          blue: '#2E86C1',
          green: '#1E8449',
          amber: '#D4AC0D',
          red: '#922B21',
          purple: '#7D3C98',
          bg: '#F4F6F7',
          lightblue: '#EBF5FB',
          lightgreen: '#EAFAF1',
          lightpurple: '#F5EEF8',
          lightred: '#FDEDEC',
        }
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 30px rgba(0,0,0,0.14)',
      }
    }
  },
  plugins: [require('@tailwindcss/forms')],
}
