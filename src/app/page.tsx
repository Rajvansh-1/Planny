"use client";

import { useState } from 'react';
import { Sparkles, CheckCircle2, Moon, Sun, CalendarDays } from 'lucide-react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      if (res.ok) {
        setSuccess(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '600px', width: '100%', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px', borderRadius: '24px', marginBottom: '20px', boxShadow: '0 8px 20px rgba(249, 168, 212, 0.4)', overflow: 'hidden' }}>
          <img src="/icon.png" alt="Planny Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        <h1 style={{ fontSize: '2.5rem', color: '#1f2937', marginBottom: '10px' }}>Meet Planny 🐾</h1>
        <p style={{ fontSize: '1.1rem', color: '#6b7280', marginBottom: '30px' }}>Your cute, magical AI assistant that asks for your schedule at night and sends you a motivational plan every morning.</p>

        {status === "loading" ? (
          <div style={{ padding: '20px', color: '#6b7280' }}>Loading magic...</div>
        ) : session ? (
          <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center', padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px solid #fbcfe8' }}>
            <h2 style={{ color: '#1f2937', fontSize: '1.5rem' }}>Welcome back, {session.user?.name?.split(' ')[0]}! ✨</h2>
            <button onClick={() => router.push('/calendar')} className="btn" style={{ width: '100%', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <CalendarDays size={20} /> Open My Calendar
            </button>
            <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer', marginTop: '10px' }}>
              Sign Out
            </button>
          </div>
        ) : (
          <>
            <button
              onClick={() => signIn('google', { callbackUrl: '/calendar' })}
              className="btn"
              style={{ width: '100%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', color: '#374151', border: '1px solid #d1d5db', marginBottom: '20px' }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={20} alt="Google" />
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', color: '#9ca3af' }}>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
              <span style={{ padding: '0 10px', fontSize: '0.9rem' }}>or join email waitlist</span>
              <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            </div>

            {!success ? (
              <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4b5563' }}>What should I call you?</label>
                  <input
                    type="text"
                    className="input-glass"
                    placeholder="Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4b5563' }}>Your Email</label>
                  <input
                    type="email"
                    className="input-glass"
                    placeholder="hello@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn" disabled={loading} style={{ marginTop: '10px', fontSize: '1.1rem' }}>
                  {loading ? 'Adding magic... ✨' : 'Join Waitlist 🌸'}
                </button>
              </form>
            ) : (
              <div className="fade-up" style={{ padding: '20px', background: 'rgba(255,255,255,0.8)', borderRadius: '16px', border: '2px dashed #fbcfe8' }}>
                <CheckCircle2 size={48} style={{ color: '#fbcfe8', margin: '0 auto 10px' }} />
                <h2 style={{ color: '#1f2937', fontSize: '1.5rem' }}>You're on the list! 🎉</h2>
                <p style={{ color: '#6b7280' }}>Keep an eye on your inbox at 10 PM. Planny will check in with you soon!</p>
              </div>
            )}
          </>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', marginTop: '40px', textAlign: 'left' }}>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
            <Moon style={{ color: '#a78bfa', marginBottom: '10px' }} size={24} />
            <h3 style={{ fontSize: '1.1rem' }}>10 PM Check-in</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Planny asks what you want to achieve tomorrow.</p>
          </div>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.5)', borderRadius: '16px' }}>
            <Sun style={{ color: '#fbbf24', marginBottom: '10px' }} size={24} />
            <h3 style={{ fontSize: '1.1rem' }}>7 AM Setup</h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>Wake up to your schedule and a cute AI quote.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
