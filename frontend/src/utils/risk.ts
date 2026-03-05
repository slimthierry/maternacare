/**
 * Risk assessment utilities for frontend display.
 */

export type RiskLevel = 'low' | 'medium' | 'high' | 'very_high';

export function getRiskLabel(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'Faible';
    case 'medium': return 'Moyen';
    case 'high': return 'Eleve';
    case 'very_high': return 'Tres eleve';
  }
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'text-emerald-600';
    case 'medium': return 'text-amber-600';
    case 'high': return 'text-orange-600';
    case 'very_high': return 'text-red-600';
  }
}

export function getRiskBgColor(level: RiskLevel): string {
  switch (level) {
    case 'low': return 'bg-emerald-50 dark:bg-emerald-900/20';
    case 'medium': return 'bg-amber-50 dark:bg-amber-900/20';
    case 'high': return 'bg-orange-50 dark:bg-orange-900/20';
    case 'very_high': return 'bg-red-50 dark:bg-red-900/20';
  }
}

export function isHighRiskBP(systolic?: number, diastolic?: number): boolean {
  if (systolic === undefined || diastolic === undefined) return false;
  return systolic >= 140 || diastolic >= 90;
}

export function classifyEdinburghScore(score: number): 'normal' | 'at_risk' | 'high_risk' {
  if (score >= 20) return 'high_risk';
  if (score >= 13) return 'at_risk';
  return 'normal';
}

export function getEdinburghLabel(classification: ReturnType<typeof classifyEdinburghScore>): string {
  switch (classification) {
    case 'normal': return 'Normal';
    case 'at_risk': return 'A risque';
    case 'high_risk': return 'Risque eleve';
  }
}
