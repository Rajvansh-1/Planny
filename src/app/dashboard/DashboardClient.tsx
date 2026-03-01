"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Calendar as CalendarIcon, LogOut, Loader2, Sparkles, CheckCircle2 } from "lucide-react";

export default function DashboardClient({ userEmail, userName }: { userEmail: string | null, userName: string | null }) {
  const router = useRouter();
  const [taskCount, setTaskCount] = useState<number | null>(null);

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
        <Loader2 size={48} color="#f9a8d4" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ color: '#6b7280', fontSize: '18px', fontWeight: '500', animation: 'pulse 2s infinite' }}>Waking up Planny...</p>
      </div>
    );
  }

  const firstName = userName ? userName.split(' ')[0] : 'friend';

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

      {/* Background blobs */}
      <div className="blob-shape blob-1"></div>
      <div className="blob-shape blob-2"></div>

      <div className="glass-panel fade-up" style={{ maxWidth: '500px', width: '100%', textAlign: 'center', padding: '48px 32px' }}>

        {/* Welcome Header */}
        <div style={{ marginBottom: '32px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '100px', height: '100px', marginBottom: '16px', filter: 'drop-shadow(0 6px 14px rgba(249,168,212,0.4))', animation: 'float 4s ease-in-out infinite' }} />
          <h1 style={{ fontSize: '2.2rem', color: '#1f2937', marginBottom: '8px' }}>
            Welcome back, {firstName}! 🌸
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            Your AI-powered daily planner is ready.
          </p>
        </div>

        {/* Quick Stats Card */}
        {taskCount !== null && (
          <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '16px', padding: '20px', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', border: '1px solid rgba(249,168,212,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
            <div style={{ background: '#ecfdf5', padding: '12px', borderRadius: '50%' }}>
              <CheckCircle2 size={28} color="#34d399" />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ margin: 0, fontSize: '13px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today's Progress</p>
              <h2 style={{ margin: 0, fontSize: '24px', color: '#1f2937' }}>{taskCount} tasks completed</h2>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button
            onClick={() => router.push(`/plan?email=${encodeURIComponent(userEmail)}`)}
            className="btn"
            style={{ width: '100%', padding: '16px', fontSize: '18px', gap: '10px' }}
          >
            <Sparkles size={22} /> Plan Tomorrow
          </button>

          <button
            onClick={() => router.push(`/calendar?email=${encodeURIComponent(userEmail)}`)}
            style={{ width: '100%', padding: '16px', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(255,255,255,0.8)', border: '2px solid #fbcfe8', color: '#db2777', borderRadius: '9999px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            onMouseOver={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(249,168,212,0.3)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.8)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)'; }}
          >
            <CalendarIcon size={22} /> View Calendar
          </button>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ marginTop: '32px', background: 'none', border: 'none', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', cursor: 'pointer', fontSize: '15px', fontWeight: '600', transition: 'color 0.2s' }}
          onMouseOver={e => e.currentTarget.style.color = '#ef4444'}
          onMouseOut={e => e.currentTarget.style.color = '#9ca3af'}
        >
          <LogOut size={18} /> Sign Out
        </button>

      </div>
    </main>
  );
}
