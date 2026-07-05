import { Anton, Chivo_Mono } from 'next/font/google';
import './globals.css';

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const chivoMono = Chivo_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata = {
  title: 'Chocolate - Minuteur',
  description: "Application PWA de minuterie d'entraînement",
  manifest: '/manifest.json',
  keywords: ['nextjs', 'next14', 'pwa', 'next-pwa', 'minuteur', 'entraînement'],
  authors: [
    {
      name: 'Kazimir42',
    },
  ],
  icons: [
    { rel: 'apple-touch-icon', url: '/icons/icon-192.png' },
    { rel: 'icon', url: '/icons/icon-192.png' },
  ],
};

export const viewport = {
  themeColor: '#0C0D10',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={`${anton.variable} ${chivoMono.variable} font-body bg-bg text-ink`}>
        {children}
      </body>
    </html>
  );
}
