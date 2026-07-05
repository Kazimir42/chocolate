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
                // Rubber-mat dark surfaces
                bg: '#0C0D10',
                surface: '#14161B',
                raised: '#1B1E25',
                line: '#282C35',
                // Chalk ink
                ink: '#EEEDE8',
                muted: '#858B98',
                // Functional state hues: work vs recovery
                work: {
                    DEFAULT: '#FF5B24',
                    soft: 'rgba(255, 91, 36, 0.14)',
                },
                rest: {
                    DEFAULT: '#55C1FF',
                    soft: 'rgba(85, 193, 255, 0.14)',
                },
                danger: {
                    DEFAULT: '#FF5C6A',
                    soft: 'rgba(255, 92, 106, 0.14)',
                },
            },
            fontFamily: {
                display: ['var(--font-display)', 'Impact', 'sans-serif'],
                body: ['var(--font-mono)', 'ui-monospace', 'monospace'],
                mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
            },
        },
    },
    plugins: [],
};
