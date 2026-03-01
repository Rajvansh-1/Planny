"use client";

import { useState } from 'react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
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
    <main style={{ minHeight: '100vh', padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: '#faf5ff', overflowX: 'hidden' }}>
      <div style={{ width: '100%', maxWidth: '850px', position: 'relative', animation: 'fadeInUp 0.6s ease-out' }}>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'white', border: '1px solid #f9a8d4', borderRadius: '50%', width: '44px', height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', fontWeight: 'bold', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.2s', flexShrink: 0 }}
            title="Go Home"
          >
            <ArrowLeft size={20} />
          </button>

          <button
            onClick={() => router.push('/plan')}
            className="btn"
            style={{ padding: '12px 24px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(249,168,212,0.4)', borderRadius: '25px' }}
          >
            <CalendarIcon size={18} /> Plan Tomorrow
          </button>
        </div>

        <div className="calendar-container">

          {/* Calendar Panel */}
          <div className="glass-panel fade-up" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <button onClick={prevMonth} className="nav-btn">
                <ChevronLeft size={24} />
              </button>
              <h2 style={{ fontSize: '1.3rem', color: '#1f2937', margin: 0, fontWeight: '800', letterSpacing: '-0.01em' }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} className="nav-btn">
                <ChevronRight size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '12px' }}>
              {days.map(day => (
                <div key={day} style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
              {calendarDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const dayHasTasks = hasTasks(day);

                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className="calendar-day"
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      cursor: 'pointer',
                      borderRadius: '14px',
                      background: isSelected ? 'linear-gradient(135deg, #fbcfe8, #f9a8d4)' : 'rgba(255,255,255,0.8)',
                      border: isSelected ? 'none' : '2px solid transparent',
                      color: isSelected ? 'white' : (isCurrentMonth ? '#4b5563' : '#d1d5db'),
                      fontWeight: isSelected ? 'bold' : '600',
                      boxShadow: isSelected ? '0 4px 12px rgba(249,168,212,0.5)' : '0 2px 6px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      position: 'relative',
                    }}
                  >
                    <span style={{ fontSize: '15px' }}>{format(day, dateFormat)}</span>
                    {dayHasTasks && (
                      <div style={{ width: '6px', height: '6px', background: isSelected ? 'white' : '#f9a8d4', borderRadius: '50%', marginTop: '4px', boxShadow: isSelected ? '0 0 4px rgba(255,255,255,0.8)' : 'none' }}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task List Panel */}
          <div className="glass-panel fade-up task-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ borderBottom: '2px solid rgba(249,168,212,0.2)', paddingBottom: '16px', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#1f2937', marginBottom: '6px', fontWeight: '800' }}>
                {format(selectedDate, 'EEEE, MMMM do')}
              </h3>
              <p style={{ color: '#6b7280', fontSize: '1rem', margin: 0, fontWeight: '500' }}>
                {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} planned
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
              {selectedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9ca3af', fontStyle: 'italic', background: 'rgba(255,255,255,0.4)', borderRadius: '16px', border: '2px dashed #fbcfe8' }}>
                  No tasks planned for this day. 🍃
                </div>
              ) : (
                selectedTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', background: 'white', padding: '18px', borderRadius: '16px', borderLeft: `5px solid ${task.completed ? '#34d399' : '#fbcfe8'}`, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', transition: 'transform 0.2s', animation: 'fadeIn 0.4s ease-out forwards' }}>
                    {task.completed ? (
                      <CheckCircle2 size={24} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Circle size={24} color="#d1d5db" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span style={{ color: task.completed ? '#9ca3af' : '#374151', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: '1.5', fontSize: '16px', fontWeight: '500' }}>
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
          background: rgba(255,255,255,0.6);
          border: 1px solid rgba(249,168,212,0.3);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #6b7280;
          transition: all 0.2s;
        }
        .nav-btn:hover {
          background: white;
          color: #f9a8d4;
          box-shadow: 0 4px 10px rgba(249,168,212,0.2);
          transform: translateY(-1px);
        }

        .calendar-day:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(0,0,0,0.06) !important;
          border-color: #fbcfe8 !important;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
