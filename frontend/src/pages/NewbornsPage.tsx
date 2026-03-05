import { useState, useEffect } from 'react';
import { Baby, Plus, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Newborn, PaginatedResponse } from '../types';
import { newborns } from '../services/api';

export function NewbornsPage() {
  const [data, setData] = useState<PaginatedResponse<Newborn> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = () => {
    setLoading(true);
    setError('');
    newborns.list(page)
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
            <Baby className="w-7 h-7 text-brand-500" />
            Registre des nouveau-nes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Gestion des dossiers nouveau-nes et statistiques vitales
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Enregistrer un nouveau-ne
        </button>
      </div>

      <div className="card p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border-primary)]">
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Nom</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Sexe</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Poids</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Taille</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">PC</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Groupe</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">APGAR 1'/5'/10'</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Reanimation</th>
                <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">USIN</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((nb) => (
                <tr key={nb.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                  <td className="py-3 px-4 text-[var(--color-text-primary)]">{nb.created_at?.split('T')[0] ?? '-'}</td>
                  <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{nb.first_name || '-'}</td>
                  <td className="py-3 px-4">
                    <span className={nb.sex === 'M' ? 'badge-info' : 'bg-brand-100 text-brand-800 dark:bg-brand-900 dark:text-brand-200 text-xs font-medium px-2.5 py-0.5 rounded-full'}>
                      {nb.sex === 'M' ? 'Garcon' : 'Fille'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.weight_g}g</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.height_cm ? `${nb.height_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">{nb.head_circumference_cm ? `${nb.head_circumference_cm} cm` : '-'}</td>
                  <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                    {nb.blood_type ? `${nb.blood_type}${nb.rh_factor || ''}` : '-'}
                  </td>
                  <td className="py-3 px-4 font-mono text-sm">
                    <span className={nb.apgar_1min != null && nb.apgar_1min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                      {nb.apgar_1min ?? '-'}
                    </span>
                    /
                    <span className={nb.apgar_5min != null && nb.apgar_5min < 7 ? 'text-red-500 font-bold' : 'text-[var(--color-text-primary)]'}>
                      {nb.apgar_5min ?? '-'}
                    </span>
                    /
                    <span className="text-[var(--color-text-primary)]">{nb.apgar_10min ?? '-'}</span>
                  </td>
                  <td className="py-3 px-4">
                    {nb.resuscitation_needed ? (
                      <span className="badge-critical">Oui</span>
                    ) : (
                      <span className="badge-success">Non</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {nb.nicu_admission ? (
                      <span className="badge-warning">Oui</span>
                    ) : (
                      <span className="badge-success">Non</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data && data.items.length === 0 && (
          <div className="text-center py-12 text-[var(--color-text-tertiary)]">
            Aucun nouveau-ne trouve
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
