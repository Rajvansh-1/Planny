"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, Circle, X, Plus, Send } from 'lucide-react';

type Task = {
  id?: string;
  content: string;
  completed?: boolean;
  isNew?: boolean; // locally added, not yet saved
};

function PlanForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim()) {
      setTasks([...tasks, { content: taskInput.trim(), completed: false, isNew: true }]);
      setTaskInput('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const toggleTask = async (index: number) => {
    const task = tasks[index];
    const newCompleted = !task.completed;
    const updatedTasks = tasks.map((t, i) => i === index ? { ...t, completed: newCompleted } : t);
    setTasks(updatedTasks);

    // If task is already saved in DB, update via API
    if (task.id) {
      await fetch('/api/tasks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, completed: newCompleted }),
      });
    }
  };

  const submitTasks = async () => {
    const newTasks = tasks.filter(t => t.isNew);
    if (newTasks.length === 0) return;
    setLoading(true);

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFor = tomorrow.toISOString().split('T')[0];

    try {
      const saved: Task[] = [];
      for (const t of newTasks) {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, content: t.content, dateFor }),
        });
        const data = await res.json();
        if (data.task) {
          saved.push({ id: data.task.id, content: t.content, completed: false, isNew: false });
        }
      }
      // Mark all tasks as saved
      setTasks(tasks.map(t => t.isNew ? { ...t, isNew: false } : t));
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  const newTasksCount = tasks.filter(t => t.isNew).length;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '600px', width: '100%' }}>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img src="/planny-logo.png" alt="Planny" style={{ width: '70px', height: '70px', objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(249,168,212,0.4))', marginBottom: '12px' }} />
          {submitted ? (
            <>
              <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Plan saved! 🎉</h1>
              <p style={{ color: '#6b7280' }}>Check your inbox tomorrow morning at 7 AM for your digest.</p>
            </>
          ) : (
            <>
              <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Plan Your Tomorrow 🌱</h1>
              <p style={{ color: '#6b7280' }}>Add tasks below — you can also tick off tasks you've done today!</p>
            </>
          )}
        </div>

        {/* Task Input */}
        {!submitted && (
          <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <input
              type="text"
              className="input-glass"
              style={{ marginBottom: 0 }}
              placeholder="E.g. Finish the presentation..."
              value={taskInput}
              onChange={e => setTaskInput(e.target.value)}
            />
            <button type="submit" className="btn" style={{ padding: '0 18px', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Add
            </button>
          </form>
        )}

        {/* Task List with Checkboxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {tasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: '24px' }}>
              No tasks added yet. Start planning your tomorrow! ✨
            </p>
          ) : (
            tasks.map((task, idx) => (
              <div
                key={idx}
                className="fade-up"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: task.completed ? 'rgba(52,211,153,0.08)' : 'rgba(255,255,255,0.85)',
                  padding: '14px 16px',
                  borderRadius: '14px',
                  borderLeft: `4px solid ${task.completed ? '#34d399' : '#f9a8d4'}`,
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
                onClick={() => toggleTask(idx)}
              >
                {task.completed
                  ? <CheckCircle2 size={22} color="#34d399" style={{ flexShrink: 0 }} />
                  : <Circle size={22} color="#d1d5db" style={{ flexShrink: 0 }} />
                }
                <span style={{
                  flex: 1,
                  color: task.completed ? '#9ca3af' : '#374151',
                  textDecoration: task.completed ? 'line-through' : 'none',
                  fontSize: '16px',
                  lineHeight: '1.4',
                }}>
                  {task.content}
                </span>
                {task.isNew && (
                  <span style={{ fontSize: '11px', color: '#f9a8d4', fontWeight: 'bold', background: 'rgba(249,168,212,0.1)', padding: '2px 8px', borderRadius: '8px' }}>NEW</span>
                )}
                {!submitted && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removeTask(idx); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db', padding: '4px', flexShrink: 0 }}
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit Button */}
        {!submitted && newTasksCount > 0 && (
          <button
            onClick={submitTasks}
            disabled={loading}
            className="btn"
            style={{ width: '100%', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <Send size={18} />
            {loading ? 'Saving to Planny... ✨' : `Save ${newTasksCount} Task${newTasksCount > 1 ? 's' : ''} for Tomorrow 🌸`}
          </button>
        )}

        {submitted && (
          <div style={{ textAlign: 'center' }}>
            <a href="/" style={{ color: '#f9a8d4', textDecoration: 'none', fontSize: '14px' }}>← Back to Home</a>
          </div>
        )}
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
