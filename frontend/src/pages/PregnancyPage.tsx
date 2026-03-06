import { useState, useEffect } from 'react';
import { Baby, AlertTriangle, Stethoscope, Plus, Loader2, ChevronLeft, ChevronRight, List, Download, Printer, CheckCircle2 } from 'lucide-react';
import type { Pregnancy, PregnancyDetail, PaginatedResponse, Patient, Consultation } from '../types';
import { pregnancies, consultations, patients } from '../services/api';

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

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

const today = new Date().toISOString().split('T')[0];

export function PregnancyPage() {
  const [view, setView] = useState<'list' | 'form' | 'detail'>('list');
  const [data, setData] = useState<PaginatedResponse<Pregnancy> | null>(null);
  const [selected, setSelected] = useState<PregnancyDetail | null>(null);
  const [pregnancyConsultations, setPregnancyConsultations] = useState<PaginatedResponse<Consultation> | null>(null);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    patient_id: '',
    lmp_date: '',
    estimated_due_date: '',
    gravida: '1',
    para: '0',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    pregnancies.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  useEffect(() => {
    if (view === 'form') {
      patients.list(1, 200).then((res) => setPatientList(res.items)).catch(() => {});
    }
  }, [view]);

  const selectPregnancy = (id: number) => {
    setDetailLoading(true);
    setSelected(null);
    setPregnancyConsultations(null);
    setView('detail');
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

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'lmp_date' && value) {
        next.estimated_due_date = addDays(value, 280);
      }
      return next;
    });
  };

  const resetForm = () => {
    setFormData({ patient_id: '', lmp_date: '', estimated_due_date: '', gravida: '1', para: '0', notes: '' });
    setSubmitError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload: Record<string, unknown> = {
        patient_id: Number(formData.patient_id),
        lmp_date: formData.lmp_date,
        estimated_due_date: formData.estimated_due_date,
        gravida: Number(formData.gravida),
        para: Number(formData.para),
      };
      if (formData.notes) payload.notes = formData.notes;

      await pregnancies.create(payload as Partial<Pregnancy>);
      resetForm();
      setView('list');
      setPage(1);
      setSuccess('Grossesse enregistree avec succes');
      setTimeout(() => setSuccess(''), 4000);
      fetchData();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;
  const formSA = formData.lmp_date ? getGestationalWeek(formData.lmp_date) : null;

  // ===== DETAIL VIEW =====
  if (view === 'detail') {
    if (detailLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
    if (!selected) return <div className="card p-8 text-center"><p className="text-red-500">{error || 'Grossesse introuvable'}</p></div>;

    const gestWeek = getGestationalWeek(selected.lmp_date);

    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => { setSelected(null); setPregnancyConsultations(null); setView('list'); }}
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

  // ===== FORM VIEW =====
  if (view === 'form') {
    return (
      <div className="space-y-6">
        <div>
          <button
            onClick={() => { resetForm(); setView('list'); }}
            className="text-sm text-brand-500 hover:text-brand-600 mb-2 flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour a la liste
          </button>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Baby className="w-7 h-7 text-brand-500" />
            Nouvelle grossesse
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          {submitError && (
            <div className="alert-error">{submitError}</div>
          )}

          <div className="form-group">
            <label className="input-label">Patiente *</label>
            <select
              value={formData.patient_id}
              onChange={(e) => handleInputChange('patient_id', e.target.value)}
              className="input-field w-full"
              required
            >
              <option value="">-- Selectionner une patiente --</option>
              {patientList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.first_name} {p.last_name} (IPP: {p.ipp})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="input-label">Date des dernieres regles (DDR) *</label>
              <input
                type="date"
                value={formData.lmp_date}
                max={today}
                onChange={(e) => handleInputChange('lmp_date', e.target.value)}
                className="input-field w-full"
                required
              />
            </div>
            <div className="form-group">
              <label className="input-label">Date prevue d'accouchement (DPA)</label>
              <input
                type="date"
                value={formData.estimated_due_date}
                onChange={(e) => handleInputChange('estimated_due_date', e.target.value)}
                className="input-field w-full"
              />
              <p className="input-hint">Calculee automatiquement (DDR + 280 jours)</p>
            </div>
          </div>

          {formSA !== null && formSA >= 0 && (
            <div className="card p-4 bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800">
              <p className="text-sm text-brand-700 dark:text-brand-300">
                Grossesse actuelle : <strong>SA {formSA}</strong>
                {formSA <= 12 ? ' (1er trimestre)' : formSA <= 28 ? ' (2e trimestre)' : ' (3e trimestre)'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="input-label">Gravida (G)</label>
              <input
                type="number"
                value={formData.gravida}
                min="1"
                max="20"
                onChange={(e) => handleInputChange('gravida', e.target.value)}
                className="input-field w-full"
              />
              <p className="input-hint">Nombre total de grossesses</p>
            </div>
            <div className="form-group">
              <label className="input-label">Para (P)</label>
              <input
                type="number"
                value={formData.para}
                min="0"
                max="20"
                onChange={(e) => handleInputChange('para', e.target.value)}
                className="input-field w-full"
              />
              <p className="input-hint">Nombre d'accouchements anterieurs</p>
            </div>
          </div>

          <div className="form-group">
            <label className="input-label">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="input-field w-full"
              rows={3}
              placeholder="Observations, antecedents..."
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Enregistrer la grossesse
            </button>
            <button
              type="button"
              onClick={() => { resetForm(); setView('list'); }}
              className="btn-secondary"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    );
  }

  // ===== LIST VIEW =====
  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p><button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Baby className="w-7 h-7 text-brand-500" />
            Suivi de grossesse
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            {data ? `${data.total} grossesses enregistrees` : 'Liste des grossesses'}
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <button onClick={() => pregnancies.exportCsv().catch(() => setError('Erreur export'))} className="btn-secondary flex items-center gap-2 text-sm">
            <Download className="w-4 h-4" />CSV
          </button>
          <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
            <Printer className="w-4 h-4" />Imprimer
          </button>
          <button onClick={() => setView('form')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />Nouvelle grossesse
          </button>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
        </div>
      )}

      <div className="card p-5">
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
      </div>
    </div>
  );
}
