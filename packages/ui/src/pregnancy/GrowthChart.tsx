import type { ReactNode } from 'react';

interface GrowthDataPoint {
  week: number;
  value: number;
}

interface GrowthChartProps {
  title: string;
  unit: string;
  data: GrowthDataPoint[];
  referenceP10?: GrowthDataPoint[];
  referenceP50?: GrowthDataPoint[];
  referenceP90?: GrowthDataPoint[];
}

export function GrowthChart({
  title,
  unit,
  data,
}: GrowthChartProps): ReactNode {
  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        {title}
      </h3>
      {data.length > 0 ? (
        <div className="space-y-2">
          {data.map((point) => (
            <div key={point.week} className="flex items-center gap-4">
              <span className="text-sm text-[var(--color-text-secondary)] w-16">
                SA {point.week}
              </span>
              <div className="flex-1 h-6 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-400 rounded-full"
                  style={{ width: `${Math.min((point.value / (data[data.length - 1]?.value || 1)) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-[var(--color-text-primary)] w-20 text-right">
                {point.value} {unit}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-lg border border-dashed border-[var(--color-border-primary)]">
          <p className="text-[var(--color-text-tertiary)]">
            Aucune donnee de croissance disponible
          </p>
        </div>
      )}
    </div>
  );
}
