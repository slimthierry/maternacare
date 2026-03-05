import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Patient, PaginatedResponse } from '../types';
import { patients } from '../services/api';

export function PatientsPage() {
  const [data, setData] = useState<PaginatedResponse<Patient> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await patients.list(page, 20, searchTerm || undefined);
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(fetchPatients, searchTerm ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchPatients, searchTerm]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Users className="w-7 h-7 text-brand-500" />
            Registre des patientes
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} patientes enregistrees` : 'Gestion des dossiers patientes'}
          </p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle patiente
        </button>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Rechercher par IPP, nom ou prenom..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="input-field w-full pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button onClick={fetchPatients} className="btn-secondary mt-3 text-sm">Reessayer</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-primary)]">
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">IPP</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Nom</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Prenom</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Date de naissance</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Groupe sanguin</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Telephone</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((patient) => (
                    <tr key={patient.id} className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">{patient.ipp}</td>
                      <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">{patient.last_name}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.first_name}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.date_of_birth}</td>
                      <td className="py-3 px-4">
                        {patient.blood_type && (
                          <span className="badge-info">{patient.blood_type}{patient.rh_factor}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{patient.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.items.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                Aucune patiente trouvee
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
          </>
        )}
      </div>
    </div>
  );
}
