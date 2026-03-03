"use client";

import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import CalendarClient from './CalendarClient';

type Task = { id: string; content: string; dateFor: string; completed: boolean };

export default function CalendarClientWrapper({ tasks, email }: { tasks: Task[]; email: string }) {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <Loader2 size={48} className="spinner" style={{ color: '#f472b6' }} />
        <span style={{ fontWeight: '800', color: '#f472b6' }}>Loading Calendar...</span>
      </div>
    }>
      <CalendarClient tasks={tasks} email={email} />
    </Suspense>
  );
}
