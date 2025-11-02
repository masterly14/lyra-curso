"use client";
import { useState } from 'react';
import useSWR from 'swr';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function TaskCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthKey = format(currentMonth, 'yyyy-MM');
  const { data } = useSWR(`/api/dashboard/tasks?month=${monthKey}`, fetcher);
  const days = eachDayOfInterval({ start: startOfMonth(currentMonth), end: endOfMonth(currentMonth) });
  const tasks = data?.tasks ?? [];

  function dayTasks(day: Date) {
    return tasks.filter((t: any) => isSameDay(new Date(t.scheduledFor), day));
  }

  function changeMonth(delta: number) {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + delta);
    setCurrentMonth(d);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2 className="font-semibold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="font-medium text-gray-500">{d}</div>)}
        {days.map(day => (
          <div key={day.toISOString()} className="border rounded p-1 h-20 overflow-y-auto">
            <div className="text-xs text-gray-700 mb-1">{format(day,'d')}</div>
            {dayTasks(day).map((t:any)=>(
              <div key={t.id} className="text-[10px] bg-blue-100 rounded px-1 whitespace-nowrap overflow-hidden text-ellipsis">
                {t.title}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
