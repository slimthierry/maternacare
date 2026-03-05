/**
 * Utility for conditionally joining class names together.
 */
export function classNames(
  ...classes: Array<string | boolean | undefined | null>
): string {
  return classes.filter(Boolean).join(' ');
}
