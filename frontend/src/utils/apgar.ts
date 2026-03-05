/**
 * APGAR score interpretation utilities.
 * Score range: 0-10 for each measurement (1min, 5min, 10min).
 */

export type ApgarClassification = 'normal' | 'moderate' | 'critical';

export function classifyApgar(score: number): ApgarClassification {
  if (score >= 7) return 'normal';
  if (score >= 4) return 'moderate';
  return 'critical';
}

export function getApgarLabel(classification: ApgarClassification): string {
  switch (classification) {
    case 'normal': return 'Normal';
    case 'moderate': return 'Depression moderee';
    case 'critical': return 'Depression severe';
  }
}

export function getApgarColor(classification: ApgarClassification): string {
  switch (classification) {
    case 'normal': return 'text-emerald-600';
    case 'moderate': return 'text-amber-600';
    case 'critical': return 'text-red-600';
  }
}

export function formatApgarScores(
  min1?: number,
  min5?: number,
  min10?: number,
): string {
  const parts: string[] = [];
  if (min1 !== undefined) parts.push(String(min1));
  if (min5 !== undefined) parts.push(String(min5));
  if (min10 !== undefined) parts.push(String(min10));
  return parts.join('/');
}

export function hasLowApgar(
  min1?: number,
  min5?: number,
  min10?: number,
): boolean {
  return [min1, min5, min10].some(
    (score) => score !== undefined && score < 7,
  );
}
