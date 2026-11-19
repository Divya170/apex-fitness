import type { Metadata, Viewport } from 'next';
import { Anton, Inter, Space_Grotesk } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';
import '../styles/pages.css';

const anton = Anton({ subsets: ['latin'], weight: '400', variable: '--font-anton', display: 'swap' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter', display: 'swap' });
const grotesk = Space_Grotesk({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-grotesk', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'Apex Fitness Club — Napa, CA', template: '%s — Apex Fitness Club' },
  description: 'Apex Fitness Club in Napa, California: strength, cardio, group classes and personal training. Explore programs and membership.',
  icons: { icon: '/favicon.svg' },
};
export const viewport: Viewport = { themeColor: '#111312', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${anton.variable} ${inter.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
