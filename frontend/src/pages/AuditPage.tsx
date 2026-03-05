import { useState, useEffect, useCallback } from 'react';
import { Shield, Search, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { AuditLog, PaginatedResponse } from '../types';
import { audit } from '../services/api';

export function AuditPage() {
  const [data, setData] = useState<PaginatedResponse<AuditLog> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    setError('');
    audit.list(page, 20, undefined, entityFilter || undefined)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [page, entityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  // Client-side search filtering on the loaded page of results
  const filteredItems = data?.items.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      (log.details?.toLowerCase().includes(term)) ||
      String(log.user_id).includes(term)
    );
  }) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Shield className="w-7 h-7 text-brand-500" />
          Journal d'audit
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Tracabilite de toutes les actions du systeme
        </p>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-tertiary)]" />
            <input
              type="text"
              placeholder="Rechercher par utilisateur ou action..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full pl-10"
            />
          </div>
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="input-field"
          >
            <option value="">Tous les types</option>
            <option value="auth">Authentification</option>
            <option value="patients">Patientes</option>
            <option value="pregnancies">Grossesses</option>
            <option value="consultations">Consultations</option>
            <option value="ultrasounds">Echographies</option>
            <option value="deliveries">Accouchements</option>
            <option value="postpartum">Post-partum</option>
            <option value="newborns">Nouveau-nes</option>
            <option value="alerts">Alertes</option>
            <option value="dashboard">Dashboard</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500">{error}</p>
            <button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-primary)]">
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Timestamp</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Utilisateur</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Action</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Entite</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Details</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">IP</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((log) => (
                    <tr key={log.id} className="border-b border-[var(--color-border-secondary)]">
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">#{log.id}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-secondary)]">{log.timestamp}</td>
                      <td className="py-3 px-4 font-medium text-[var(--color-text-primary)]">
                        {log.user_id != null ? `#${log.user_id}` : 'Systeme'}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-primary)]">
                        <span className={`font-bold ${
                          log.action.startsWith('POST') || log.action.toLowerCase().includes('creat') ? 'text-emerald-500' :
                          log.action.startsWith('PUT') || log.action.toLowerCase().includes('updat') ? 'text-amber-500' :
                          log.action.startsWith('DELETE') || log.action.toLowerCase().includes('delet') ? 'text-red-500' :
                          'text-blue-500'
                        }`}>
                          {log.action.includes(' ') ? log.action.split(' ')[0] : log.action}
                        </span>
                        {log.action.includes(' ') && (
                          <>{' '}{log.action.split(' ').slice(1).join(' ')}</>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-info">{log.entity_type}</span>
                        {log.entity_id != null && <span className="text-xs text-[var(--color-text-tertiary)] ml-1">#{log.entity_id}</span>}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">{log.details || '-'}</td>
                      <td className="py-3 px-4 font-mono text-xs text-[var(--color-text-tertiary)]">{log.ip_address || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                Aucun log d'audit trouve
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
