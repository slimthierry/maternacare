import { Flower2, Plus, AlertTriangle } from 'lucide-react';

const mockVisits = [
  { id: 1, date: '2026-02-27', patient: 'Dupont Marie', days: 2, mood: 7, edinburgh: 8, breastfeeding: 'exclusive', involution: 'normal', healing: 'good' },
  { id: 2, date: '2026-02-26', patient: 'Martin Sophie', days: 3, mood: 5, edinburgh: 14, breastfeeding: 'mixed', involution: 'normal', healing: 'good' },
  { id: 3, date: '2026-02-25', patient: 'Bernard Lea', days: 5, mood: 8, edinburgh: 6, breastfeeding: 'exclusive', involution: 'normal', healing: 'good' },
  { id: 4, date: '2026-02-22', patient: 'Leroy Emma', days: 7, mood: 4, edinburgh: 18, breastfeeding: 'formula', involution: 'delayed', healing: 'infection' },
];

const breastfeedingLabels: Record<string, string> = {
  exclusive: 'Allaitement exclusif',
  mixed: 'Mixte',
  formula: 'Lait artificiel',
  stopped: 'Arrete',
};

export function PostPartumPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Flower2 className="w-7 h-7 text-brand-500" />
            Suivi post-partum
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Suivi maternel post-accouchement et score d'Edinburgh
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle visite
        </button>
      </div>

      {/* Edinburgh Score Guide */}
      <div className="card p-5 border-l-4 border-l-brand-500">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
          Score d'Edinburgh (EPDS) - Depistage depression post-natale
        </h3>
        <div className="flex gap-6 text-xs text-[var(--color-text-secondary)]">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            0-9 : Normal
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            10-12 : Surveillance
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-red-500" />
            &ge; 13 : Risque depressif (alerte auto)
          </span>
        </div>
      </div>

      {/* Visits */}
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Patiente</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">J+</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Humeur</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Edinburgh</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Allaitement</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Involution</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Cicatrisation</th>
              </tr>
            </thead>
            <tbody>
              {mockVisits.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{v.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{v.patient}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">J+{v.days}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{v.mood}/10</td>
                  <td className="py-3 px-4">
                    <span className="flex items-center gap-1">
                      <span className={`font-bold ${
                        v.edinburgh >= 13 ? 'text-red-500' : v.edinburgh >= 10 ? 'text-amber-500' : 'text-emerald-500'
                      }`}>
                        {v.edinburgh}/30
                      </span>
                      {v.edinburgh >= 13 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{breastfeedingLabels[v.breastfeeding]}</td>
                  <td className="py-3 px-4">
                    <span className={v.involution === 'normal' ? 'badge-success' : 'badge-warning'}>
                      {v.involution === 'normal' ? 'Normale' : 'Retardee'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={v.healing === 'good' ? 'badge-success' : 'badge-critical'}>
                      {v.healing === 'good' ? 'Bonne' : v.healing === 'infection' ? 'Infection' : 'Dehiscence'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
