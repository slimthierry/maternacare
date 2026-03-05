import { useState, useEffect } from 'react';
import { Baby, AlertTriangle, Stethoscope, ScanLine, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Pregnancy, PregnancyDetail, PaginatedResponse } from '../types';
import { pregnancies, consultations } from '../services/api';
import type { Consultation } from '../types';

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

const statusLabels: Record<string, string> = {
  active: 'Active',
  delivered: 'Accouchee',
  complicated: 'Compliquee',
  loss: 'Perte',
};

function getGestationalWeek(lmpDate: string): number {
  const lmp = new Date(lmpDate);
  const now = new Date();
  const diffMs = now.getTime() - lmp.getTime();
  return Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
}

export function PregnancyPage() {
  const [data, setData] = useState<PaginatedResponse<Pregnancy> | null>(null);
  const [selected, setSelected] = useState<PregnancyDetail | null>(null);
  const [pregnancyConsultations, setPregnancyConsultations] = useState<PaginatedResponse<Consultation> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    pregnancies.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [page]);

  const selectPregnancy = (id: number) => {
    setDetailLoading(true);
    setSelected(null);
    setPregnancyConsultations(null);
    Promise.all([
      pregnancies.get(id),
      consultations.list(1, 20, id),
    ])
      .then(([detail, consults]) => {
        setSelected(detail);
        setPregnancyConsultations(consults);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setDetailLoading(false));
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p></div>;

  // If a pregnancy is selected, show the detail view
  if (selected) {
    const gestWeek = getGestationalWeek(selected.lmp_date);

    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => { setSelected(null); setPregnancyConsultations(null); }}
            className="text-sm text-brand-500 hover:text-brand-600 mb-2 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour a la liste
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Baby className="w-7 h-7 text-brand-500" />
            Suivi de grossesse
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {selected.patient_name} - Grossesse #{selected.id}
          </p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <p className="text-sm text-[var(--color-text-secondary)]">Semaine de grossesse</p>
            <p className="text-3xl font-bold text-brand-500 mt-1">SA {gestWeek}</p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">DPA: {selected.estimated_due_date}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-[var(--color-text-secondary)]">Niveau de risque</p>
            <p className={`text-2xl font-bold mt-1 ${riskColors[selected.risk_level]}`}>
              {riskLabels[selected.risk_level]}
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)] mt-1">G{selected.gravida}P{selected.para}</p>
          </div>
          <div className="card p-5">
            <p className="text-sm text-[var(--color-text-secondary)]">Consultations</p>
            <div className="flex items-center gap-2 mt-1">
              <Stethoscope className="w-5 h-5 text-brand-500" />
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">{selected.consultations_count}</span>
            </div>
          </div>
          <div className="card p-5">
            <p className="text-sm text-[var(--color-text-secondary)]">Alertes actives</p>
            <div className="flex items-center gap-2 mt-1">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">{selected.alerts_count}</span>
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
                {pregnancyConsultations?.items.map((c) => (
                  <tr key={c.id} className="border-b border-[var(--color-border-secondary)]">
                    <td className="py-3 px-4 text-[var(--color-text-primary)]">{c.date}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">{c.gestational_week}</td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                      {c.blood_pressure_systolic && c.blood_pressure_diastolic
                        ? `${c.blood_pressure_systolic}/${c.blood_pressure_diastolic}`
                        : '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                      {c.weight_kg ? `${c.weight_kg} kg` : '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                      {c.uterine_height_cm ? `${c.uterine_height_cm} cm` : '-'}
                    </td>
                    <td className="py-3 px-4 text-[var(--color-text-secondary)]">
                      {c.fetal_heart_rate ? `${c.fetal_heart_rate} bpm` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={c.consultation_type === 'urgent' ? 'badge-warning' : 'badge-info'}>
                        {c.consultation_type === 'routine' ? 'Routine' : c.consultation_type === 'urgent' ? 'Urgent' : 'Specialiste'}
                      </span>
                    </td>
                  </tr>
                ))}
                {pregnancyConsultations?.items.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[var(--color-text-tertiary)]">
                      Aucune consultation enregistree
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
          <Baby className="w-7 h-7 text-brand-500" />
          Suivi de grossesse
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          {data ? `${data.total} grossesses enregistrees` : 'Liste des grossesses'}
        </p>
      </div>

      <div className="card p-5">
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border-primary)]">
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">ID</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">DDR</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">DPA</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">SA</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Statut</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">Risque</th>
                    <th className="text-left py-3 px-4 text-[var(--color-text-secondary)] font-medium">G/P</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.items.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => selectPregnancy(p.id)}
                      className="border-b border-[var(--color-border-secondary)] hover:bg-[var(--color-bg-secondary)] cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-xs text-brand-600 dark:text-brand-400">#{p.id}</td>
                      <td className="py-3 px-4 text-[var(--color-text-primary)]">{p.lmp_date}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{p.estimated_due_date}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">SA {getGestationalWeek(p.lmp_date)}</td>
                      <td className="py-3 px-4">
                        <span className={
                          p.status === 'active' ? 'badge-success' :
                          p.status === 'complicated' ? 'badge-warning' :
                          p.status === 'loss' ? 'badge-critical' :
                          'badge-info'
                        }>
                          {statusLabels[p.status]}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${riskColors[p.risk_level]}`}>
                          {riskLabels[p.risk_level]}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">G{p.gravida}P{p.para}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.items.length === 0 && (
              <div className="text-center py-12 text-[var(--color-text-tertiary)]">
                Aucune grossesse trouvee
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
