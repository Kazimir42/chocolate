import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Chocolate - Minuteur',
  description: "Application PWA de minuterie d'entraînement",
  manifest: '/manifest.json',
  keywords: ['nextjs', 'next14', 'pwa', 'next-pwa', 'minuteur', 'entraînement'],
  authors: [
    {
      name: 'imvinojanv',
      url: 'https://www.linkedin.com/in/imvinojanv/',
    },
  ],
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/icon-192.png' },
    { rel: 'icon', url: '/icons/icon-192.png' },
  ],
};

export const viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${inter.className} text-white`}>{children}</body>
    </html>
  );
}
