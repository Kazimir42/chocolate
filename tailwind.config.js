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
                orange: {
                    DEFAULT: '#FF6B35',
                    light: '#FF8C5A',
                    dark: '#E85A24',
                },
                coral: {
                    DEFAULT: '#FF7F66',
                },
                background: {
                    dark: '#1a1a2e',
                    darker: '#16213e',
                },
                glass: {
                    DEFAULT: 'rgba(255,255,255,0.1)',
                    light: 'rgba(255,255,255,0.15)',
                    border: 'rgba(255,255,255,0.2)',
                },
                success: {
                    DEFAULT: '#4ADE80',
                },
                danger: {
                    DEFAULT: '#dc2626',
                    coral: '#FF6B6B',
                },
                text: {
                    DEFAULT: '#FFFFFF',
                    muted: 'rgba(255,255,255,0.85)',
                },
            },
            backdropBlur: {
                xs: '2px',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'gradient': 'gradient 15s ease infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
        },
    },
    plugins: [],
};
