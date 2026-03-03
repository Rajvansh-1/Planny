import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name');

  const heading = name
    ? `${name}'s Daily Plan 🐾`
    : 'Planny — Your AI Daily Scheduler 🐾';

  const sub = name
    ? `See what ${name} is crushing tomorrow`
    : 'Get a 7 AM digest & 10 PM check-in, every day';

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #fff0f8 0%, #fce7f3 40%, #ede9fe 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Background blobs */}
        <div style={{ position: 'absolute', top: -80, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'rgba(244,114,182,0.15)', display: 'flex' }} />
        <div style={{ position: 'absolute', bottom: -100, right: -60, width: 350, height: 350, borderRadius: '50%', background: 'rgba(167,139,250,0.12)', display: 'flex' }} />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL || 'https://planny-mu.vercel.app'}/planny-logo.png`}
          width={120}
          height={120}
          alt="Planny"
          style={{ borderRadius: '32px', marginBottom: '32px', boxShadow: '0 20px 60px rgba(244,114,182,0.35)' }}
        />

        {/* Headline */}
        <div
          style={{
            fontSize: '58px',
            fontWeight: '900',
            color: '#1e1030',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: '900px',
            marginBottom: '20px',
            letterSpacing: '-2px',
            display: 'flex',
          }}
        >
          {heading}
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: '28px',
            color: '#6b21a8',
            textAlign: 'center',
            fontWeight: '500',
            maxWidth: '700px',
            marginBottom: '40px',
            display: 'flex',
          }}
        >
          {sub}
        </div>

        {/* CTA Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f472b6, #a855f7)',
            color: 'white',
            padding: '16px 40px',
            borderRadius: '50px',
            fontSize: '22px',
            fontWeight: '800',
            letterSpacing: '-0.5px',
            boxShadow: '0 8px 30px rgba(244,114,182,0.4)',
          }}
        >
          ✨ Start Free — 20 Days Trial
        </div>

        {/* Domain tag */}
        <div style={{ position: 'absolute', bottom: 32, right: 48, fontSize: '18px', color: '#a78bfa', fontWeight: '600', display: 'flex' }}>
          planny-mu.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
