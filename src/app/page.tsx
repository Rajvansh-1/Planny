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
      const res = await signIn('email', { email, redirect: false, callbackUrl: '/calendar' });
      if (res?.error) {
        setError("Could not send magic link. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', overflow: 'hidden' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', textAlign: 'center', animation: 'fadeInUp 0.6s ease-out' }}>

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '130px', height: '130px', objectFit: 'contain', filter: 'drop-shadow(0 6px 16px rgba(249,168,212,0.6))', animation: 'float 3s ease-in-out infinite' }} />
        </div>
        <h1 style={{ fontSize: '2.4rem', color: '#1f2937', marginBottom: '8px', letterSpacing: '-0.02em' }}>Meet Planny 🐾</h1>
        <p style={{ fontSize: '1rem', color: '#6b7280', marginBottom: '28px', lineHeight: '1.5' }}>
          Your daily AI planner. Get a <strong>10 PM check-in</strong> and a <strong>7 AM digest</strong> straight to your inbox. No app needed.
        </p>

        {status === "loading" ? (
          <div style={{ padding: '30px', color: '#f9a8d4', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', animation: 'pulse 2s infinite' }}>
            <Sparkles size={32} />
            <span style={{ fontSize: '16px', fontWeight: '500' }}>Waking Planny up... ✨</span>
          </div>

        ) : session ? (
          /* ─── LOGGED IN STATE ─── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center', padding: '24px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px solid #fbcfe8', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', animation: 'fadeIn 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              {session.user?.image ? (
                <img src={session.user.image} alt="" style={{ width: '42px', height: '42px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
              ) : (
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #fbcfe8, #f9a8d4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '18px', border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                  {session.user?.email?.[0].toUpperCase()}
                </div>
              )}
              <h2 style={{ color: '#1f2937', fontSize: '1.3rem', margin: 0, fontWeight: '700' }}>
                Hey {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]}! ✨
              </h2>
            </div>

            <button onClick={() => router.push('/calendar')} className="btn" style={{ width: '100%', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', padding: '14px' }}>
              <CalendarDays size={18} /> Open My Calendar
            </button>
            <button onClick={() => router.push(`/plan?email=${encodeURIComponent(session.user?.email || '')}`)} className="btn" style={{ width: '100%', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', background: 'rgba(255,255,255,0.9)', color: '#374151', border: '1px solid #f9a8d4', padding: '14px' }}>
              <Sparkles size={18} style={{ color: '#f9a8d4' }} /> Plan Tomorrow
            </button>

            <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer', fontSize: '13px', marginTop: '8px' }}>
              Sign Out
            </button>
          </div>

        ) : success ? (
          /* ─── SUCCESS STATE ─── */
          <div style={{ padding: '32px 24px', background: 'rgba(255,255,255,0.85)', borderRadius: '16px', border: '2px dashed #fbcfe8', animation: 'fadeInScale 0.4s ease-out' }}>
            <CheckCircle2 size={56} style={{ color: '#34d399', margin: '0 auto 16px', filter: 'drop-shadow(0 4px 8px rgba(52,211,153,0.3))' }} />
            <h2 style={{ color: '#1f2937', fontSize: '1.6rem', marginBottom: '10px', fontWeight: '700' }}>Check your inbox! 💌</h2>
            <p style={{ color: '#6b7280', marginBottom: '0', fontSize: '15px' }}>
              We've sent a magic link to <strong>{email}</strong>. Click it to log in and start planning!
            </p>
          </div>

        ) : (
          /* ─── SIGNUP STATE ─── */
          <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <button
              onClick={() => signIn('google', { callbackUrl: '/calendar' })}
              style={{ width: '100%', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: '#374151', border: '1.5px solid #e5e7eb', borderRadius: '14px', padding: '14px 20px', cursor: 'pointer', fontWeight: '600', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: '20px', transition: 'all 0.2s', letterSpacing: '-0.01em' }}
              onMouseOver={e => { e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={22} alt="Google" />
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0 20px', color: '#9ca3af' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 12px', fontSize: '12px', fontWeight: '600', letterSpacing: '0.05em' }}>OR EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
              <input
                type="email"
                className="input-glass"
                placeholder="you@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ padding: '14px 16px', fontSize: '16px' }}
              />
              {error && <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 4px', textAlign: 'center', fontWeight: '500' }}>{error}</p>}
              <button type="submit" className="btn" disabled={loading} style={{ padding: '14px', fontSize: '1.05rem' }}>
                {loading ? 'Sending magic link... ✨' : 'Get Magic Link 🌸'}
              </button>
            </form>
          </div>
        )}

        {/* How it works */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px', marginTop: '32px', textAlign: 'left' }}>
          <div style={{ padding: '18px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <Moon style={{ color: '#a78bfa', marginBottom: '10px' }} size={24} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px', color: '#374151' }}>10 PM Check-in</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>Review today & plan tomorrow in 2 mins.</p>
          </div>
          <div style={{ padding: '18px 16px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.8)' }}>
            <Sun style={{ color: '#fbbf24', marginBottom: '10px' }} size={24} />
            <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px', color: '#374151' }}>7 AM Digest</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>Wake up to tasks & an AI quote.</p>
          </div>
        </div>

        {/* Pricing tag */}
        {!session && !success && (
          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ display: 'inline-block', background: 'rgba(255,255,255,0.6)', padding: '6px 16px', borderRadius: '20px', color: '#4b5563', fontSize: '14px', fontWeight: '500', border: '1px solid rgba(249,168,212,0.3)', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
              1 Day Free Trial • Then just <span style={{ color: '#db2777', fontWeight: 'bold' }}>₹19/mo</span> 🌸
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
          100% { opacity: 0.6; transform: scale(0.95); }
        }
      `}</style>
    </main>
  );
}
