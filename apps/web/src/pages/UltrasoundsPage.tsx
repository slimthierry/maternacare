import { ScanLine, Plus } from 'lucide-react';

const mockUltrasounds = [
  { id: 1, date: '2026-02-20', patient: 'Dupont Marie', week: 24, type: 'growth', fetalWeight: 650, bpd: 62, fl: 44, anomalies: [], practitioner: 'Dr. Martin' },
  { id: 2, date: '2026-02-18', patient: 'Martin Sophie', week: 32, type: 'growth', fetalWeight: 1850, bpd: 84, fl: 61, anomalies: [], practitioner: 'Dr. Martin' },
  { id: 3, date: '2026-02-15', patient: 'Moreau Julie', week: 22, type: 'morphology', fetalWeight: 480, bpd: 56, fl: 39, anomalies: ['Pyelectasie bilaterale'], practitioner: 'Dr. Bernard' },
  { id: 4, date: '2026-02-10', patient: 'Petit Claire', week: 12, type: 'dating', fetalWeight: null, bpd: 29, fl: 15, anomalies: [], practitioner: 'Dr. Martin' },
];

const typeLabels: Record<string, string> = {
  dating: 'Datation',
  morphology: 'Morphologie',
  growth: 'Croissance',
  doppler: 'Doppler',
};

export function UltrasoundsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <ScanLine className="w-7 h-7 text-brand-500" />
            Echographies
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Examens echographiques et courbes de croissance
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle echographie
        </button>
      </div>

      {/* Growth chart placeholder */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Courbe de croissance foetale
        </h3>
        <div className="h-64 flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-lg border border-dashed border-[var(--color-border-primary)]">
          <p className="text-[var(--color-text-tertiary)]">
            Graphique de croissance (poids, BPD, LF) - Selectionnez une grossesse
          </p>
        </div>
      </div>

      {/* Ultrasound list */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          Examens recents
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Patiente</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids foetal</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">BPD</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">LF</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Anomalies</th>
              </tr>
            </thead>
            <tbody>
              {mockUltrasounds.map((us) => (
                <tr key={us.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{us.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{us.patient}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.week}</td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{typeLabels[us.type]}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {us.fetalWeight ? `${us.fetalWeight}g` : '-'}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.bpd} mm</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.fl} mm</td>
                  <td className="py-3 px-4">
                    {us.anomalies.length > 0 ? (
                      <span className="badge-warning">{us.anomalies.length} anomalie(s)</span>
                    ) : (
                      <span className="badge-success">Normal</span>
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
