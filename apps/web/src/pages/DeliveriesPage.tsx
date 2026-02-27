import { HeartPulse, Plus } from 'lucide-react';

const mockDeliveries = [
  { id: 1, date: '2026-02-25', patient: 'Dupont Marie', week: 39, type: 'vaginal_spontaneous', duration: 8.5, anesthesia: 'epidural', apgar: '9/10/10', complications: [] },
  { id: 2, date: '2026-02-24', patient: 'Martin Sophie', week: 38, type: 'cesarean_planned', duration: 2.0, anesthesia: 'spinal', apgar: '8/9/10', complications: [] },
  { id: 3, date: '2026-02-22', patient: 'Bernard Lea', week: 40, type: 'vaginal_spontaneous', duration: 6.0, anesthesia: 'epidural', apgar: '10/10/10', complications: [] },
  { id: 4, date: '2026-02-20', patient: 'Leroy Emma', week: 36, type: 'cesarean_emergency', duration: 1.5, anesthesia: 'general', apgar: '5/7/8', complications: ['Hemorragie'] },
];

const typeLabels: Record<string, string> = {
  vaginal_spontaneous: 'Voie basse spontanee',
  vaginal_assisted: 'Voie basse assistee',
  cesarean_planned: 'Cesarienne programmee',
  cesarean_emergency: 'Cesarienne urgente',
};

const anesthesiaLabels: Record<string, string> = {
  none: 'Aucune',
  epidural: 'Peridurale',
  spinal: 'Rachianesthesie',
  general: 'Generale',
};

export function DeliveriesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <HeartPulse className="w-7 h-7 text-brand-500" />
            Accouchements
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Enregistrement des accouchements et scores APGAR
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Enregistrer un accouchement
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Voie basse</p>
          <p className="text-2xl font-bold text-emerald-500 mt-1">65%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Cesarienne</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">35%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">APGAR moyen 1min</p>
          <p className="text-2xl font-bold text-brand-500 mt-1">8.2</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Complications</p>
          <p className="text-2xl font-bold text-red-500 mt-1">12%</p>
        </div>
      </div>

      {/* Deliveries list */}
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Patiente</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Mode</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Duree</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Anesthesie</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">APGAR</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Complications</th>
              </tr>
            </thead>
            <tbody>
              {mockDeliveries.map((d) => (
                <tr key={d.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{d.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{d.patient}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{d.week}</td>
                  <td className="py-3 px-4">
                    <span className={d.type.includes('cesarean') ? 'badge-warning' : 'badge-success'}>
                      {typeLabels[d.type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{d.duration}h</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{anesthesiaLabels[d.anesthesia]}</td>
                  <td className="py-3 px-4 font-mono text-sm text-[var(--color-text-primary)]">{d.apgar}</td>
                  <td className="py-3 px-4">
                    {d.complications.length > 0 ? (
                      <span className="badge-critical">{d.complications.join(', ')}</span>
                    ) : (
                      <span className="badge-success">Aucune</span>
                    )}
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
