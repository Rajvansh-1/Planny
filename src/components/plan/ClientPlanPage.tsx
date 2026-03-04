"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Plus, Check, Trash2, Loader2, ArrowLeft, CheckCircle2,
  Circle, CalendarDays, Edit2, PartyPopper, Flame
} from 'lucide-react';

type Task = {
  id: string | null;
  content: string;
  completed: boolean;
  dateFor: string;
  isNew?: boolean;
  isSaving?: boolean;
};

function PlanForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isNavigatingCalendar, setIsNavigatingCalendar] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  useEffect(() => {
    if (!email) { router.push('/'); return; }

    async function checkStatusAndFetchTasks() {
      setLoading(true);
      try {
        const statusRes = await fetch(`/api/user/status?email=${encodeURIComponent(email!)}`);
        const statusData = await statusRes.json();
        if (!statusData.isPaid) {
          router.push(`/payment?email=${encodeURIComponent(email!)}`);
          return;
        }

        if (statusData.currentStreak !== undefined) {
          setStreak(statusData.currentStreak);
        }

        const res = await fetch(`/api/tasks?email=${encodeURIComponent(email!)}&dateFor=${tomorrowStr}`);
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks.map((t: any) => ({
            id: t.id, content: t.content, completed: t.completed, dateFor: t.dateFor,
          })));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    checkStatusAndFetchTasks();
  }, [email, router, tomorrowStr]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;
    const optimisticId = `temp_${Date.now()}`;
    const newTask: Task = { id: optimisticId, content: taskInput.trim(), completed: false, dateFor: tomorrowStr, isNew: true, isSaving: true };
    setTasks(prev => [...prev, newTask]);
    setTaskInput('');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: newTask.content, dateFor: tomorrowStr }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => prev.map(t => t.id === optimisticId ? { ...t, id: data.task.id, isSaving: false, isNew: false } : t));
      }
    } catch {
      setTasks(prev => prev.filter(t => t.id !== optimisticId));
    }
  };

  const toggleTask = async (task: Task) => {
    if (!task.id || task.isNew || loadingTasks.includes(task.id)) return;
    setLoadingTasks(prev => [...prev, task.id!]);
    const newStatus = !task.completed;
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });
      if (res.ok) {
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newStatus } : t));
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
    } finally {
      setLoadingTasks(prev => prev.filter(id => id !== task.id));
    }
  };

  const deleteTask = async (task: Task) => {
    setTasks(prev => prev.filter(t => t.id !== task.id));
    if (task.id && !task.isNew) {
      await fetch('/api/tasks', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });
    }
  };

  const startEdit = (task: Task) => { setEditingId(task.id); setEditText(task.content); };

  const saveEdit = async (task: Task) => {
    if (!editText.trim()) return;
    const newContent = editText.trim();
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, content: newContent } : t));
    setEditingId(null);
    if (task.id && !task.isNew) {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, content: newContent }),
      });
    }
  };

  if (!email) return null;
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5rem', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
      <div className="mesmerizing-bg"></div>

      {isNavigatingCalendar && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,248,246,0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'white', padding: '40px 60px', borderRadius: '40px', boxShadow: 'var(--shadow-lg)' }}>
            <Loader2 size={48} className="spinner" style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)' }}>Loading your calendar... ✨</span>
          </div>
        </div>
      )}

      <div className="glass-panel pop-in" style={{ maxWidth: '650px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '1rem', padding: '40px 32px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(45,27,46,0.08)', borderRadius: '16px', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}
            title="Go to Dashboard"
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
          >
            <ArrowLeft size={24} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', background: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(253,224,217,0.4))', border: '1px solid rgba(244,114,182,0.2)', color: 'var(--accent)', padding: '6px 16px', borderRadius: '40px', fontWeight: '800', letterSpacing: '0.05em', boxShadow: 'var(--shadow-sm)' }}>PLANNING 🎯</span>
            <img src="/planny-logo.png" alt="Planny" style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'white', borderRadius: '12px', padding: '6px', border: '2px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-sm)' }} />
          </div>
        </div>

        {/* Title & Streak Badge */}
        <div style={{ textAlign: 'center', marginBottom: '36px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {streak > 0 && (
            <div className="pop-in" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
              padding: '6px 16px', borderRadius: '40px', marginBottom: '16px',
              border: '2px solid rgba(255,100,100,0.3)', boxShadow: '0 4px 15px rgba(255,154,158,0.3)'
            }}>
              <Flame size={20} strokeWidth={2.5} style={{ color: '#e11d48', animation: 'pulse 2s infinite' }} />
              <span style={{ color: '#9f1239', fontWeight: '800', fontSize: '15px', letterSpacing: '0.05em' }}>
                {streak} DAY STREAK
              </span>
            </div>
          )}

          <h1 className="text-glow" style={{ fontSize: '2.4rem', margin: '0 0 8px', lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.02em' }}>Plan Tomorrow ✨</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>
            {loading ? 'Waking up your list...' : tasks.length > 0
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                You did {completedCount}/{tasks.length} tasks today!
                {completedCount === tasks.length && completedCount > 0 ? <PartyPopper size={20} style={{ color: 'var(--accent)' }} /> : ''}
              </span>
              : 'Add your goals for tomorrow below'}
          </p>
        </div>

        {/* Add Task Form */}
        <form onSubmit={addTask} style={{ display: 'flex', gap: '12px', marginBottom: '40px' }}>
          <input
            type="text"
            className="input-glass"
            style={{ marginBottom: 0, flex: 1 }}
            placeholder="E.g. Code for 2 hours..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn" disabled={!taskInput.trim()} style={{ padding: '0 24px', borderRadius: '14px' }}>
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Task List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', animation: 'pulse 2s infinite' }}>
              <Loader2 size={48} className="spinner" style={{ color: 'var(--primary)' }} />
              <span style={{ fontWeight: '800', fontSize: '1.2rem', color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="pop-in" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '24px', padding: '48px 24px' }}>
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: '1.1rem', fontWeight: '400' }}>
                No tasks yet — start adding your goals ✨
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: task.completed ? 'rgba(255,255,255,0.4)' : 'white', padding: '24px', borderRadius: '24px', border: task.completed ? '1px solid rgba(255,255,255,0.5)' : '2px solid rgba(45,27,46,0.06)', boxShadow: task.completed ? 'none' : 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', opacity: task.completed ? 0.6 : 1, gap: '16px' }}
                  onMouseOver={e => { if (!task.completed && editingId !== task.id) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; } }}
                  onMouseOut={e => { if (!task.completed && editingId !== task.id) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.06)'; } }}
                >
                  <button
                    onClick={() => toggleTask(task)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, transition: 'transform 0.1s ease' }}
                    title={task.completed ? 'Mark as pending' : 'Mark as done'}
                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                  >
                    {loadingTasks.includes(task.id!) ? (
                      <Loader2 size={28} color="var(--text-dark)" className="spinner" />
                    ) : task.completed ? (
                      <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                    ) : (
                      <Circle size={32} style={{ color: '#94a3b8' }} />
                    )}
                  </button>

                  {editingId === task.id ? (
                    <input
                      type="text"
                      className="input-glass"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onBlur={() => saveEdit(task)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(task); if (e.key === 'Escape') setEditingId(null); }}
                      autoFocus
                      style={{ flex: 1, padding: '12px 16px', fontSize: '1.15rem' }}
                    />
                  ) : (
                    <span
                      style={{ flex: 1, color: task.completed ? '#cbd5e1' : 'var(--text-dark)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: '1.4', fontSize: '1.25rem', fontWeight: '700', transition: 'all 0.3s ease', wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
                      onDoubleClick={() => startEdit(task)}
                    >
                      {task.content}
                    </span>
                  )}

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => editingId === task.id ? saveEdit(task) : startEdit(task)}
                      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(45,27,46,0.08)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: 'var(--shadow-sm)' }}
                      onMouseOver={e => { e.currentTarget.style.color = 'var(--text-dark)'; e.currentTarget.style.background = '#fff0f5'; e.currentTarget.style.borderColor = 'rgba(244,114,182,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      {editingId === task.id ? <Check size={20} style={{ color: '#10b981' }} /> : <Edit2 size={20} />}
                    </button>
                    <button
                      onClick={() => deleteTask(task)}
                      style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(45,27,46,0.08)', borderRadius: '12px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)', boxShadow: 'var(--shadow-sm)' }}
                      onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                      onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Calendar Button */}
        <button
          onClick={() => { setIsNavigatingCalendar(true); router.push(`/calendar?email=${encodeURIComponent(email || '')}`); }}
          className="btn pop-in"
          disabled={isNavigatingCalendar}
          style={{ width: '100%', marginTop: '24px', padding: '24px', fontSize: '1.25rem', gap: '12px', background: 'rgba(255,255,255,0.9)', color: 'var(--text-dark)', border: '2px solid rgba(45,27,46,0.08)', boxShadow: 'var(--shadow-sm)', animationDelay: '0.4s' }}
          onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; }}
          onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; }}
          onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; }}
        >
          {isNavigatingCalendar ? <Loader2 size={24} className="spinner" /> : <CalendarDays size={24} />}
          {isNavigatingCalendar ? 'Opening Calendar...' : 'View My Calendar'}
        </button>
      </div>
    </main>
  );
}

export default function PlanClientPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} className="spinner" style={{ color: '#f472b6' }} />
        <span style={{ fontWeight: '800', color: '#f472b6' }}>Loading Planny...</span>
      </div>
    }>
      <PlanForm />
    </Suspense>
  );
}
