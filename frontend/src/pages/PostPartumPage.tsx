import { useState, useEffect } from 'react';
import { Flower2, Plus, List, AlertTriangle, Loader2, ChevronLeft, ChevronRight, Download, Printer, CheckCircle2 } from 'lucide-react';
import type { PostPartumVisit, Pregnancy, PaginatedResponse } from '../types';
import { postpartum, pregnancies } from '../services/api';

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

const today = new Date().toISOString().split('T')[0];

export function PostPartumPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<PostPartumVisit> | null>(null);
  const [pregnancyList, setPregnancyList] = useState<Pregnancy[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    pregnancy_id: '',
    date: '',
    days_postpartum: '',
    mood_score: '',
    edinburgh_score: '',
    breastfeeding_status: 'exclusive',
    uterine_involution: 'normal',
    wound_healing: 'good',
    complications: '',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    postpartum.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  useEffect(() => {
    if (view === 'form') {
      pregnancies.list(1, 100).then((res) => setPregnancyList(res.items)).catch(() => {});
    }
  }, [view]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      const payload: Record<string, unknown> = {
        pregnancy_id: Number(formData.pregnancy_id),
        date: formData.date,
        days_postpartum: Number(formData.days_postpartum),
        breastfeeding_status: formData.breastfeeding_status,
        uterine_involution: formData.uterine_involution,
        wound_healing: formData.wound_healing,
      };
      if (formData.mood_score) payload.mood_score = Number(formData.mood_score);
      if (formData.edinburgh_score) payload.edinburgh_score = Number(formData.edinburgh_score);
      if (formData.complications.trim()) payload.complications = formData.complications.split(',').map((c) => c.trim()).filter(Boolean);
      else payload.complications = [];
      if (formData.notes) payload.notes = formData.notes;

      await postpartum.create(payload as Partial<PostPartumVisit>);
      setView('list');
      setPage(1);
      setSuccess('Visite post-partum enregistree avec succes');
      setTimeout(() => setSuccess(''), 4000);
      fetchData();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Erreur lors de l'enregistrement");
    } finally {
      setSubmitting(false);
    }
  };

  if (view === 'list' && loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (view === 'list' && error && !data) return <div className="card p-8 text-center"><p className="text-red-500">{error}</p><button onClick={fetchData} className="btn-secondary mt-3 text-sm">Reessayer</button></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
            <Flower2 className="w-7 h-7 text-brand-500" />
            Suivi post-partum
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Suivi maternel post-accouchement et score d'Edinburgh</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {view === 'list' && (
            <>
              <button onClick={() => postpartum.exportCsv().catch(() => setError('Erreur export'))} className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />CSV
              </button>
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4" />Imprimer
              </button>
            </>
          )}
          <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="btn-primary flex items-center gap-2">
            {view === 'list' ? <><Plus className="w-4 h-4" />Nouvelle visite</> : <><List className="w-4 h-4" />Voir la liste</>}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Enregistrer une visite post-partum</h3>
          {submitError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{submitError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Grossesse *</label>
              <select required value={formData.pregnancy_id} onChange={(e) => handleInputChange('pregnancy_id', e.target.value)} className="input-field w-full">
                <option value="">-- Selectionner --</option>
                {pregnancyList.map((p) => <option key={p.id} value={p.id}>#{p.id} - {p.status === 'delivered' ? 'Accouchee' : p.status} - DPA: {p.estimated_due_date}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date *</label>
              <input type="date" required max={today} value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Jours post-partum *</label>
              <input type="number" min="0" max="365" required value={formData.days_postpartum} onChange={(e) => handleInputChange('days_postpartum', e.target.value)} className="input-field w-full" placeholder="J+" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Score humeur (1-10)</label>
              <input type="number" min="1" max="10" value={formData.mood_score} onChange={(e) => handleInputChange('mood_score', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                Score Edinburgh (0-30)
                {Number(formData.edinburgh_score) >= 13 && (
                  <span className="ml-2 text-xs text-red-500 font-bold">Risque depressif</span>
                )}
                {Number(formData.edinburgh_score) >= 10 && Number(formData.edinburgh_score) < 13 && (
                  <span className="ml-2 text-xs text-amber-500 font-bold">Surveillance</span>
                )}
              </label>
              <input type="number" min="0" max="30" value={formData.edinburgh_score} onChange={(e) => handleInputChange('edinburgh_score', e.target.value)} className={`input-field w-full ${Number(formData.edinburgh_score) >= 13 ? 'border-red-400 dark:border-red-600' : Number(formData.edinburgh_score) >= 10 ? 'border-amber-400 dark:border-amber-600' : ''}`} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Allaitement</label>
              <select value={formData.breastfeeding_status} onChange={(e) => handleInputChange('breastfeeding_status', e.target.value)} className="input-field w-full">
                <option value="exclusive">Exclusif</option>
                <option value="mixed">Mixte</option>
                <option value="formula">Lait artificiel</option>
                <option value="stopped">Arrete</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Involution uterine</label>
              <select value={formData.uterine_involution} onChange={(e) => handleInputChange('uterine_involution', e.target.value)} className="input-field w-full">
                <option value="normal">Normale</option>
                <option value="delayed">Retardee</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Cicatrisation</label>
              <select value={formData.wound_healing} onChange={(e) => handleInputChange('wound_healing', e.target.value)} className="input-field w-full">
                <option value="good">Bonne</option>
                <option value="infection">Infection</option>
                <option value="dehiscence">Dehiscence</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Complications</label>
              <input type="text" value={formData.complications} onChange={(e) => handleInputChange('complications', e.target.value)} className="input-field w-full" placeholder="hemorragie, fievre (virgule)" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea rows={3} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} className="input-field w-full" placeholder="Observations..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer la visite
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          {success && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />{success}
            </div>
          )}

          <div className="card p-5 border-l-4 border-l-brand-500">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">Score d'Edinburgh (EPDS) - Depistage depression post-natale</h3>
            <div className="flex gap-6 text-xs text-[var(--color-text-secondary)]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" />0-9 : Normal</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500" />10-12 : Surveillance</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500" />&ge; 13 : Risque depressif</span>
            </div>
          </div>

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
                            <span className={`font-bold ${v.edinburgh_score >= 13 ? 'text-red-500' : v.edinburgh_score >= 10 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {v.edinburgh_score}/30
                            </span>
                            {v.edinburgh_score >= 13 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{v.breastfeeding_status ? breastfeedingLabels[v.breastfeeding_status] ?? v.breastfeeding_status : '-'}</td>
                      <td className="py-3 px-4">
                        {v.uterine_involution ? <span className={v.uterine_involution === 'normal' ? 'badge-success' : 'badge-warning'}>{v.uterine_involution === 'normal' ? 'Normale' : 'Retardee'}</span> : '-'}
                      </td>
                      <td className="py-3 px-4">
                        {v.wound_healing ? <span className={v.wound_healing === 'good' ? 'badge-success' : 'badge-critical'}>{healingLabels[v.wound_healing] ?? v.wound_healing}</span> : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.items.length === 0 && <div className="text-center py-12 text-[var(--color-text-tertiary)]">Aucune visite post-partum trouvee</div>}

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border-secondary)]">
                <p className="text-sm text-[var(--color-text-tertiary)]">Page {page} sur {totalPages} ({data?.total} resultats)</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-[var(--color-bg-tertiary)] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
