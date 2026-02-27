import { Sun, Moon, Monitor, Bell, LogOut } from 'lucide-react';
import { useTheme } from '../ThemeProvider';

function ThemeToggleIcon() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
      title={`Theme: ${theme}`}
    >
      {theme === 'light' && <Sun className="w-5 h-5" />}
      {theme === 'dark' && <Moon className="w-5 h-5" />}
      {theme === 'system' && <Monitor className="w-5 h-5" />}
    </button>
  );
}

export function Header() {
  return (
    <header className="h-16 bg-[var(--color-bg-card)] border-b border-[var(--color-border-primary)] flex items-center justify-between px-6">
      <div>
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Module SIH - Suivi de grossesse
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <ThemeToggleIcon />

        <div className="h-6 w-px bg-[var(--color-border-primary)] mx-1" />

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center">
            <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
              MC
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Dr. Martin
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Gynecologue
            </p>
          </div>
        </div>

        <button className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
