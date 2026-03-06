import { useState, useEffect } from 'react';
import { HeartPulse, Plus, List, Loader2, ChevronLeft, ChevronRight, Download, Printer } from 'lucide-react';
import type { Delivery, Pregnancy, PaginatedResponse } from '../types';
import { deliveries, pregnancies } from '../services/api';

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

const today = new Date().toISOString().split('T')[0];

export function DeliveriesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<Delivery> | null>(null);
  const [pregnancyList, setPregnancyList] = useState<Pregnancy[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const [formData, setFormData] = useState({
    pregnancy_id: '',
    date: '',
    gestational_week: '',
    delivery_type: 'vaginal_spontaneous',
    labor_duration_hours: '',
    anesthesia_type: 'none',
    blood_loss_ml: '',
    complications: '',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    deliveries.list(page)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page]);

  useEffect(() => {
    if (view === 'form') {
      pregnancies.list(1, 100, 'active').then((res) => setPregnancyList(res.items)).catch(() => {});
    }
  }, [view]);

  const totalPages = data ? Math.ceil(data.total / data.page_size) : 0;
  const items = data?.items ?? [];
  const totalItems = items.length;
  const vaginalCount = items.filter((d) => d.delivery_type.startsWith('vaginal')).length;
  const cesareanCount = items.filter((d) => d.delivery_type.startsWith('cesarean')).length;
  const complicatedCount = items.filter((d) => d.complications && d.complications.length > 0).length;
  const vaginalPct = totalItems > 0 ? Math.round((vaginalCount / totalItems) * 100) : 0;
  const cesareanPct = totalItems > 0 ? Math.round((cesareanCount / totalItems) * 100) : 0;
  const complicatedPct = totalItems > 0 ? Math.round((complicatedCount / totalItems) * 100) : 0;

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
        gestational_week: Number(formData.gestational_week),
        delivery_type: formData.delivery_type,
        anesthesia_type: formData.anesthesia_type,
      };
      if (formData.labor_duration_hours) payload.labor_duration_hours = Number(formData.labor_duration_hours);
      if (formData.blood_loss_ml) payload.blood_loss_ml = Number(formData.blood_loss_ml);
      if (formData.complications.trim()) payload.complications = formData.complications.split(',').map((c) => c.trim()).filter(Boolean);
      else payload.complications = [];
      if (formData.notes) payload.notes = formData.notes;

      await deliveries.create(payload as Partial<Delivery>);
      setView('list');
      setPage(1);
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
            <HeartPulse className="w-7 h-7 text-brand-500" />
            Accouchements
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">Enregistrement des accouchements et scores APGAR</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {view === 'list' && (
            <>
              <button onClick={() => deliveries.exportCsv()} className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />CSV
              </button>
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4" />Imprimer
              </button>
            </>
          )}
          <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="btn-primary flex items-center gap-2">
            {view === 'list' ? <><Plus className="w-4 h-4" />Enregistrer un accouchement</> : <><List className="w-4 h-4" />Voir la liste</>}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Enregistrer un accouchement</h3>
          {submitError && <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{submitError}</div>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Grossesse *</label>
              <select required value={formData.pregnancy_id} onChange={(e) => handleInputChange('pregnancy_id', e.target.value)} className="input-field w-full">
                <option value="">-- Selectionner --</option>
                {pregnancyList.map((p) => <option key={p.id} value={p.id}>#{p.id} - DPA: {p.estimated_due_date}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Date *</label>
              <input type="date" required max={today} value={formData.date} onChange={(e) => handleInputChange('date', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">SA *</label>
              <input type="number" min="20" max="45" required value={formData.gestational_week} onChange={(e) => handleInputChange('gestational_week', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Mode d'accouchement *</label>
              <select value={formData.delivery_type} onChange={(e) => handleInputChange('delivery_type', e.target.value)} className="input-field w-full">
                <option value="vaginal_spontaneous">Voie basse spontanee</option>
                <option value="vaginal_assisted">Voie basse assistee</option>
                <option value="cesarean_planned">Cesarienne programmee</option>
                <option value="cesarean_emergency">Cesarienne urgente</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Duree du travail (h)</label>
              <input type="number" step="0.5" min={0} max={72} value={formData.labor_duration_hours} onChange={(e) => handleInputChange('labor_duration_hours', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Anesthesie</label>
              <select value={formData.anesthesia_type} onChange={(e) => handleInputChange('anesthesia_type', e.target.value)} className="input-field w-full">
                <option value="none">Aucune</option>
                <option value="epidural">Peridurale</option>
                <option value="spinal">Rachianesthesie</option>
                <option value="general">Generale</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Perte sanguine (ml)</label>
              <input type="number" min={0} max={5000} value={formData.blood_loss_ml} onChange={(e) => handleInputChange('blood_loss_ml', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Complications</label>
              <input type="text" value={formData.complications} onChange={(e) => handleInputChange('complications', e.target.value)} className="input-field w-full" placeholder="hemorragie, dechirure (virgule)" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea rows={3} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} className="input-field w-full" placeholder="Observations..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer l'accouchement
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
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
                      <td className="py-3 px-4"><span className={d.delivery_type.includes('cesarean') ? 'badge-warning' : 'badge-success'}>{typeLabels[d.delivery_type]}</span></td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{d.labor_duration_hours ? `${d.labor_duration_hours}h` : '-'}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{anesthesiaLabels[d.anesthesia_type]}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{d.blood_loss_ml ? `${d.blood_loss_ml} ml` : '-'}</td>
                      <td className="py-3 px-4">
                        {d.complications && d.complications.length > 0 ? <span className="badge-critical">{d.complications.join(', ')}</span> : <span className="badge-success">Aucune</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {data && data.items.length === 0 && <div className="text-center py-12 text-[var(--color-text-tertiary)]">Aucun accouchement trouve</div>}

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
