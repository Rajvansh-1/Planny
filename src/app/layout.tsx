import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '800'],
});

export const metadata: Metadata = {
  title: 'Planny 🐾 | Your Cute AI Scheduler',
  description: 'A cute AI automation tool to plan your day.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={nunito.className}>
        <div className="blob-shape blob-1"></div>
        <div className="blob-shape blob-2"></div>
        {children}
      </body>
    </html>
  );
}
