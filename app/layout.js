import {Inter} from 'next/font/google';
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Chocolate",
    description: "It's a simple progressive web application made with NextJS",
    generator: "Next.js",
    manifest: "/manifest.json",
    keywords: ["nextjs", "next14", "pwa", "next-pwa"],
    authors: [
        {
            name: "imvinojanv",
            url: "https://www.linkedin.com/in/imvinojanv/",
        },
    ],
    icons: [
        {rel: "apple-touch-icon", url: "/icons/icon-192.png"},
        {rel: "icon", url: "/icons/icon-192.png"},
    ],
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <head>
            <meta name="theme-color" content="#111111"/>
            <meta name="viewport" content="width=device-width, initial-scale=1"/>
            <link rel="manifest" href="/manifest.json"/>
            <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192.png"/>
            <link rel="icon" href="/icons/icon-192.png"/>
            <title>{metadata.title}</title>
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    );
}
