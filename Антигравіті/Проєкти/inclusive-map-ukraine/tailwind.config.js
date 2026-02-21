/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9f9',
                    100: '#d9f2f2',
                    200: '#b8e5e5',
                    300: '#8cd4d4',
                    400: '#59bcbc',
                    500: '#3fabab',
                    600: '#2f8b8b',
                    700: '#297070',
                    800: '#255a5a',
                    900: '#224c4c',
                    950: '#112c2c',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
