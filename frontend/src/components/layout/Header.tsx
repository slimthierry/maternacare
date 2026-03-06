import { useNavigate } from 'react-router-dom';
import { Sun, Moon, Monitor, Bell, LogOut, Menu } from 'lucide-react';
import { useTheme } from '../ThemeProvider';
import { useAuth } from '../../hooks/useAuth';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  gynecologue: 'Gynecologue',
  sage_femme: 'Sage-femme',
  pediatre: 'Pediatre',
  infirmier: 'Infirmier(e)',
  patiente: 'Patiente',
};

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

interface HeaderProps {
  onMenuToggle?: () => void;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <header className="h-16 bg-[var(--color-bg-card)] border-b border-[var(--color-border-primary)] flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-sm font-medium text-[var(--color-text-secondary)] hidden sm:block">
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
              {initials}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {user?.name || 'Utilisateur'}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              {user?.role ? ROLE_LABELS[user.role] || user.role : ''}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="p-2 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)] transition-colors"
          title="Se deconnecter"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
