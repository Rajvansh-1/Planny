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
    <main style={{ minHeight: '100vh', padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '800px' }}>

        {/* Navigation Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => router.push('/')}
            style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#4b5563', fontWeight: 'bold' }}
          >
            <ArrowLeft size={18} /> Home
          </button>

          <button
            onClick={() => router.push('/plan')}
            className="btn"
            style={{ padding: '10px 20px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <CalendarIcon size={18} /> Plan Tomorrow
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

          {/* Calendar Panel */}
          <div className="glass-panel fade-up" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <button onClick={prevMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <ChevronLeft size={24} />
              </button>
              <h2 style={{ fontSize: '1.2rem', color: '#1f2937', margin: 0 }}>
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <button onClick={nextMonth} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
                <ChevronRight size={24} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px', textAlign: 'center', marginBottom: '10px' }}>
              {days.map(day => (
                <div key={day} style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem' }}>{day}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
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
                      borderRadius: '12px',
                      background: isSelected ? '#fbcfe8' : 'white',
                      border: isSelected ? '2px solid #f9a8d4' : '2px solid transparent',
                      color: isSelected ? '#be185d' : (isCurrentMonth ? '#4b5563' : '#d1d5db'),
                      fontWeight: isSelected ? 'bold' : 'normal',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      position: 'relative'
                    }}
                  >
                    <span>{format(day, dateFormat)}</span>
                    {dayHasTasks && (
                      <div style={{ width: '6px', height: '6px', background: isSelected ? '#be185d' : '#f9a8d4', borderRadius: '50%', marginTop: '2px' }}></div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Task List Panel */}
          <div className="glass-panel fade-up" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#1f2937', marginBottom: '5px' }}>
              {format(selectedDate, 'EEEE, MMMM do')}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '20px' }}>
              {selectedTasks.length} {selectedTasks.length === 1 ? 'task' : 'tasks'} planned
            </p>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontStyle: 'italic' }}>
                  No tasks planned for this day.
                </div>
              ) : (
                selectedTasks.map(task => (
                  <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'white', padding: '15px', borderRadius: '12px', borderLeft: '4px solid #fbcfe8', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                    {task.completed ? (
                      <CheckCircle2 size={20} color="#34d399" style={{ flexShrink: 0, marginTop: '2px' }} />
                    ) : (
                      <Circle size={20} color="#d1d5db" style={{ flexShrink: 0, marginTop: '2px' }} />
                    )}
                    <span style={{ color: task.completed ? '#9ca3af' : '#374151', textDecoration: task.completed ? 'line-through' : 'none', lineHeight: '1.4' }}>
                      {task.content}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
