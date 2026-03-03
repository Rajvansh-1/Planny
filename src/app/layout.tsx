import type { Metadata, Viewport } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  weight: ['400', '600', '800'],
  display: 'swap',
});

// ─── Viewport (separate from metadata per Next.js 14+ spec) ──────────────────
export const viewport: Viewport = {
  themeColor: '#f472b6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

// ─── Global SEO Metadata ──────────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app'
  ),
  title: {
    default: 'Planny 🐾 | Your Cute AI Daily Scheduler',
    template: '%s | Planny 🐾',
  },
  description:
    'Planny is the AI-powered daily planner that sends you a 10 PM evening check-in and 7 AM morning digest. Build habits, achieve goals, and wake up inspired every day.',
  applicationName: 'Planny',
  keywords: [
    'AI scheduler',
    'daily planner',
    'habit tracker',
    'morning digest',
    'evening reflection',
    'productivity app',
    'AI reminder',
    'task manager',
    'goal tracker',
    'planny',
  ],
  authors: [{ name: 'Planny', url: 'https://planny.vercel.app' }],
  creator: 'Planny',
  publisher: 'Planny',
  category: 'productivity',
  alternates: {
    canonical: '/',
  },

  // ─── Open Graph (WhatsApp, Facebook, LinkedIn) ──────────────────────────────
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Planny',
    title: 'Planny 🐾 | Your Cute AI Daily Scheduler',
    description:
      'Get a 10 PM evening check-in & 7 AM morning digest powered by AI. Build habits and wake up inspired every single day.',
    images: [
      {
        url: '/planny-logo.png',
        width: 512,
        height: 512,
        alt: 'Planny — AI Daily Scheduler',
        type: 'image/png',
      },
    ],
  },

  // ─── Twitter / X Card ────────────────────────────────────────────────────────
  twitter: {
    card: 'summary',
    title: 'Planny 🐾 | Your Cute AI Daily Scheduler',
    description:
      'AI-powered daily planner with 10 PM check-ins & 7 AM digests. Build habits, crush goals.',
    images: ['/planny-logo.png'],
    creator: '@plannyapp',
    site: '@plannyapp',
  },

  // ─── Icons ───────────────────────────────────────────────────────────────────
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
      { url: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
    shortcut: '/apple-icon.png',
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },

  // ─── PWA Manifest ────────────────────────────────────────────────────────────
  manifest: '/manifest.json',

  // ─── Robots / Crawlers ───────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Planny',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    description:
      'Planny is the AI-powered daily planner that sends you a 10 PM evening check-in and 7 AM morning digest to help you build habits and wake up inspired.',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app',
    logo: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app'}/planny-logo.png`,
    image: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app'}/planny-logo.png`,
    offers: {
      '@type': 'Offer',
      price: '19',
      priceCurrency: 'INR',
      priceValidUntil: '2027-01-01',
      availability: 'https://schema.org/InStock',
      description: '20-day free trial, then ₹19/month',
    },
    creator: {
      '@type': 'Organization',
      name: 'Planny',
      url: process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app',
    },
    featureList: [
      'AI-generated morning digest at 7 AM',
      'Evening check-in prompt at 10 PM',
      'Daily task planning',
      'Habit tracking',
      'Email reminders',
    ],
    screenshot: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app'}/planny-logo.png`,
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={nunito.className}>
        <Providers>
          <div className="blob-shape blob-1"></div>
          <div className="blob-shape blob-2"></div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
