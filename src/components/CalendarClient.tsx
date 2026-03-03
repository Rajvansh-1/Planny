"use client";

import { useState, useRef } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek,
  isToday, isTomorrow, isPast,
} from 'date-fns';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle,
  ArrowLeft, Loader2, Plus, Sparkles, CalendarDays, Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

type Task = {
  id: string;
  content: string;
  dateFor: string;
  completed: boolean;
};

export default function CalendarClient({ tasks: initialTasks, email }: { tasks: Task[]; email: string }) {
  const router = useRouter();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [loadingTasks, setLoadingTasks] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);
  const [newTaskInput, setNewTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = tasks.filter(t => t.dateFor === selectedDateStr);
  const hasTasks = (day: Date) => tasks.some(t => t.dateFor === format(day, 'yyyy-MM-dd'));

  // Label for the selected date: "Today", "Tomorrow", or formatted date
  const getDateLabel = (d: Date) => {
    if (isToday(d)) return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEEE, MMMM do');
  };

  const canAddTasks = !isPast(selectedDate) || isToday(selectedDate);

  // ─── Add task for selected date ──────────────────────────────────────────────
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim() || !email) return;
    setIsAddingTask(true);
    const optimisticId = `temp_${Date.now()}`;
    const optimisticTask: Task = {
      id: optimisticId, content: newTaskInput.trim(),
      dateFor: selectedDateStr, completed: false,
    };
    setTasks(prev => [...prev, optimisticTask]);
    setNewTaskInput('');
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, content: optimisticTask.content, dateFor: selectedDateStr }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks(prev => prev.map(t =>
          t.id === optimisticId ? { ...t, id: data.task.id } : t
        ));
      }
    } catch {
      setTasks(prev => prev.filter(t => t.id !== optimisticId));
    } finally {
      setIsAddingTask(false);
      inputRef.current?.focus();
    }
  };

  // ─── Toggle task ─────────────────────────────────────────────────────────────
  const handleToggle = async (task: Task) => {
    if (loadingTasks.includes(task.id)) return;
    setLoadingTasks(prev => [...prev, task.id]);
    const newCompleted = !task.completed;
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: newCompleted } : t));
    try {
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: newCompleted }),
      });
    } catch {
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: !newCompleted } : t));
    } finally {
      setLoadingTasks(prev => prev.filter(id => id !== task.id));
    }
  };

  // ─── Delete task ─────────────────────────────────────────────────────────────
  const handleDelete = async (task: Task) => {
    setTasks(prev => prev.filter(t => t.id !== task.id));
    await fetch('/api/tasks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    });
  };

  const completedCount = selectedTasks.filter(t => t.completed).length;

  return (
    <>
      <div className="mesmerizing-bg"></div>

      <main style={{ minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '900px', position: 'relative', animation: 'fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>

          {/* Nav Bar — back only */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <button
              onClick={() => router.push(email ? `/dashboard?email=${encodeURIComponent(email)}` : '/dashboard')}
              style={{ background: 'rgba(255,255,255,0.9)', border: '2px solid rgba(45,27,46,0.08)', borderRadius: '16px', width: '48px', height: '48px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dark)', boxShadow: 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', flexShrink: 0 }}
              title="Go to Dashboard"
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
            >
              <ArrowLeft size={24} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CalendarDays size={24} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>My Calendar</span>
            </div>

            <div style={{ width: '48px' }} />
          </div>

          {/* Main grid */}
          <div className="calendar-container">

            {/* ── Calendar Panel ── */}
            <div className="glass-panel pop-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <button onClick={prevMonth} className="nav-btn"><ChevronLeft size={24} /></button>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', margin: 0, fontWeight: '700', letterSpacing: '-0.01em' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="nav-btn"><ChevronRight size={24} /></button>
              </div>

              {/* Day labels */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '12px' }}>
                {days.map(day => (
                  <div key={day} style={{ color: '#94a3b8', fontWeight: '600', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
                ))}
              </div>

              {/* Date cells */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {calendarDays.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const dayHasTasks = hasTasks(day);
                  const dayIsToday = isToday(day);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      title={`Plan tasks for ${format(day, 'MMMM d')}`}
                      style={{
                        aspectRatio: '1', display: 'flex', flexDirection: 'column',
                        justifyContent: 'center', alignItems: 'center', cursor: 'pointer',
                        borderRadius: '14px',
                        background: isSelected
                          ? 'linear-gradient(135deg, #f472b6, #a855f7)'
                          : dayIsToday
                            ? 'rgba(244,114,182,0.1)'
                            : 'transparent',
                        color: isSelected ? 'white' : (isCurrentMonth ? 'var(--text-dark)' : '#cbd5e1'),
                        fontWeight: isSelected ? '800' : (dayIsToday ? '800' : '600'),
                        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: isSelected ? '0 8px 20px rgba(244,114,182,0.35)' : 'none',
                        border: dayIsToday && !isSelected ? '2px solid rgba(244,114,182,0.4)' : '2px solid transparent',
                      }}
                      onMouseOver={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(244,114,182,0.12)'; e.currentTarget.style.transform = 'scale(1.08)'; } }}
                      onMouseOut={e => { if (!isSelected) { e.currentTarget.style.background = dayIsToday ? 'rgba(244,114,182,0.1)' : 'transparent'; e.currentTarget.style.transform = 'scale(1)'; } }}
                    >
                      <span style={{ fontSize: '1.05rem', lineHeight: 1 }}>{format(day, 'd')}</span>
                      {dayHasTasks && (
                        <div style={{ width: '5px', height: '5px', background: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--accent)', borderRadius: '50%', marginTop: '3px' }} />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center', fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: 'linear-gradient(135deg, #f472b6, #a855f7)', display: 'inline-block' }} /> Selected
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} /> Has tasks
                </span>
              </div>
            </div>

            {/* ── Task Panel ── */}
            <div className="glass-panel pop-in task-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', animationDelay: '0.1s' }}>

              {/* Header */}
              <div style={{ borderBottom: '2px solid rgba(45,27,46,0.08)', paddingBottom: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '6px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  {getDateLabel(selectedDate)} {isToday(selectedDate) ? '☀️' : isTomorrow(selectedDate) ? '🌙' : '📅'}
                </h3>
                <p style={{ color: '#64748b', fontSize: '1rem', margin: 0, fontWeight: '500' }}>
                  {selectedTasks.length === 0
                    ? 'No tasks yet'
                    : `${completedCount}/${selectedTasks.length} tasks done`}
                </p>
              </div>

              {/* Task list — scrollable */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', paddingRight: '4px' }}>
                {selectedTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 24px', color: '#94a3b8', background: 'rgba(255,255,255,0.5)', borderRadius: '20px', border: '2px dashed rgba(45,27,46,0.1)' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🍃</div>
                    <span style={{ fontSize: '1rem', fontWeight: '600' }}>
                      {canAddTasks ? 'No tasks yet — add one below!' : 'No tasks were planned for this day.'}
                    </span>
                  </div>
                ) : (
                  selectedTasks.map(task => (
                    <div
                      key={task.id}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', background: task.completed ? 'rgba(255,255,255,0.4)' : 'white', padding: '18px 20px', borderRadius: '20px', border: task.completed ? '1px solid rgba(255,255,255,0.5)' : '2px solid rgba(45,27,46,0.06)', boxShadow: task.completed ? 'none' : 'var(--shadow-sm)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', opacity: task.completed ? 0.6 : 1 }}
                      onMouseOver={e => { if (!task.completed) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; } }}
                      onMouseOut={e => { if (!task.completed) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; } }}
                    >
                      <button
                        onClick={() => handleToggle(task)}
                        disabled={loadingTasks.includes(task.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', flexShrink: 0, lineHeight: 0, transition: 'transform 0.1s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.2) rotate(5deg)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        {loadingTasks.includes(task.id)
                          ? <Loader2 size={26} className="spinner" color="var(--text-dark)" />
                          : task.completed
                            ? <CheckCircle2 size={28} style={{ color: '#10b981' }} />
                            : <Circle size={28} style={{ color: '#94a3b8' }} />}
                      </button>
                      <span style={{ flex: 1, color: task.completed ? '#cbd5e1' : 'var(--text-dark)', textDecoration: task.completed ? 'line-through' : 'none', fontSize: '1.1rem', fontWeight: '700', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        {task.content}
                      </span>
                      <button
                        onClick={() => handleDelete(task)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, lineHeight: 0, color: '#cbd5e1', transition: 'all 0.2s', borderRadius: '8px' }}
                        onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseOut={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* ── Inline Add Task (for any date that's today or future) ── */}
              {canAddTasks && email && (
                <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="input-glass"
                    style={{ flex: 1, marginBottom: 0, fontSize: '1rem' }}
                    placeholder={`Add task for ${getDateLabel(selectedDate)}...`}
                    value={newTaskInput}
                    onChange={e => setNewTaskInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn"
                    disabled={!newTaskInput.trim() || isAddingTask}
                    style={{ padding: '0 18px', borderRadius: '14px', flexShrink: 0 }}
                  >
                    {isAddingTask ? <Loader2 size={18} className="spinner" /> : <Plus size={18} strokeWidth={2.5} />}
                  </button>
                </form>
              )}

              {/* ── Plan Tomorrow CTA at bottom ── */}
              <button
                onClick={() => {
                  setIsNavigating(true);
                  const tomorrowDate = new Date();
                  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
                  const tomorrowStr = format(tomorrowDate, 'yyyy-MM-dd');
                  if (email) {
                    router.push(`/plan?email=${encodeURIComponent(email)}`);
                  } else {
                    router.push('/plan');
                  }
                }}
                className="btn pop-in"
                disabled={isNavigating}
                style={{ width: '100%', padding: '20px', fontSize: '1.15rem', gap: '10px', animationDelay: '0.3s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(192,132,252,0.35)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; }}
              >
                {isNavigating ? <Loader2 size={20} className="spinner" /> : <Sparkles size={20} />}
                {isNavigating ? 'Opening...' : 'Plan Tomorrow ✨'}
              </button>
            </div>

          </div>
        </div>

        <style jsx global>{`
          .calendar-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 24px;
            align-items: start;
          }
          @media (max-width: 768px) {
            .calendar-container { grid-template-columns: 1fr; }
            .task-panel { min-height: 420px; }
          }
          .nav-btn {
            background: rgba(255,255,255,0.9);
            border: 2px solid rgba(45,27,46,0.08);
            border-radius: 14px;
            width: 42px; height: 42px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: var(--text-dark);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: var(--shadow-sm);
          }
          .nav-btn:hover {
            background: #fff0f5; transform: translateY(-3px);
            box-shadow: var(--shadow-md);
            border-color: rgba(244,114,182,0.3); color: var(--accent);
          }
          .nav-btn:active { transform: translateY(1px); box-shadow: none; }
        `}</style>
      </main>
    </>
  );
}
