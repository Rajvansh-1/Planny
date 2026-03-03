import type { Metadata } from 'next';
import PlanClientPage from '@/components/plan/ClientPlanPage';

// ─── Dynamic metadata for shareable plan links ────────────────────────────────
// When someone shares /plan?email=raj@gmail.com on WhatsApp or Twitter,
// they see a personalized preview: "Raj's Plan | Planny 🐾"
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const email = params.email as string | undefined;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app';

  // Build personalized name from email prefix if available
  const rawName = email?.split('@')[0] ?? '';
  const displayName = rawName
    ? rawName.charAt(0).toUpperCase() + rawName.slice(1)
    : null;

  const title = displayName
    ? `${displayName}'s Tomorrow Plan | Planny 🐾`
    : 'Plan Your Tomorrow | Planny 🐾 AI Scheduler';

  const description = displayName
    ? `Check out what ${displayName} is planning for tomorrow with Planny — the AI daily scheduler.`
    : 'Plan your tomorrow with Planny — the AI-powered daily scheduler trusted by go-getters worldwide.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: email ? `/plan?email=${encodeURIComponent(email)}` : '/plan',
      siteName: 'Planny',
      images: [
        {
          url: displayName
            ? `${baseUrl}/api/og?name=${encodeURIComponent(displayName)}`
            : `${baseUrl}/api/og`,
          width: 1200,
          height: 630,
          alt: displayName ? `${displayName}'s Planny Plan` : 'Planny AI Scheduler',
          type: 'image/png',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [displayName ? `${baseUrl}/api/og?name=${encodeURIComponent(displayName)}` : `${baseUrl}/api/og`],
      creator: '@plannyapp',
    },
  };
}

// ─── Page (Server Component) ──────────────────────────────────────────────────
export default function PlanPage() {
  return <PlanClientPage />;
}
