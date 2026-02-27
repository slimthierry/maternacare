import { Baby, AlertTriangle, Stethoscope, ScanLine } from 'lucide-react';

const mockPregnancy = {
  id: 1,
  patient: 'Dupont Marie',
  ipp: 'IPP-2024-001',
  lmpDate: '2025-09-01',
  eddDate: '2026-06-08',
  status: 'active',
  riskLevel: 'medium',
  gestationalWeek: 25,
  gravida: 2,
  para: 1,
  consultationsCount: 4,
  ultrasoundsCount: 2,
  alertsCount: 1,
};

const timeline = [
  { week: 12, label: 'Echo T1', completed: true, type: 'ultrasound' },
  { week: 16, label: 'Consultation 2', completed: true, type: 'consultation' },
  { week: 20, label: 'Consultation 3', completed: true, type: 'consultation' },
  { week: 22, label: 'Echo T2', completed: true, type: 'ultrasound' },
  { week: 24, label: 'Consultation 4', completed: true, type: 'consultation' },
  { week: 28, label: 'Consultation 5', completed: false, type: 'consultation', current: true },
  { week: 32, label: 'Echo T3', completed: false, type: 'ultrasound' },
  { week: 36, label: 'Consultation 7', completed: false, type: 'consultation' },
  { week: 40, label: 'DPA', completed: false, type: 'delivery' },
];

const riskColors: Record<string, string> = {
  low: 'risk-low',
  medium: 'risk-medium',
  high: 'risk-high',
  very_high: 'risk-very-high',
};

const riskLabels: Record<string, string> = {
  low: 'Faible',
  medium: 'Moyen',
  high: 'Eleve',
  very_high: 'Tres eleve',
};

export function PregnancyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Baby className="w-7 h-7 text-brand-500" />
          Suivi de grossesse
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {mockPregnancy.patient} - IPP {mockPregnancy.ipp}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Semaine de grossesse</p>
          <p className="text-3xl font-bold text-brand-500 mt-1">SA {mockPregnancy.gestationalWeek}</p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">DPA: {mockPregnancy.eddDate}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Niveau de risque</p>
          <p className={`text-2xl font-bold mt-1 ${riskColors[mockPregnancy.riskLevel]}`}>
            {riskLabels[mockPregnancy.riskLevel]}
          </p>
          <p className="text-xs text-[var(--color-text-tertiary)] mt-1">G{mockPregnancy.gravida}P{mockPregnancy.para}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Consultations</p>
          <div className="flex items-center gap-2 mt-1">
            <Stethoscope className="w-5 h-5 text-brand-500" />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{mockPregnancy.consultationsCount}</span>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[var(--color-text-secondary)]">Alertes actives</p>
          <div className="flex items-center gap-2 mt-1">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{mockPregnancy.alertsCount}</span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">
          Chronologie de grossesse
        </h3>
        <div className="relative">
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-[var(--color-border-primary)]" />
          <div className="flex justify-between relative">
            {timeline.map((item) => (
              <div key={item.week} className="flex flex-col items-center relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                    item.completed
                      ? 'bg-brand-500 text-white'
                      : item.current
                        ? 'bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 ring-2 ring-brand-500'
                        : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-tertiary)]'
                  }`}
                >
                  {item.week}
                </div>
                <span className={`text-xs mt-2 text-center ${
                  item.current ? 'font-bold text-brand-500' : 'text-[var(--color-text-tertiary)]'
                }`}>
                  {item.label}
                </span>
                {item.type === 'ultrasound' && (
                  <ScanLine className={`w-3 h-3 mt-1 ${item.completed ? 'text-brand-500' : 'text-[var(--color-text-tertiary)]'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Consultations history */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Historique des consultations
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">TA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">HU</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">RCF</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--color-border-secondary)]">
                <td className="py-3 px-4 text-[var(--color-text-primary)]">2026-02-15</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">24</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">125/78</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">68.5 kg</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">24 cm</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">145 bpm</td>
                <td className="py-3 px-4"><span className="badge-info">Routine</span></td>
              </tr>
              <tr className="border-b border-[var(--color-border-secondary)]">
                <td className="py-3 px-4 text-[var(--color-text-primary)]">2026-01-18</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">20</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">118/72</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">66.2 kg</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">20 cm</td>
                <td className="py-3 px-4 text-[var(--color-text-secondary)]">148 bpm</td>
                <td className="py-3 px-4"><span className="badge-info">Routine</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
