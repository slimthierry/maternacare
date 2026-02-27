import type { ReactNode } from 'react';

interface NewbornCardProps {
  name?: string;
  sex: 'M' | 'F';
  weightG: number;
  heightCm?: number;
  headCircumferenceCm?: number;
  apgar1min?: number;
  apgar5min?: number;
  apgar10min?: number;
  resuscitationNeeded: boolean;
  nicuAdmission: boolean;
  date: string;
}

export function NewbornCard({
  name,
  sex,
  weightG,
  heightCm,
  headCircumferenceCm,
  apgar1min,
  apgar5min,
  apgar10min,
  resuscitationNeeded,
  nicuAdmission,
  date,
}: NewbornCardProps): ReactNode {
  const hasLowApgar = [apgar1min, apgar5min, apgar10min].some(
    (score) => score !== undefined && score < 7,
  );

  return (
    <div className={`card p-4 hover:shadow-md transition-shadow ${hasLowApgar ? 'border-l-4 border-l-red-500' : ''}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-sm font-medium text-[var(--color-text-primary)]">
            {name || 'Nouveau-ne'}
          </span>
          <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
            sex === 'M'
              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
              : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200'
          }`}>
            {sex === 'M' ? 'Garcon' : 'Fille'}
          </span>
        </div>
        <span className="text-xs text-[var(--color-text-tertiary)]">{date}</span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <span className="text-[var(--color-text-tertiary)]">Poids: </span>
          <span className="text-[var(--color-text-primary)] font-medium">{weightG}g</span>
        </div>
        {heightCm && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">Taille: </span>
            <span className="text-[var(--color-text-primary)]">{heightCm} cm</span>
          </div>
        )}
        {headCircumferenceCm && (
          <div>
            <span className="text-[var(--color-text-tertiary)]">PC: </span>
            <span className="text-[var(--color-text-primary)]">{headCircumferenceCm} cm</span>
          </div>
        )}
      </div>

      {(apgar1min !== undefined || apgar5min !== undefined || apgar10min !== undefined) && (
        <div className="mt-2 p-2 bg-[var(--color-bg-secondary)] rounded">
          <span className="text-xs text-[var(--color-text-tertiary)]">APGAR: </span>
          <span className="font-mono text-sm">
            {apgar1min !== undefined && (
              <span className={apgar1min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                {apgar1min}
              </span>
            )}
            {apgar5min !== undefined && (
              <>
                <span className="text-[var(--color-text-tertiary)]">/</span>
                <span className={apgar5min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                  {apgar5min}
                </span>
              </>
            )}
            {apgar10min !== undefined && (
              <>
                <span className="text-[var(--color-text-tertiary)]">/</span>
                <span className="text-[var(--color-text-primary)]">{apgar10min}</span>
              </>
            )}
          </span>
        </div>
      )}

      {(resuscitationNeeded || nicuAdmission) && (
        <div className="mt-2 flex gap-2">
          {resuscitationNeeded && <span className="badge-critical">Reanimation</span>}
          {nicuAdmission && <span className="badge-warning">USIN</span>}
        </div>
      )}
    </div>
  );
}
