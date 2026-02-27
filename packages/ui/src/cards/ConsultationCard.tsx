import type { ReactNode } from 'react';

interface ConsultationCardProps {
  date: string;
  gestationalWeek: number;
  bloodPressure?: string;
  weightKg?: number;
  fetalHeartRate?: number;
  consultationType: string;
  practitioner: string;
}

export function ConsultationCard({
  date,
  gestationalWeek,
  bloodPressure,
  weightKg,
  fetalHeartRate,
  consultationType,
  practitioner,
}: ConsultationCardProps): ReactNode {
  return (
    <div className="card p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {date}
        </span>
        <span className="badge-info">SA {gestationalWeek}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {bloodPressure && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">TA: </span>
            <span className="text-[var(--color-text-primary)]">{bloodPressure}</span>
          </div>
        )}
        {weightKg && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">Poids: </span>
            <span className="text-[var(--color-text-primary)]">{weightKg} kg</span>
          </div>
        )}
        {fetalHeartRate && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">RCF: </span>
            <span className="text-[var(--color-text-primary)]">{fetalHeartRate} bpm</span>
          </div>
        )}
        <div>
          <span className="text-[var(--color-text-tertiary)]">Type: </span>
          <span className="text-[var(--color-text-primary)] capitalize">{consultationType}</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-[var(--color-border-secondary)]">
        <span className="text-xs text-[var(--color-text-tertiary)]">{practitioner}</span>
      </div>
    </div>
  );
}
