"use client";

import { useState } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Task = {
  id: string;
  content: string;
  dateFor: string;
  completed: boolean;
};

export default function CalendarClient({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loadingTasks, setLoadingTasks] = useState<string[]>([]);
  const [isNavigating, setIsNavigating] = useState(false);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Generate the actual grid days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  // Determine tasks for the selected date
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const selectedTasks = tasks.filter(t => t.dateFor === selectedDateStr);

  // Helper to check if a day has any tasks
  const hasTasks = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return tasks.some(t => t.dateFor === dayStr);
  };

  return (
    <>
      <div className="mesmerizing-bg"></div>

      <main style={{ minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', overflowX: 'hidden', position: 'relative', zIndex: 1 }}>
        <div style={{ width: '100%', maxWidth: '850px', position: 'relative', animation: 'fadeInUp 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}>

          {/* Navigation Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
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

            <button
              onClick={() => {
                setIsNavigating(true);
                router.push('/plan');
              }}
              className="btn"
              disabled={isNavigating}
              style={{ padding: '12px 24px', fontSize: '1.15rem', gap: '8px', zIndex: 10 }}
            >
              {isNavigating ? <Sparkles size={20} className="spinner" /> : <Sparkles size={20} />}
              {isNavigating ? 'Opening...' : 'Plan Tomorrow'}
            </button>
          </div>

          <div className="calendar-container">

            {/* Calendar Panel */}
            <div className="glass-panel pop-in" style={{ padding: '32px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                <button onClick={prevMonth} className="nav-btn">
                  <ChevronLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.4rem', color: 'var(--text-dark)', margin: 0, fontWeight: '700', letterSpacing: '-0.01em' }}>
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="nav-btn">
                  <ChevronRight size={24} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '16px' }}>
                {days.map(day => (
                  <div key={day} style={{ color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                {calendarDays.map((day, idx) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const dayHasTasks = hasTasks(day);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(day)}
                      style={{
                        aspectRatio: '1',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        borderRadius: '16px',
                        background: isSelected ? 'var(--text-dark)' : 'transparent',
                        color: isSelected ? 'white' : (isCurrentMonth ? 'var(--text-dark)' : '#cbd5e1'),
                        fontWeight: isSelected ? '800' : '600',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
                        boxShadow: isSelected ? '0 8px 16px rgba(45, 27, 46, 0.2)' : 'none'
                      }}
                      onMouseOver={e => { if (!isSelected) { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.style.transform = 'scale(1.1)'; } }}
                      onMouseOut={e => { if (!isSelected) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; } }}
                      onMouseDown={e => { if (!isSelected) { e.currentTarget.style.transform = 'scale(0.95)'; } }}
                    >
                      <span style={{ fontSize: '1.15rem' }}>{format(day, dateFormat)}</span>
                      {dayHasTasks && (
                        <div style={{ width: '6px', height: '6px', background: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--accent)', borderRadius: '50%', marginTop: '4px' }}></div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Task List Panel */}
            <div className="glass-panel pop-in task-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', height: '100%', animationDelay: '0.1s' }}>
              <div style={{ borderBottom: '2px solid rgba(45,27,46,0.08)', paddingBottom: '20px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text-dark)', marginBottom: '8px', fontWeight: '800', letterSpacing: '-0.02em' }}>
                  {format(selectedDate, 'EEEE, MMMM do')}
                </h3>
                <p style={{ color: '#64748b', fontSize: '1.05rem', margin: 0, fontWeight: '500' }}>
                  {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} planned
                </p>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', paddingRight: '4px' }}>
                {selectedTasks.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '60px 24px', color: '#94a3b8', fontStyle: 'italic', background: 'rgba(255,255,255,0.6)', borderRadius: '24px', border: '2px dashed rgba(45,27,46,0.1)' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: '600' }}>No tasks planned for this day. 🍃</span>
                  </div>
                ) : (
                  selectedTasks.map(task => (
                    <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', background: task.completed ? 'rgba(255,255,255,0.4)' : 'white', padding: '24px', borderRadius: '24px', border: task.completed ? '1px solid rgba(255,255,255,0.5)' : '2px solid rgba(45,27,46,0.06)', boxShadow: task.completed ? 'none' : 'var(--shadow-sm)', transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)', animation: 'fadeUp 0.3s ease-out forwards', opacity: task.completed ? 0.6 : 1 }} onMouseOver={e => { if (!task.completed) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.15)'; } }} onMouseOut={e => { if (!task.completed) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'rgba(45,27,46,0.06)'; } }}>


                      {/* Interactive Checkbox */}
                      <button
                        onClick={async () => {
                          if (loadingTasks.includes(task.id)) return;
                          setLoadingTasks(prev => [...prev, task.id]);

                          const newCompleted = !task.completed;
                          task.completed = newCompleted;

                          await fetch('/api/tasks', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ taskId: task.id, completed: newCompleted }),
                          });

                          setLoadingTasks(prev => prev.filter(id => id !== task.id));
                          router.refresh();
                        }}
                        style={{ background: 'none', border: 'none', cursor: loadingTasks.includes(task.id) ? 'not-allowed' : 'pointer', padding: '4px', flexShrink: 0, marginTop: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: loadingTasks.includes(task.id) ? 0.5 : 1, transition: 'transform 0.1s ease' }}
                        disabled={loadingTasks.includes(task.id)}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.15) rotate(5deg)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1) rotate(0)'}
                        onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                      >
                        {loadingTasks.includes(task.id) ? (
                          <Loader2 size={28} color="var(--text-dark)" className="spinner" />
                        ) : task.completed ? (
                          <CheckCircle2 size={32} style={{ color: '#10b981' }} />
                        ) : (
                          <Circle size={32} style={{ color: '#94a3b8' }} />
                        )}
                      </button>

                      <span style={{ flex: 1, color: task.completed ? '#cbd5e1' : 'var(--text-dark)', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: '1.4', fontSize: '1.15rem', fontWeight: '700', transition: 'all 0.3s ease', wordBreak: 'break-word', whiteSpace: 'pre-wrap', paddingTop: '2px' }}>
                        {task.content}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        <style jsx global>{`
        .calendar-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .calendar-container {
            grid-template-columns: 1fr;
          }
          .task-panel {
            min-height: 400px;
          }
        }

        .nav-btn {
          background: rgba(255,255,255,0.9);
          border: 2px solid rgba(45,27,46,0.08);
          border-radius: 16px;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-dark);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: var(--shadow-sm);
        }
        .nav-btn:hover {
          background: #fff0f5;
          transform: translateY(-4px);
          box-shadow: var(--shadow-md);
          border-color: rgba(244,114,182,0.3);
          color: var(--accent);
        }
        .nav-btn:active {
          transform: translateY(1px);
          box-shadow: none;
        }
      `}</style>
      </main>
    </>
  );
}
