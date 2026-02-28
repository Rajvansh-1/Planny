"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Circle, X, Plus, Pencil, Check, Loader2 } from 'lucide-react';

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
        setTasks(prev => prev.map(t => t.id === optimisticId ? { ...t, id: data.task.id, isSaving: false } : t));
      }
    } catch (e) {
      console.error(e);
      setTasks(prev => prev.filter(t => t.id !== optimisticId));
    }
  };

  const toggleTask = async (task: Task) => {
    if (!task.id || task.isNew) return;
    const newCompleted = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
    await fetch('/api/tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id, completed: newCompleted }),
    });
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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '600px', width: '100%' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(249,168,212,0.4))', marginBottom: '10px' }} />
          <h1 style={{ fontSize: '1.9rem', color: '#1f2937', margin: '0 0 6px' }}>Plan Your Tomorrow 🌱</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
            {loading ? 'Loading your tasks...' : tasks.length > 0
              ? `${completedCount}/${tasks.length} tasks done today · Add more for tomorrow`
              : 'Add your goals for tomorrow below'}
          </p>
        </div>

        {/* Add task form */}
        <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input
            type="text"
            className="input-glass"
            style={{ marginBottom: 0, flex: 1 }}
            placeholder="E.g. Finish the presentation..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn" style={{ padding: '0 16px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
            <Plus size={16} /> Add
          </button>
        </form>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', minHeight: '60px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Loading tasks...
            </div>
          ) : tasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: '20px 0', margin: 0 }}>
              No tasks yet — start adding your goals for tomorrow! ✨
            </p>
          ) : tasks.map((task) => (
            <div
              key={task.id}
              className="fade-up"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                background: task.completed ? 'rgba(52,211,153,0.07)' : 'rgba(255,255,255,0.85)',
                padding: '12px 14px',
                borderRadius: '12px',
                borderLeft: `4px solid ${task.completed ? '#34d399' : '#f9a8d4'}`,
                transition: 'all 0.25s ease',
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, lineHeight: 0 }}
                title={task.completed ? 'Mark as pending' : 'Mark as done'}
              >
                {task.isSaving
                  ? <Loader2 size={20} color="#d1d5db" />
                  : task.completed
                    ? <CheckCircle2 size={20} color="#34d399" />
                    : <Circle size={20} color="#d1d5db" />}
              </button>

              {/* Task content or inline editor */}
              {editingId === task.id ? (
                <>
                  <input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(task)}
                    autoFocus
                    style={{ flex: 1, border: '1.5px solid #f9a8d4', borderRadius: '8px', padding: '4px 10px', fontSize: '15px', outline: 'none' }}
                  />
                  <button onClick={() => saveEdit(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#34d399', padding: '4px' }} title="Save">
                    <Check size={18} />
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '4px' }} title="Cancel">
                    <X size={18} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, color: task.completed ? '#9ca3af' : '#374151', textDecoration: task.completed ? 'line-through' : 'none', fontSize: '15px', lineHeight: '1.4' }}>
                    {task.content}
                  </span>
                  {/* Edit button - disabled while saving */}
                  <button
                    onClick={() => !task.isSaving && startEdit(task)}
                    style={{ background: 'none', border: 'none', cursor: task.isSaving ? 'not-allowed' : 'pointer', color: task.isSaving ? '#e5e7eb' : '#d1d5db', padding: '4px', flexShrink: 0 }}
                    title={task.isSaving ? 'Wait for task to save...' : 'Edit task'}
                    disabled={task.isSaving}
                  >
                    <Pencil size={15} />
                  </button>
                  {/* Delete button - disabled while saving */}
                  <button
                    onClick={() => !task.isSaving && deleteTask(task)}
                    style={{ background: 'none', border: 'none', cursor: task.isSaving ? 'not-allowed' : 'pointer', color: task.isSaving ? '#e5e7eb' : '#fca5a5', padding: '4px', flexShrink: 0 }}
                    title={task.isSaving ? 'Wait for task to save...' : 'Delete task'}
                    disabled={task.isSaving}
                  >
                    <X size={16} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', borderTop: '1px solid rgba(249,168,212,0.2)', paddingTop: '16px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <a href="/" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '13px' }}>← Home</a>
          <a href="/calendar" style={{ color: '#f9a8d4', textDecoration: 'none', fontSize: '13px' }}>📅 My Calendar</a>
        </div>
      </div>
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
