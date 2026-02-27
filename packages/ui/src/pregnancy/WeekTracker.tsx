import type { ReactNode } from 'react';

interface WeekTrackerProps {
  currentWeek: number;
  totalWeeks?: number;
  dueDate: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
}

const riskColors: Record<string, string> = {
  low: 'text-emerald-500',
  medium: 'text-amber-500',
  high: 'text-orange-500',
  very_high: 'text-red-500',
};

const riskLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Eleve',
  very_high: 'Tres eleve',
};

export function WeekTracker({
  currentWeek,
  totalWeeks = 40,
  dueDate,
  riskLevel,
}: WeekTrackerProps): ReactNode {
  const progress = Math.min((currentWeek / totalWeeks) * 100, 100);

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">Semaine de grossesse</p>
          <p className="text-3xl font-bold text-brand-500">SA {currentWeek}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-[var(--color-text-secondary)]">Risque</p>
          <p className={`text-lg font-bold ${riskColors[riskLevel]}`}>
            {riskLabels[riskLevel]}
          </p>
        </div>
      </div>

      <div className="w-full h-3 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden mb-2">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex justify-between text-xs text-[var(--color-text-tertiary)]">
        <span>SA 1</span>
        <span>DPA: {dueDate}</span>
        <span>SA 40</span>
      </div>
    </div>
  );
}
