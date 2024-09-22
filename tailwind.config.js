/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6',
                    light: '',
                    dark: '#2563eb',
                },
                secondary: {
                    DEFAULT: '#FF69b4',
                    light: '',
                    dark: '#3b82f6',
                },
                background: {
                    DEFAULT: "#eee",
                    current: '#4ade80',
                    next: '#60a5fa',
                },
                danger: {
                    DEFAULT: '#dc2626'
                },
                text: {
                    DEFAULT: "#eee",
                }
            },
        },
    },
    plugins: [],
};
