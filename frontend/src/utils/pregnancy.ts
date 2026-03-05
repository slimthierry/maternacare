/**
 * Pregnancy date and gestational age calculation utilities.
 */

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const PREGNANCY_DURATION_DAYS = 280; // 40 weeks

/**
 * Calculate estimated due date from Last Menstrual Period (LMP).
 * Uses Naegele's rule: LMP + 280 days.
 */
export function calculateDueDate(lmpDate: Date): Date {
  const dueDate = new Date(lmpDate);
  dueDate.setDate(dueDate.getDate() + PREGNANCY_DURATION_DAYS);
  return dueDate;
}

/**
 * Calculate gestational age in weeks and days.
 */
export function calculateGestationalAge(
  lmpDate: Date,
  referenceDate: Date = new Date(),
): { weeks: number; days: number; totalDays: number } {
  const totalDays = Math.floor(
    (referenceDate.getTime() - lmpDate.getTime()) / MS_PER_DAY,
  );
  return {
    weeks: Math.floor(totalDays / 7),
    days: totalDays % 7,
    totalDays,
  };
}

/**
 * Determine the trimester based on gestational weeks.
 */
export function calculateTrimester(gestationalWeeks: number): 1 | 2 | 3 {
  if (gestationalWeeks <= 13) return 1;
  if (gestationalWeeks <= 27) return 2;
  return 3;
}

/**
 * Check if pregnancy is preterm (< 37 weeks).
 */
export function isPreterm(gestationalWeeks: number): boolean {
  return gestationalWeeks < 37;
}

/**
 * Check if pregnancy is at term (37-42 weeks).
 */
export function isTerm(gestationalWeeks: number): boolean {
  return gestationalWeeks >= 37 && gestationalWeeks <= 42;
}

/**
 * Check if pregnancy is post-term (> 42 weeks).
 */
export function isPostTerm(gestationalWeeks: number): boolean {
  return gestationalWeeks > 42;
}

/**
 * Format gestational age as "XX SA + Y j".
 */
export function formatGestationalAge(weeks: number, days: number): string {
  if (days === 0) return `${weeks} SA`;
  return `${weeks} SA + ${days} j`;
}
