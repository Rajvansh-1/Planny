"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, LogOut, Loader2, Sparkles, CheckCircle2, Award, Flame } from "lucide-react";

export default function DashboardClient({ userEmail, userName }: { userEmail: string | null, userName: string | null }) {
  const router = useRouter();
  const [taskCount, setTaskCount] = useState<number | null>(null);
  const [isNavigating, setIsNavigating] = useState<'plan' | 'calendar' | null>(null);

  useEffect(() => {
    if (!userEmail) {
      router.push("/");
    }
  }, [userEmail, router]);

  useEffect(() => {
    if (userEmail) {
      // Fetch today's tasks to show a quick stat
      const today = new Date().toISOString().split('T')[0];
      fetch(`/api/tasks?email=${encodeURIComponent(userEmail)}&dateFor=${today}`)
        .then(res => res.json())
        .then(data => {
          if (data.tasks) {
            setTaskCount(data.tasks.filter((t: any) => t.completed).length);
          }
        })
        .catch(err => console.error("Failed to fetch task stats", err));
    }
  }, [userEmail]);

  if (!userEmail) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Sparkles size={48} color="var(--primary)" className="spinner" />
        <p style={{ color: 'var(--text-dark)', fontSize: '18px', fontWeight: '600', animation: 'pulse 2s infinite' }}>Waking up Planny...</p>
      </div>
    );
  }

  const firstName = userName ? userName.split(' ')[0] : 'friend';

  return (
    <>
      <div className="mesmerizing-bg"></div>

      <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', position: 'relative', zIndex: 1 }}>

        <div className="glass-panel pop-in" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>

          {/* Welcome Header */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ position: 'relative', display: 'inline-block', background: 'white', borderRadius: '32px', padding: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid rgba(0,0,0,0.06)', transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s ease', marginBottom: '24px' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}>
              <img src="/planny-logo.png" alt="Planny" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
            </div>

            <h1 className="text-glow" style={{ fontSize: '2.2rem', margin: '0 0 12px', lineHeight: '1.2', fontWeight: '700', letterSpacing: '-0.02em' }}>
              Welcome back, <br />{firstName} ✨
            </h1>
            <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '400' }}>
              Your daily planner is ready.
            </p>
          </div>

          {/* Gamified Stats Card */}
          {taskCount !== null && (
            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}>
              <div style={{ background: taskCount > 0 ? '#ecfdf5' : '#f1f5f9', padding: '16px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.04)', boxShadow: 'var(--shadow-sm)' }}>
                {taskCount > 0 ? <Flame size={28} style={{ color: '#10b981' }} /> : <Award size={28} style={{ color: '#94a3b8' }} />}
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Wins</p>
                <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--text-dark)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '-0.01em' }}>
                  {taskCount} {taskCount === 1 ? 'task' : 'tasks'} done {taskCount > 0 && <span style={{ fontSize: '20px' }}>✨</span>}
                </h2>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <button
              onClick={() => {
                setIsNavigating('plan');
                router.push(`/plan?email=${encodeURIComponent(userEmail)}`);
              }}
              className="btn"
              disabled={isNavigating !== null}
              style={{ width: '100%', gap: '12px' }}
            >
              {isNavigating === 'plan' ? <Sparkles size={24} className="spinner" /> : <Sparkles size={24} />}
              {isNavigating === 'plan' ? 'Opening...' : 'Plan Tomorrow'}
            </button>

            <button
              onClick={() => {
                setIsNavigating('calendar');
                router.push(`/calendar?email=${encodeURIComponent(userEmail)}`);
              }}
              disabled={isNavigating !== null}
              style={{ width: '100%', padding: '16px', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'white', border: '1px solid rgba(0,0,0,0.1)', color: 'var(--text-dark)', borderRadius: '9999px', fontWeight: '600', cursor: isNavigating ? 'not-allowed' : 'pointer', opacity: isNavigating ? 0.7 : 1, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: 'var(--shadow-sm)' }}
              onMouseOver={e => { if (!isNavigating) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.background = '#f8fafc'; } }}
              onMouseOut={e => { if (!isNavigating) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.background = 'white'; } }}
              onMouseDown={e => { if (!isNavigating) { e.currentTarget.style.transform = 'translateY(1px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
            >
              {isNavigating === 'calendar' ? <Loader2 size={20} className="spinner" /> : <CalendarIcon size={20} style={{ color: 'var(--text-dark)' }} />}
              {isNavigating === 'calendar' ? 'Loading Calendar...' : 'View My Calendar'}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            style={{ marginTop: '40px', background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', cursor: 'pointer', fontSize: '16px', fontWeight: '800', transition: 'color 0.2s', padding: '8px' }}
            onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}
          >
            <LogOut size={20} /> Sign Out
          </button>

        </div>
      </main>
    </>
  );
}
