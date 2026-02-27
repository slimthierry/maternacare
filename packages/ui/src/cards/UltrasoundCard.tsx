import type { ReactNode } from 'react';

interface UltrasoundCardProps {
  date: string;
  gestationalWeek: number;
  type: string;
  fetalWeightG?: number;
  bpdMm?: number;
  flMm?: number;
  anomalies?: string[];
  practitioner: string;
}

const typeLabels: Record<string, string> = {
  dating: 'Datation',
  morphology: 'Morphologie',
  growth: 'Croissance',
  doppler: 'Doppler',
};

export function UltrasoundCard({
  date,
  gestationalWeek,
  type,
  fetalWeightG,
  bpdMm,
  flMm,
  anomalies,
  practitioner,
}: UltrasoundCardProps): ReactNode {
  const hasAnomalies = anomalies && anomalies.length > 0;

  return (
    <div className={`card p-4 hover:shadow-md transition-shadow ${hasAnomalies ? 'border-l-4 border-l-amber-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {date}
        </span>
        <div className="flex items-center gap-2">
          <span className="badge-info">SA {gestationalWeek}</span>
          <span className="badge-info">{typeLabels[type] || type}</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        {fetalWeightG && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">Poids: </span>
            <span className="text-[var(--color-text-primary)]">{fetalWeightG}g</span>
          </div>
        )}
        {bpdMm && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">BPD: </span>
            <span className="text-[var(--color-text-primary)]">{bpdMm} mm</span>
          </div>
        )}
        {flMm && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">LF: </span>
            <span className="text-[var(--color-text-primary)]">{flMm} mm</span>
          </div>
        )}
      </div>
      {hasAnomalies && (
        <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded text-sm text-amber-700 dark:text-amber-300">
          Anomalies: {anomalies.join(', ')}
        </div>
      )}
      <div className="mt-3 pt-3 border-t border-[var(--color-border-secondary)]">
        <span className="text-xs text-[var(--color-text-tertiary)]">{practitioner}</span>
      </div>
    </div>
  );
}
