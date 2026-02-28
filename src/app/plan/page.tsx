"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CalendarPlus, X } from 'lucide-react';

function PlanForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email');

  const [taskInput, setTaskInput] = useState('');
  const [tasks, setTasks] = useState<{ content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push('/');
    }
  }, [email, router]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskInput.trim() !== '') {
      setTasks([...tasks, { content: taskInput.trim() }]);
      setTaskInput('');
    }
  };

  const removeTask = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const submitTasks = async () => {
    if (tasks.length === 0) return;
    setLoading(true);

    // Tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateFor = tomorrow.toISOString().split('T')[0];

    try {
      for (const t of tasks) {
        await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, content: t.content, dateFor })
        });
      }
      router.push('/plan/success');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!email) return null;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel fade-up" style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', background: 'white', borderRadius: '20px', marginBottom: '20px', boxShadow: '0 8px 20px rgba(249, 168, 212, 0.3)' }}>
            <CalendarPlus style={{ color: '#f9a8d4' }} size={32} />
          </div>
          <h1 style={{ fontSize: '2rem', color: '#1f2937' }}>Plan Your Tomorrow 🌱</h1>
          <p style={{ color: '#6b7280', marginBottom: '30px' }}>What are your key goals for the day?</p>
        </div>

        <form onSubmit={addTask} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            className="input-glass"
            style={{ marginBottom: 0 }}
            placeholder="E.g. Finish the presentation..."
            value={taskInput}
            onChange={e => setTaskInput(e.target.value)}
          />
          <button type="submit" className="btn" style={{ padding: '0 20px', borderRadius: '16px' }}>Add</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
          {tasks.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#9ca3af', fontStyle: 'italic', padding: '20px' }}>No tasks added yet. Start planning!</p>
          ) : (
            tasks.map((task, idx) => (
              <div key={idx} className="fade-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.8)', padding: '15px 20px', borderRadius: '12px', borderLeft: '4px solid #f9a8d4' }}>
                <span style={{ color: '#374151' }}>{task.content}</span>
                <button type="button" onClick={() => removeTask(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d1d5db' }}>
                  <X size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {tasks.length > 0 && (
          <button onClick={submitTasks} disabled={loading} className="btn" style={{ width: '100%', fontSize: '1.2rem' }}>
            {loading ? 'Saving to Planny... ✨' : 'Save My Plan 🌸'}
          </button>
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
  )
}
