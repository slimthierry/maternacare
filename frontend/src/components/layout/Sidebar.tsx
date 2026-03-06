import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Baby,
  Stethoscope,
  ScanLine,
  HeartPulse,
  Flower2,
  BabyIcon,
  Bell,
  Shield,
  X,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/patients', label: 'Patientes', icon: Users },
  { to: '/pregnancies', label: 'Grossesses', icon: Baby },
  { to: '/consultations', label: 'Consultations', icon: Stethoscope },
  { to: '/ultrasounds', label: 'Echographies', icon: ScanLine },
  { to: '/deliveries', label: 'Accouchements', icon: HeartPulse },
  { to: '/postpartum', label: 'Post-partum', icon: Flower2 },
  { to: '/newborns', label: 'Nouveau-nes', icon: BabyIcon },
  { to: '/alerts', label: 'Alertes', icon: Bell },
  { to: '/audit', label: 'Audit', icon: Shield },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="w-64 h-full bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border-primary)] flex flex-col">
      <div className="h-16 flex items-center justify-between px-6 border-b border-[var(--color-border-primary)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
            <HeartPulse className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-[var(--color-text-primary)]">
            MaternaCare
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)] hover:text-[var(--color-text-primary)]'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-border-primary)]">
        <p className="text-xs text-[var(--color-text-tertiary)] text-center">
          MaternaCare v1.0.0
        </p>
      </div>
    </aside>
  );
}
