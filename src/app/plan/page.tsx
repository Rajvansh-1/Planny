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
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '1.5rem', overflow: 'hidden' }}>
      <div className="glass-panel" style={{ maxWidth: '600px', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', animation: 'fadeInUp 0.6s ease-out', position: 'relative', marginTop: '1rem', padding: '24px' }}>

        {/* Navigation / Back Button */}
        <button onClick={() => router.push('/')} style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(249,168,212,0.5)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#6b7280', transition: 'all 0.2s', zIndex: 10 }}>
          ←
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px', marginTop: '8px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '96px', height: '96px', objectFit: 'contain', filter: 'drop-shadow(0 6px 14px rgba(249,168,212,0.4))', marginBottom: '12px', animation: 'float 3s ease-in-out infinite' }} />
          <h1 style={{ fontSize: '2rem', color: '#1f2937', margin: '0 0 6px', letterSpacing: '-0.02em', fontWeight: '800' }}>Plan Tomorrow 🌱</h1>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
            {loading ? 'Waking up your list...' : tasks.length > 0
              ? `You did ${completedCount}/${tasks.length} tasks today! Add more down below.`
              : 'Add your goals for tomorrow below'}
          </p>
        </div>

        {/* Add task form */}
        <form onSubmit={addTask} style={{ display: 'flex', gap: '8px', marginBottom: '24px', position: 'relative' }}>
          <input
            type="text"
            className="input-glass"
            style={{ marginBottom: 0, flex: 1, padding: '16px 20px', paddingRight: '100px', fontSize: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}
            placeholder="E.g. Finish the presentation..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn" style={{ position: 'absolute', right: '6px', top: '6px', bottom: '6px', padding: '0 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px', fontWeight: 'bold' }}>
            <Plus size={18} /> Add
          </button>
        </form>

        {/* Task list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#f9a8d4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', animation: 'pulse 2s infinite' }}>
              <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
              <span style={{ fontWeight: '500' }}>Loading tasks...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.5)', border: '2px dashed #fbcfe8', borderRadius: '16px', padding: '40px 20px', animation: 'fadeIn 0.5s ease-out' }}>
              <p style={{ color: '#9ca3af', fontStyle: 'italic', margin: 0, fontSize: '16px' }}>
                No tasks yet — start adding your goals! ✨
              </p>
            </div>
          ) : tasks.map((task) => (
            <div
              key={task.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: task.completed ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.9)',
                padding: '16px',
                borderRadius: '16px',
                borderLeft: `5px solid ${task.completed ? '#34d399' : '#f9a8d4'}`,
                boxShadow: task.completed ? 'none' : '0 4px 10px rgba(0,0,0,0.03)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: task.isNew ? 'scale(0.95)' : 'scale(1)',
                opacity: task.isNew ? 0.7 : 1,
                animation: 'fadeInUp 0.3s ease-out forwards'
              }}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleTask(task)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, transition: 'transform 0.2s' }}
                title={task.completed ? 'Mark as pending' : 'Mark as done'}
                onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {task.isSaving
                  ? <Loader2 size={24} color="#d1d5db" style={{ animation: 'spin 1s linear infinite' }} />
                  : task.completed
                    ? <CheckCircle2 size={26} color="#34d399" />
                    : <Circle size={26} color="#d1d5db" />}
              </button>

              {/* Task content or inline editor */}
              {editingId === task.id ? (
                <>
                  <input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(task)}
                    autoFocus
                    style={{ flex: 1, border: '2px solid #f9a8d4', borderRadius: '10px', padding: '8px 12px', fontSize: '16px', outline: 'none', background: 'rgba(255,255,255,0.9)' }}
                  />
                  <button onClick={() => saveEdit(task)} style={{ background: '#ecfdf5', border: 'none', cursor: 'pointer', color: '#10b981', padding: '8px', borderRadius: '8px' }} title="Save">
                    <Check size={20} />
                  </button>
                  <button onClick={() => setEditingId(null)} style={{ background: '#fef2f2', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px', borderRadius: '8px' }} title="Cancel">
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <span style={{ flex: 1, color: task.completed ? '#9ca3af' : '#1f2937', textDecoration: task.completed ? 'line-through' : 'none', fontSize: '16px', lineHeight: '1.4', fontWeight: '500', transition: 'all 0.2s' }}>
                    {task.content}
                  </span>
                  {/* Edit button */}
                  <button
                    onClick={() => !task.isSaving && startEdit(task)}
                    style={{ background: 'none', border: 'none', cursor: task.isSaving ? 'not-allowed' : 'pointer', color: task.isSaving ? '#e5e7eb' : '#9ca3af', padding: '6px', flexShrink: 0, transition: 'color 0.2s' }}
                    title={task.isSaving ? 'Wait for task to save...' : 'Edit task'}
                    disabled={task.isSaving}
                    onMouseOver={e => !task.isSaving && (e.currentTarget.style.color = '#f9a8d4')}
                    onMouseOut={e => !task.isSaving && (e.currentTarget.style.color = '#9ca3af')}
                  >
                    <Pencil size={18} />
                  </button>
                  {/* Delete button */}
                  <button
                    onClick={() => !task.isSaving && deleteTask(task)}
                    style={{ background: 'none', border: 'none', cursor: task.isSaving ? 'not-allowed' : 'pointer', color: task.isSaving ? '#e5e7eb' : '#fca5a5', padding: '6px', flexShrink: 0, transition: 'color 0.2s' }}
                    title={task.isSaving ? 'Wait for task to save...' : 'Delete task'}
                    disabled={task.isSaving}
                    onMouseOver={e => !task.isSaving && (e.currentTarget.style.color = '#ef4444')}
                    onMouseOut={e => !task.isSaving && (e.currentTarget.style.color = '#fca5a5')}
                  >
                    <X size={20} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer links */}
        <div style={{ textAlign: 'center', paddingTop: '20px', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button onClick={() => router.push('/calendar')} style={{ background: 'none', border: 'none', color: '#f9a8d4', textDecoration: 'none', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 20px', borderRadius: '20px', backgroundColor: 'rgba(249,168,212,0.1)' }}>
            📅 View Calendar
          </button>
        </div>
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
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse {
          0% { opacity: 0.6; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
          100% { opacity: 0.6; transform: scale(0.96); }
        }
        .input-glass:focus {
          border-color: #fca5a5 !important;
          box-shadow: 0 0 0 4px rgba(252,165,165,0.2) !important;
        }
      `}</style>
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
