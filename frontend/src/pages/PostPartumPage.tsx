import { useState, useEffect } from 'react';
import { Flower2, Plus, AlertTriangle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { PostPartumVisit, PaginatedResponse } from '../types';
import { postpartum } from '../services/api';

const breastfeedingLabels: Record<string, string> = {
  exclusive: 'Allaitement exclusif',
  mixed: 'Mixte',
  formula: 'Lait artificiel',
  stopped: 'Arrete',
};

const healingLabels: Record<string, string> = {
  good: 'Bonne',
  infection: 'Infection',
  dehiscence: 'Dehiscence',
};

export function PostPartumPage() {
  const [data, setData] = useState<PaginatedResponse<PostPartumVisit> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    postpartum.list(page)
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
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Grossesse</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">J+</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Humeur</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Edinburgh</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Allaitement</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Involution</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Cicatrisation</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((v) => (
                <tr key={v.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{v.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">#{v.pregnancy_id}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">J+{v.days_postpartum}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{v.mood_score != null ? `${v.mood_score}/10` : '-'}</td>
                  <td className="py-3 px-4">
                    {v.edinburgh_score != null ? (
                      <span className="flex items-center gap-1">
                        <span className={`font-bold ${
                          v.edinburgh_score >= 13 ? 'text-red-500' : v.edinburgh_score >= 10 ? 'text-amber-500' : 'text-emerald-500'
                        }`}>
                          {v.edinburgh_score}/30
                        </span>
                        {v.edinburgh_score >= 13 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {v.breastfeeding_status ? breastfeedingLabels[v.breastfeeding_status] ?? v.breastfeeding_status : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {v.uterine_involution ? (
                      <span className={v.uterine_involution === 'normal' ? 'badge-success' : 'badge-warning'}>
                        {v.uterine_involution === 'normal' ? 'Normale' : 'Retardee'}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {v.wound_healing ? (
                      <span className={v.wound_healing === 'good' ? 'badge-success' : 'badge-critical'}>
                        {healingLabels[v.wound_healing] ?? v.wound_healing}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-tertiary)]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.items.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            Aucune visite post-partum trouvee
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
