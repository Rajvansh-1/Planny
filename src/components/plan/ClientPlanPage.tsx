"use client";

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Check, Trash2, Loader2, Sparkles, Moon, Sun, ArrowLeft, Pencil, X, CheckCircle2, Circle, CalendarDays, Edit2, PartyPopper } from 'lucide-react';
import { format, isTomorrow, isToday, parseISO } from 'date-fns';

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
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isNavigatingCalendar, setIsNavigatingCalendar] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState<string[]>([]);


  // Tomorrow's date for new tasks
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  // Load existing tasks for tomorrow on mount
  useEffect(() => {
    if (!email) { router.push('/'); return; }

    async function checkStatusAndFetchTasks() {
      setLoading(true);
      try {
        // 1. Check if user is paid
        const statusRes = await fetch(`/api/user/status?email=${encodeURIComponent(email!)}`);
        const statusData = await statusRes.json();

        if (!statusData.isPaid) {
          router.push(`/payment?email=${encodeURIComponent(email!)}`);
          return;
        }

        // 2. Fetch tasks
        const res = await fetch(`/api/tasks?email=${encodeURIComponent(email!)}&dateFor=${tomorrowStr}`);
        const data = await res.json();
        if (data.tasks) {
          setTasks(data.tasks.map((t: any) => ({
            id: t.id,
            content: t.content,
            completed: t.completed,
            dateFor: t.dateFor,
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
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.filter(t => t.id !== optimisticId));
    }
  };

  const toggleTask = async (task: Task) => {
    if (!task.id || task.isNew || loadingTasks.includes(task.id)) return;

    try {
      setLoadingTasks(prev => [...prev, task.id!]);
      const newStatus = !task.completed;

      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newStatus }),
      });

      if (res.ok) {
        setTasks(tasks.map(t =>
          t.id === task.id ? { ...t, completed: newStatus, isSaving: false } : t
        ));
      } else {
        // Revert on failure
        setTasks(tasks.map(t =>
          t.id === task.id ? { ...t, isSaving: false } : t
        ));
      }
    } catch (error) {
      console.error('Failed to toggle task:', error);
      // Revert on failure
      setTasks(tasks.map(t =>
        t.id === task.id ? { ...t, isSaving: false } : t
      ));
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

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditText(task.content);
  };

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
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,248,246,0.8)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', background: 'white', padding: '40px 60px', borderRadius: '40px', boxShadow: 'var(--shadow-lg)', border: '2px solid rgba(45,27,46,0.08)' }}>
            <Loader2 size={48} className="spinner" style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>Loading your calendar... âœ¨</span>
          </div>
        </div>
      )}

      <div className="glass-panel pop-in" style={{ maxWidth: '650px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', marginTop: '1rem', padding: '40px 32px' }}>

        {/* Top Header Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(45,27,46,0.08)', borderRadius: '16px', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', fontWeight: '700', boxShadow: 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }}
            title="Go to Dashboard"
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.95)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <ArrowLeft size={24} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '13px', background: 'linear-gradient(135deg, rgba(244,114,182,0.15), rgba(253,224,217,0.4))', border: '1px solid rgba(244,114,182,0.2)', color: 'var(--accent)', padding: '6px 16px', borderRadius: '40px', fontWeight: '800', letterSpacing: '0.05em', boxShadow: 'var(--shadow-sm)' }}>PLANNING ðŸŽ¯</span>
            <img src="/planny-logo.png" alt="Planny" style={{ width: '40px', height: '40px', objectFit: 'contain', background: 'white', borderRadius: '12px', padding: '6px', border: '2px solid rgba(255,255,255,0.8)', boxShadow: 'var(--shadow-sm)' }} />
          </div>
        </div>

        {/* Title Section */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <h1 className="text-glow" style={{ fontSize: '2.4rem', margin: '0 0 8px', lineHeight: '1.2', fontWeight: '800', letterSpacing: '-0.02em' }}>Plan Tomorrow âœ¨</h1>
          <p style={{ color: '#64748b', margin: 0, fontSize: '1.1rem', fontWeight: '500' }}>
            {loading ? 'Waking up your list...' : tasks.length > 0
              ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>You did {completedCount}/{tasks.length} tasks today! {completedCount === tasks.length && completedCount > 0 ? <PartyPopper size={20} style={{ color: 'var(--accent)', animation: 'popIn 0.5s ease-out' }} /> : ''}</span>
              : 'Add your goals for tomorrow below'}
          </p>
        </div>

        {/* Add task form */}
        <form onSubmit={addTask} style={{ display: 'flex', gap: '12px', marginBottom: '40px', position: 'relative' }}>
          <input
            type="text"
            className="input-glass"
            style={{ marginBottom: 0, flex: 1, paddingRight: '20px' }}
            placeholder="E.g. Code for 2 hours..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn" disabled={!taskInput.trim()} style={{ padding: '0 24px', borderRadius: '14px' }}>
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </form>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', animation: 'pulse 2s infinite' }}>
              <Loader2 size={48} className="spinner" />
              <span style={{ fontWeight: '800', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div className="pop-in" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.6)', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '24px', padding: '48px 24px' }}>
              <p style={{ color: '#94a3b8', fontStyle: 'italic', margin: 0, fontSize: '1.1rem', fontWeight: '400' }}>
                No tasks yet â€” start adding your goals âœ¨
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: task.completed ? 'rgba(255,255,255,0.4)' : 'white',
                    padding: '24px',
                    borderRadius: '24px',
                    border: task.completed ? '1px solid rgba(255,255,255,0.5)' : '2px solid rgba(45,27,46,0.06)',
                    boxShadow: task.completed ? 'none' : 'var(--shadow-sm)',
                    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    animation: 'fadeUp 0.3s ease-out forwards',
                    opacity: task.completed ? 0.6 : 1,
                    gap: '16px'
                  }}
                  onMouseOver={e => {
                    if (!task.completed && editingId !== task.id) {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)';
                    }
                  }}
                  onMouseOut={e => {
                    if (!task.completed && editingId !== task.id) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      e.currentTarget.style.borderColor = 'rgba(45,27,46,0.06)';
                    }
                  }}
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
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => saveEdit(task as any)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(task as any);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      style={{ flex: 1, padding: '12px 16px', fontSize: '1.15rem' }}
                    />
                  ) : (
                    <span
                      style={{
                        flex: 1,
                        color: task.completed ? '#cbd5e1' : 'var(--text-dark)',
                        textDecoration: task.completed ? 'line-through' : 'none',
                        lineHeight: '1.4',
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        transition: 'all 0.3s ease',
                        wordBreak: 'break-word',
                        whiteSpace: 'pre-wrap',
                        paddingTop: '2px'
                      }}
                      onDoubleClick={() => startEdit(task as any)}
                    >
                      {task.content}
                    </span>
                  )}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => editingId === task.id ? saveEdit(task as any) : startEdit(task as any)}
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(45,27,46,0.08)',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = 'var(--text-dark)';
                        e.currentTarget.style.background = '#fff0f5';
                        e.currentTarget.style.borderColor = 'rgba(244,114,182,0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = '#64748b';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      {editingId === task.id ? <Check size={20} style={{ color: '#10b981' }} /> : <Edit2 size={20} />}
                    </button>
                    <button
                      onClick={() => deleteTask(task as any)}
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        border: '1px solid rgba(45,27,46,0.08)',
                        borderRadius: '12px',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseOver={e => {
                        e.currentTarget.style.color = '#ef4444';
                        e.currentTarget.style.background = '#fef2f2';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseOut={e => {
                        e.currentTarget.style.color = '#94a3b8';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.9)';
                        e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', paddingTop: '24px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={() => {
              setIsNavigatingCalendar(true);
              router.push(`/calendar?email=${encodeURIComponent(email || '')}`);
            }}
            className="btn pop-in"
            disabled={isNavigatingCalendar}
            style={{
              width: '100%',
              marginTop: '40px',
              padding: '24px',
              fontSize: '1.25rem',
              gap: '12px',
              background: 'rgba(255,255,255,0.9)',
              color: 'var(--text-dark)',
              border: '2px solid rgba(45,27,46,0.08)',
              boxShadow: 'var(--shadow-sm)',
              animationDelay: '0.4s'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.08)'; }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(1px) scale(0.98)'; }}
          >
            {isNavigatingCalendar ? <Loader2 size={24} className="spinner" /> : <CalendarDays size={24} />}
            {isNavigatingCalendar ? 'Opening Calendar...' : 'View My Calendar'}
          </button>
        </div>
      </div>

      {/* Removed styles from here since they were moved to globals.css */}
    </main>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <PlanForm />
    </Suspense>
  );
}
