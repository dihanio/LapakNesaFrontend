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
                primary: "#0B5FA5",
                secondary: "#F2B705",
                blue: {
                    50: '#f0f7ff',
                    100: '#e0effe',
                    200: '#b9e0fe',
                    300: '#7cc2fd',
                    400: '#36a2fa',
                    500: '#0B5FA5', // Brand Blue
                    600: '#094d8a', // Darker Brand Blue for hover
                    700: '#083e70',
                    800: '#07355d',
                    900: '#0b2d4b',
                },
                amber: {
                    400: '#fbbf24',
                    500: '#F2B705', // Brand Yellow
                    600: '#d9a300',
                },
                background: {
                    light: "#f5f6f8",
                    dark: "#101622",
                },
            },
            fontFamily: {
                display: ["Lexend", "Plus Jakarta Sans", "sans-serif"], // Added Lexend
            },
            borderRadius: {
                DEFAULT: "0.25rem",
                lg: "0.5rem",
                xl: "0.75rem",
                "2xl": "1rem",
                full: "9999px",
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'scale-in': 'scaleIn 0.3s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                scaleIn: {
                    '0%': { opacity: '0', transform: 'scale(0.95)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
            },
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}
