"use client";

import { useState } from 'react';
import { CheckCircle2, Moon, Sun, CalendarDays, Sparkles } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }),
      });
      const data = await res.json();
      if (res.ok) {
        if (!data.isPaid) {
          // Redirect to payment if not paid
          router.push(`/payment?email=${encodeURIComponent(email)}`);
        } else {
          setSuccess(true);
        }
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '520px', width: '100%', textAlign: 'center' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '100px', height: '100px', objectFit: 'contain', filter: 'drop-shadow(0 8px 20px rgba(249,168,212,0.5))' }} />
        </div>
        <h1 style={{ fontSize: '2.4rem', color: '#1f2937', marginBottom: '8px' }}>Meet Planny 🐾</h1>
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '28px', lineHeight: '1.5' }}>
          Your daily AI planner. Get a <strong>10 PM check-in</strong> every night and a <strong>7 AM digest</strong> every morning — straight to your inbox. No app needed.
        </p>

        {status === "loading" ? (
          <div style={{ padding: '20px', color: '#9ca3af' }}>Loading... ✨</div>

        ) : session ? (
          /* ─── LOGGED IN STATE ─── */
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px solid #fbcfe8' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {session.user?.image && <img src={session.user.image} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />}
              <h2 style={{ color: '#1f2937', fontSize: '1.3rem', margin: 0 }}>
                Welcome back, {session.user?.name?.split(' ')[0]}! ✨
              </h2>
            </div>
            {/* When Google logged in goes to planner, check payment on the server via /plan page loading... */}
            <button onClick={() => router.push('/calendar')} className="btn" style={{ width: '100%', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
              <CalendarDays size={18} /> Open My Calendar
            </button>
            <button onClick={() => router.push(`/plan?email=${encodeURIComponent(session.user?.email || '')}`)} className="btn" style={{ width: '100%', fontSize: '1rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #f9a8d4' }}>
              <Sparkles size={18} style={{ color: '#f9a8d4' }} /> Plan Tomorrow
            </button>
            <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px' }}>
              Sign Out
            </button>
          </div>

        ) : success ? (
          /* ─── SUCCESS STATE ─── */
          <div className="fade-up" style={{ padding: '28px', background: 'rgba(255,255,255,0.85)', borderRadius: '16px', border: '2px dashed #fbcfe8' }}>
            <CheckCircle2 size={52} style={{ color: '#34d399', margin: '0 auto 12px' }} />
            <h2 style={{ color: '#1f2937', fontSize: '1.5rem', marginBottom: '8px' }}>You're in! 🎉</h2>
            <p style={{ color: '#6b7280', marginBottom: '0' }}>
              Check your inbox — a welcome email is on its way! You'll get your first 10 PM check-in tonight. 💌
            </p>
          </div>

        ) : (
          /* ─── SIGNUP STATE ─── */
          <>
            {/* Google Sign In */}
            <button
              onClick={() => signIn('google', { callbackUrl: '/calendar' })}
              style={{ width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: '#374151', border: '1.5px solid #d1d5db', borderRadius: '14px', padding: '13px 20px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', marginBottom: '16px', transition: 'all 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)')}
              onMouseOut={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)')}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} alt="Google" />
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 16px', color: '#9ca3af' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 12px', fontSize: '13px', fontWeight: '600' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            {/* Email Form */}
            <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
              <input
                type="text"
                className="input-glass"
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
              <input
                type="email"
                className="input-glass"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0' }}>{error}</p>}
              <button type="submit" className="btn" disabled={loading} style={{ marginTop: '4px', fontSize: '1rem' }}>
                {loading ? 'Getting you set up... ✨' : 'Get Started for Free 🌸'}
              </button>
            </form>
          </>
        )}

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px', marginTop: '28px', textAlign: 'left' }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '14px' }}>
            <Moon style={{ color: '#a78bfa', marginBottom: '8px' }} size={22} />
            <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>10 PM Check-in</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Review today + plan tomorrow in 2 minutes.</p>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.5)', borderRadius: '14px' }}>
            <Sun style={{ color: '#fbbf24', marginBottom: '8px' }} size={22} />
            <h3 style={{ fontSize: '1rem', margin: '0 0 4px' }}>7 AM Digest</h3>
            <p style={{ fontSize: '0.85rem', color: '#6b7280', margin: 0 }}>Wake up to your tasks + an AI quote.</p>
          </div>
        </div>

        {/* Pricing tag */}
        {!session && !success && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ display: 'inline-block', background: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '20px', color: '#4b5563', fontSize: '14px', fontWeight: '500', border: '1px solid rgba(249,168,212,0.3)' }}>
              Get Planny Pro for just <span style={{ color: '#db2777', fontWeight: 'bold' }}>₹19/month</span> 🌸
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
