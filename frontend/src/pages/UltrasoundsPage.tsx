import { useState, useEffect } from 'react';
import { ScanLine, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Ultrasound, PaginatedResponse } from '../types';
import { ultrasounds } from '../services/api';

const typeLabels: Record<string, string> = {
  dating: 'Datation',
  morphology: 'Morphologie',
  growth: 'Croissance',
  doppler: 'Doppler',
};

export function UltrasoundsPage() {
  const [data, setData] = useState<PaginatedResponse<Ultrasound> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    ultrasounds.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p><button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button></div>;

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
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Grossesse</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Type</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids foetal</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">BPD</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">LF</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Anomalies</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((us) => (
                <tr key={us.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{us.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">#{us.pregnancy_id}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.gestational_week}</td>
                  <td className="py-3 px-4">
                    <span className="badge-info">{typeLabels[us.type]}</span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {us.fetal_weight_g ? `${us.fetal_weight_g}g` : '-'}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {us.biparietal_diameter_mm ? `${us.biparietal_diameter_mm} mm` : '-'}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {us.femur_length_mm ? `${us.femur_length_mm} mm` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {us.anomalies_detected && us.anomalies_detected.length > 0 ? (
                      <span className="badge-warning">{us.anomalies_detected.length} anomalie(s)</span>
                    ) : (
                      <span className="badge-success">Normal</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.items.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            Aucune echographie trouvee
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              Page {page} sur {totalPages} ({data?.total} resultats)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
