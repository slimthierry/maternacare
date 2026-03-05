import { useState, useEffect } from 'react';
import { HeartPulse, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Delivery, PaginatedResponse } from '../types';
import { deliveries } from '../services/api';

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
  const [data, setData] = useState<PaginatedResponse<Delivery> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    deliveries.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  // Compute statistics from loaded data
  const items = data?.items ?? [];
  const totalItems = items.length;
  const vaginalCount = items.filter((d) => d.delivery_type.startsWith('vaginal')).length;
  const cesareanCount = items.filter((d) => d.delivery_type.startsWith('cesarean')).length;
  const complicatedCount = items.filter((d) => d.complications && d.complications.length > 0).length;
  const vaginalPct = totalItems > 0 ? Math.round((vaginalCount / totalItems) * 100) : 0;
  const cesareanPct = totalItems > 0 ? Math.round((cesareanCount / totalItems) * 100) : 0;
  const complicatedPct = totalItems > 0 ? Math.round((complicatedCount / totalItems) * 100) : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p><button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button></div>;

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
          <p className="text-2xl font-bold text-emerald-500 mt-1">{vaginalPct}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Cesarienne</p>
          <p className="text-2xl font-bold text-amber-500 mt-1">{cesareanPct}%</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Total accouchements</p>
          <p className="text-2xl font-bold text-brand-500 mt-1">{data?.total ?? 0}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Complications</p>
          <p className="text-2xl font-bold text-red-500 mt-1">{complicatedPct}%</p>
        </div>
      </div>

      {/* Deliveries list */}
      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Grossesse</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Mode</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Duree</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Anesthesie</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Perte sanguine</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Complications</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((d) => (
                <tr key={d.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{d.date}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">#{d.pregnancy_id}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{d.gestational_week}</td>
                  <td className="py-3 px-4">
                    <span className={d.delivery_type.includes('cesarean') ? 'badge-warning' : 'badge-success'}>
                      {typeLabels[d.delivery_type]}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {d.labor_duration_hours ? `${d.labor_duration_hours}h` : '-'}
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{anesthesiaLabels[d.anesthesia_type]}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {d.blood_loss_ml ? `${d.blood_loss_ml} ml` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {d.complications && d.complications.length > 0 ? (
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

        {data && data.items.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            Aucun accouchement trouve
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
