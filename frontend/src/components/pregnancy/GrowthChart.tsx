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

function scalePoints(
  points: GrowthDataPoint[],
  minWeek: number,
  maxWeek: number,
  minVal: number,
  maxVal: number,
  width: number,
  height: number,
  paddingX: number,
  paddingY: number,
): string {
  return points
    .map((p) => {
      const x = paddingX + ((p.week - minWeek) / (maxWeek - minWeek)) * (width - 2 * paddingX);
      const y = height - paddingY - ((p.value - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
      return `${x},${y}`;
    })
    .join(' ');
}

export function GrowthChart({
  title,
  unit,
  data,
  referenceP10,
  referenceP50,
  referenceP90,
}: GrowthChartProps): ReactNode {
  if (data.length === 0) {
    return (
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {title}
        </h3>
        <div className="h-48 flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-lg border border-dashed border-[var(--color-border-primary)]">
          <p className="text-[var(--color-text-tertiary)]">
            Aucune donnee de croissance disponible
          </p>
        </div>
      </div>
    );
  }

  const allPoints = [
    ...data,
    ...(referenceP10 || []),
    ...(referenceP50 || []),
    ...(referenceP90 || []),
  ];

  const weeks = allPoints.map((p) => p.week);
  const values = allPoints.map((p) => p.value);
  const minWeek = Math.min(...weeks);
  const maxWeek = Math.max(...weeks);
  const minVal = Math.min(...values) * 0.9;
  const maxVal = Math.max(...values) * 1.1;

  const width = 600;
  const height = 300;
  const paddingX = 50;
  const paddingY = 30;

  const yTicks = 5;
  const xTicks = Math.min(maxWeek - minWeek, 10);

  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        {title}
      </h3>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[600px]">
          {/* Grid lines */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const y = paddingY + (i / yTicks) * (height - 2 * paddingY);
            const val = maxVal - (i / yTicks) * (maxVal - minVal);
            return (
              <g key={`y-${i}`}>
                <line
                  x1={paddingX} y1={y} x2={width - paddingX} y2={y}
                  stroke="var(--color-border-secondary)" strokeWidth="0.5"
                />
                <text x={paddingX - 5} y={y + 4} textAnchor="end"
                  className="fill-[var(--color-text-tertiary)]" fontSize="10">
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* X axis labels */}
          {Array.from({ length: xTicks + 1 }, (_, i) => {
            const week = Math.round(minWeek + (i / xTicks) * (maxWeek - minWeek));
            const x = paddingX + (i / xTicks) * (width - 2 * paddingX);
            return (
              <text key={`x-${i}`} x={x} y={height - 5} textAnchor="middle"
                className="fill-[var(--color-text-tertiary)]" fontSize="10">
                SA {week}
              </text>
            );
          })}

          {/* Reference curves */}
          {referenceP90 && referenceP10 && (
            <polygon
              points={`${scalePoints(referenceP10, minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)} ${scalePoints([...referenceP90].reverse(), minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)}`}
              fill="var(--color-bg-tertiary)" opacity="0.5"
            />
          )}

          {referenceP10 && (
            <polyline
              points={scalePoints(referenceP10, minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)}
              fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4"
            />
          )}

          {referenceP50 && (
            <polyline
              points={scalePoints(referenceP50, minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)}
              fill="none" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6,3"
            />
          )}

          {referenceP90 && (
            <polyline
              points={scalePoints(referenceP90, minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)}
              fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,4"
            />
          )}

          {/* Actual data line */}
          <polyline
            points={scalePoints(data, minWeek, maxWeek, minVal, maxVal, width, height, paddingX, paddingY)}
            fill="none" stroke="var(--color-brand-500, #EC4899)" strokeWidth="2.5"
          />

          {/* Data points */}
          {data.map((point) => {
            const x = paddingX + ((point.week - minWeek) / (maxWeek - minWeek)) * (width - 2 * paddingX);
            const y = height - paddingY - ((point.value - minVal) / (maxVal - minVal)) * (height - 2 * paddingY);
            return (
              <g key={point.week}>
                <circle cx={x} cy={y} r="4"
                  fill="var(--color-brand-500, #EC4899)" stroke="white" strokeWidth="2"
                />
                <text x={x} y={y - 10} textAnchor="middle"
                  className="fill-[var(--color-text-primary)]" fontSize="9" fontWeight="600">
                  {point.value}
                </text>
              </g>
            );
          })}

          {/* Unit label */}
          <text x={15} y={height / 2} textAnchor="middle"
            transform={`rotate(-90, 15, ${height / 2})`}
            className="fill-[var(--color-text-tertiary)]" fontSize="10">
            {unit}
          </text>
        </svg>
      </div>

      {/* Legend */}
      {(referenceP10 || referenceP50 || referenceP90) && (
        <div className="flex items-center gap-4 mt-3 text-xs text-[var(--color-text-tertiary)]">
          <div className="flex items-center gap-1">
            <div className="w-6 h-0.5 bg-[var(--color-brand-500,#EC4899)]" />
            <span>Mesures</span>
          </div>
          {referenceP50 && (
            <div className="flex items-center gap-1">
              <div className="w-6 h-0.5 bg-slate-500 border-dashed" style={{ borderTopWidth: 1, borderTopStyle: 'dashed' }} />
              <span>P50</span>
            </div>
          )}
          {referenceP10 && referenceP90 && (
            <div className="flex items-center gap-1">
              <div className="w-4 h-3 bg-[var(--color-bg-tertiary)] opacity-50 rounded-sm" />
              <span>P10-P90</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
