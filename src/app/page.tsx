"use client";

import { useState } from 'react';
import { CheckCircle2, Moon, Sun, CalendarDays, Sparkles, ArrowRight, Zap, BarChart, Bot } from 'lucide-react';
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
      const res = await signIn('email', { email, redirect: false, callbackUrl: '/dashboard' });
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
    <>
      {/* Vibrant Dot Background */}
      <div className="mesmerizing-bg"></div>

      <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
        <div className="glass-panel pop-in" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '40px 32px' }}>

          {/* Adorable Precious Logo Container */}
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', marginBottom: '40px' }}>
            <div style={{
              position: 'relative',
              padding: '16px',
              animation: 'float 4s ease-in-out infinite',
              filter: 'drop-shadow(0 12px 24px rgba(244,114,182,0.3))'
            }}>
              <img src="/planny-logo.png" alt="Planny" style={{ width: '160px', height: '160px', objectFit: 'contain' }} />
            </div>
            <style>{`
              @keyframes float {
                0% { transform: translateY(0px) rotate(-2deg); }
                50% { transform: translateY(-12px) rotate(2deg); }
                100% { transform: translateY(0px) rotate(-2deg); }
              }
            `}</style>
          </div>


          <h1 className="text-glow" style={{ fontSize: '3.2rem', margin: '0 0 16px', lineHeight: '1.1', display: 'flex', flexDirection: 'column', alignItems: 'center', fontWeight: '800', letterSpacing: '-0.04em' }}>
            <span>Meet Planny</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#64748b', marginBottom: '40px', lineHeight: '1.6', fontWeight: '400', maxWidth: '380px', margin: '0 auto 40px' }}>
            Experience peak clarity. Get a <strong>10 PM evening check-in</strong> and a <strong>7 AM morning digest</strong> right in your inbox.
          </p>

          {status === "loading" ? (
            <div style={{ padding: '40px', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'pulse 2s infinite' }}>
              <Sparkles size={36} className="spinner" />
              <span style={{ fontSize: '17px', fontWeight: '600' }}>Waking Planny up... ✨</span>
            </div>

          ) : session ? (
            /* ─── LOGGED IN STATE ─── */
            <div className="pop-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '32px', background: 'rgba(255,255,255,0.85)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: 'var(--shadow-md)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                {session.user?.image ? (
                  <img src={session.user.image} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid white', boxShadow: 'var(--shadow-md)' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--secondary), #fff)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontWeight: '800', fontSize: '24px', border: '4px solid white', boxShadow: 'var(--shadow-md)' }}>
                    {session.user?.email?.[0]?.toUpperCase() || '?'}
                  </div>
                )}
                <h2 style={{ color: 'var(--text-dark)', fontSize: '1.4rem', margin: 0, fontWeight: '800', letterSpacing: '-0.02em' }}>
                  Wait, you're back?! <br /> {session.user?.name?.split(' ')[0] || session.user?.email?.split('@')[0]} 🌸
                </h2>
              </div>

              <button onClick={() => router.push('/calendar')} className="btn" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', padding: '16px' }}>
                <CalendarDays size={20} /> Open My Calendar
              </button>
              <button
                onClick={() => router.push(`/plan?email=${encodeURIComponent(session.user?.email || '')}`)}
                className="btn"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '12px', alignItems: 'center', background: 'white', color: 'var(--accent)', border: '2px solid rgba(244,114,182,0.2)', padding: '16px', boxShadow: 'var(--shadow-sm)' }}
                onMouseOver={e => { e.currentTarget.style.background = '#fff0f5'; e.currentTarget.style.borderColor = 'rgba(244,114,182,0.5)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'rgba(244,114,182,0.2)'; }}
              >
                <Sparkles size={20} style={{ color: 'var(--accent)' }} /> Plan Tomorrow
              </button>

              <button onClick={() => signOut()} style={{ background: 'none', border: 'none', color: '#a1a1aa', textDecoration: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginTop: '16px', transition: 'color 0.2s', padding: '8px' }} onMouseOver={e => e.currentTarget.style.color = '#f43f5e'} onMouseOut={e => e.currentTarget.style.color = '#a1a1aa'}>
                Sign Out
              </button>
            </div>

          ) : success ? (
            /* ─── SUCCESS STATE ─── */
            <div className="pop-in" style={{ padding: '40px 32px', background: 'rgba(255,255,255,0.9)', borderRadius: '24px', border: '2px dashed var(--success)', boxShadow: '0 8px 30px rgba(52,211,153,0.1)' }}>
              <div style={{ display: 'inline-block', background: '#ecfdf5', padding: '16px', borderRadius: '50%', marginBottom: '20px' }}>
                <CheckCircle2 size={48} style={{ color: 'var(--success)' }} />
              </div>
              <h2 style={{ color: 'var(--text-dark)', fontSize: '1.8rem', marginBottom: '12px', fontWeight: '800', letterSpacing: '-0.02em' }}>Check your inbox! 💌</h2>
              <p style={{ color: '#4b5563', marginBottom: '0', fontSize: '1.05rem', lineHeight: '1.5' }}>
                We've sent a magic link to <strong>{email}</strong>. Click it to log in and start building your habit!
              </p>
            </div>

          ) : (
            <div style={{ animation: 'fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              <button
                onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
                style={{ width: '100%', fontSize: '1.15rem', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: '12px', background: 'rgba(255,255,255,0.9)', color: 'var(--text-dark)', border: '2px solid rgba(45,27,46,0.08)', borderRadius: '20px', padding: '16px 24px', cursor: 'pointer', fontWeight: '700', boxShadow: 'var(--shadow-sm)', marginBottom: '24px', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" width={24} alt="Google" />
                Continue with Google
              </button>

              <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0', color: '#cbd5e1' }}>
                <div style={{ flex: 1, height: '2px', background: 'rgba(45,27,46,0.04)', borderRadius: '2px' }}></div>
                <span style={{ padding: '0 16px', fontSize: '14px', fontWeight: '800', letterSpacing: '0.05em', color: '#a1a1aa' }}>OR MAGIC LINK</span>
                <div style={{ flex: 1, height: '2px', background: 'rgba(45,27,46,0.04)', borderRadius: '2px' }}></div>
              </div>

              <form onSubmit={subscribe} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
                <input
                  type="email"
                  className="input-glass"
                  placeholder="you@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                {error && <p style={{ color: '#f43f5e', fontSize: '14px', margin: '0', textAlign: 'center', fontWeight: '600' }}>{error}</p>}
                <button type="submit" className="btn" disabled={loading} style={{ width: '100%', fontSize: '1.2rem', padding: '18px' }}>
                  {loading ? 'Sending magic link... ✨' : 'Get Magic Link 🌸'}
                </button>
              </form>
            </div>
          )}

          {/* How it works */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr)', gap: '16px', marginTop: '48px', width: '100%', maxWidth: '480px' }}>
            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.7)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ background: '#e0e7ff', width: '64px', height: '64px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                <Moon style={{ color: '#4f46e5', fill: '#818cf8' }} size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-dark)' }}>10 PM Check-in</h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>Reflect & plan tomorrow in 2 mins. True mental clarity.</p>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.7)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ background: '#fef3c7', width: '64px', height: '64px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                <Sun style={{ color: '#d97706', fill: '#fbbf24' }} size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-dark)' }}>7 AM Digest</h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>Wake up inspired with your distinct goals & an AI quote.</p>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.7)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ background: '#e0e7ff', width: '64px', height: '64px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                <BarChart style={{ color: '#4f46e5' }} size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-dark)' }}>Weekly Report</h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>Get a compiled report of your accomplishments every weekend in your inbox.</p>
              </div>
            </div>

            <div style={{ padding: '24px', background: 'rgba(255,255,255,0.7)', borderRadius: '32px', border: '1px solid rgba(255,255,255,0.8)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: 'var(--shadow-sm)' }} onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.95)'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.7)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ background: '#fce7f3', width: '64px', height: '64px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid white', boxShadow: 'var(--shadow-sm)' }}>
                <Bot style={{ color: '#db2777' }} size={32} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 4px', color: 'var(--text-dark)' }}>AI Planner</h3>
                <p style={{ fontSize: '15px', color: '#64748b', margin: 0, lineHeight: '1.4', fontWeight: '500' }}>A personalized AI planner completely adapted for your day-to-day tasks.</p>
              </div>
            </div>
          </div>

          {/* Adorable Pricing tag */}
          {!session && !success && (
            <div style={{ marginTop: '56px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', background: 'white', padding: '16px 32px', borderRadius: '40px', color: 'var(--text-dark)', fontSize: '16px', fontWeight: '800', border: '1px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-md)' }}>
                <Zap size={24} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                <span>Subscribe to Planny Pro to hit your peak productivity</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600' }}>
                Join Planny Pro today for just <span style={{ color: 'var(--accent)', fontWeight: '800', fontSize: '17px' }}>₹19/month</span>
              </p>
            </div>
          )}
        </div>
      </main >
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
    </>
  );
}
