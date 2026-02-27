import type { ReactNode } from 'react';

interface TimelineEvent {
  week: number;
  label: string;
  completed: boolean;
  current?: boolean;
  type: 'consultation' | 'ultrasound' | 'delivery';
}

interface PregnancyTimelineProps {
  events: TimelineEvent[];
}

export function PregnancyTimeline({ events }: PregnancyTimelineProps): ReactNode {
  return (
    <div className="relative">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--color-border-primary)]" />
      <div className="flex justify-between relative">
        {events.map((event) => (
          <div key={`${event.week}-${event.label}`} className="flex flex-col items-center relative">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-10 transition-all ${
                event.completed
                  ? 'bg-brand-500 text-white'
                  : event.current
                    ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                    : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
              }`}
            >
              {event.week}
            </div>
            <span
              className={`text-xs mt-2 text-center max-w-[80px] ${
                event.current
                  ? 'font-bold text-brand-500'
                  : 'text-[var(--color-text-tertiary)]'
              }`}
            >
              {event.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
