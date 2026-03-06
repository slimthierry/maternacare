import { useState, useEffect } from 'react';
import { ScanLine, Plus, List, Loader2, ChevronLeft, ChevronRight, Download, Printer, CheckCircle2 } from 'lucide-react';
import type { Ultrasound, Pregnancy, PaginatedResponse } from '../types';
import { ultrasounds, pregnancies } from '../services/api';

const typeLabels: Record<string, string> = {
  dating: 'Datation',
  morphology: 'Morphologie',
  growth: 'Croissance',
  doppler: 'Doppler',
};

const today = new Date().toISOString().split('T')[0];

export function UltrasoundsPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [data, setData] = useState<PaginatedResponse<Ultrasound> | null>(null);
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
    gestational_week: '',
    type: 'morphology',
    fetal_weight_g: '',
    biparietal_diameter_mm: '',
    femur_length_mm: '',
    abdominal_circumference_mm: '',
    amniotic_fluid_index: '',
    placenta_position: '',
    fetal_heart_rate: '',
    anomalies_detected: '',
    notes: '',
  });

  const fetchData = () => {
    setLoading(true);
    setError('');
    ultrasounds.list(page)
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

  const autoCalculateSA = (pregnancyId: string, dateStr: string) => {
    const preg = pregnancyList.find((p) => String(p.id) === pregnancyId);
    if (preg && dateStr) {
      const lmp = new Date(preg.lmp_date);
      const d = new Date(dateStr);
      const weeks = Math.floor((d.getTime() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeks >= 1 && weeks <= 45) return String(weeks);
    }
    return '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'pregnancy_id' || field === 'date') {
        const pid = field === 'pregnancy_id' ? value : prev.pregnancy_id;
        const d = field === 'date' ? value : prev.date;
        const sa = autoCalculateSA(pid, d);
        if (sa) next.gestational_week = sa;
      }
      return next;
    });
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
        type: formData.type,
      };
      if (formData.fetal_weight_g) payload.fetal_weight_g = Number(formData.fetal_weight_g);
      if (formData.biparietal_diameter_mm) payload.biparietal_diameter_mm = Number(formData.biparietal_diameter_mm);
      if (formData.femur_length_mm) payload.femur_length_mm = Number(formData.femur_length_mm);
      if (formData.abdominal_circumference_mm) payload.abdominal_circumference_mm = Number(formData.abdominal_circumference_mm);
      if (formData.amniotic_fluid_index) payload.amniotic_fluid_index = Number(formData.amniotic_fluid_index);
      if (formData.placenta_position) payload.placenta_position = formData.placenta_position;
      if (formData.fetal_heart_rate) payload.fetal_heart_rate = Number(formData.fetal_heart_rate);
      if (formData.anomalies_detected.trim()) payload.anomalies_detected = formData.anomalies_detected.split(',').map((a) => a.trim()).filter(Boolean);
      else payload.anomalies_detected = [];
      if (formData.notes) payload.notes = formData.notes;

      await ultrasounds.create(payload as Partial<Ultrasound>);
      setView('list');
      setPage(1);
      setSuccess('Echographie enregistree avec succes');
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
            <ScanLine className="w-7 h-7 text-brand-500" />
            Echographies
          </h1>
          <p className="text-[var(--color-text-secondary)] mt-1">
            Examens echographiques et courbes de croissance
          </p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          {view === 'list' && (
            <>
              <button onClick={() => ultrasounds.exportCsv().catch(() => setError('Erreur export'))} className="btn-secondary flex items-center gap-2 text-sm">
                <Download className="w-4 h-4" />CSV
              </button>
              <button onClick={() => window.print()} className="btn-secondary flex items-center gap-2 text-sm">
                <Printer className="w-4 h-4" />Imprimer
              </button>
            </>
          )}
          <button onClick={() => setView(view === 'list' ? 'form' : 'list')} className="btn-primary flex items-center gap-2">
            {view === 'list' ? <><Plus className="w-4 h-4" />Nouvelle echographie</> : <><List className="w-4 h-4" />Voir la liste</>}
          </button>
        </div>
      </div>

      {view === 'form' ? (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-6">Enregistrer une echographie</h3>
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
              <input type="number" min="1" max="45" required value={formData.gestational_week} onChange={(e) => handleInputChange('gestational_week', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Type *</label>
              <select value={formData.type} onChange={(e) => handleInputChange('type', e.target.value)} className="input-field w-full">
                <option value="dating">Datation</option>
                <option value="morphology">Morphologie</option>
                <option value="growth">Croissance</option>
                <option value="doppler">Doppler</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Poids foetal (g)</label>
              <input type="number" min={1} max={6000} value={formData.fetal_weight_g} onChange={(e) => handleInputChange('fetal_weight_g', e.target.value)} className="input-field w-full" placeholder="g" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">BPD (mm)</label>
              <input type="number" step="0.1" min={5} max={120} value={formData.biparietal_diameter_mm} onChange={(e) => handleInputChange('biparietal_diameter_mm', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">LF (mm)</label>
              <input type="number" step="0.1" min={3} max={90} value={formData.femur_length_mm} onChange={(e) => handleInputChange('femur_length_mm', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">CA (mm)</label>
              <input type="number" step="0.1" min={20} max={450} value={formData.abdominal_circumference_mm} onChange={(e) => handleInputChange('abdominal_circumference_mm', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">ILA</label>
              <input type="number" step="0.1" min={0} max={40} value={formData.amniotic_fluid_index} onChange={(e) => handleInputChange('amniotic_fluid_index', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Position placenta</label>
              <select value={formData.placenta_position} onChange={(e) => handleInputChange('placenta_position', e.target.value)} className="input-field w-full">
                <option value="">-- Choisir --</option>
                <option value="anterior">Anterieur</option>
                <option value="posterior">Posterieur</option>
                <option value="fundal">Fundique</option>
                <option value="lateral">Lateral</option>
                <option value="previa">Praevia</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">RCF (bpm)</label>
              <input type="number" min={60} max={220} value={formData.fetal_heart_rate} onChange={(e) => handleInputChange('fetal_heart_rate', e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Anomalies detectees</label>
              <input type="text" value={formData.anomalies_detected} onChange={(e) => handleInputChange('anomalies_detected', e.target.value)} className="input-field w-full" placeholder="RCIU, oligoamnios (virgule)" />
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">Notes</label>
              <textarea rows={3} value={formData.notes} onChange={(e) => handleInputChange('notes', e.target.value)} className="input-field w-full" placeholder="Commentaires..." />
            </div>
            <div className="md:col-span-2 lg:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setView('list')} className="btn-secondary">Annuler</button>
              <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                Enregistrer l'echographie
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

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Courbe de croissance foetale</h3>
            <div className="h-64 flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-lg border border-dashed border-[var(--color-border-primary)]">
              <p className="text-[var(--color-text-tertiary)]">Graphique de croissance (poids, BPD, LF) - Selectionnez une grossesse</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Examens recents</h3>
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
                      <td className="py-3 px-4"><span className="badge-info">{typeLabels[us.type]}</span></td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.fetal_weight_g ? `${us.fetal_weight_g}g` : '-'}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.biparietal_diameter_mm ? `${us.biparietal_diameter_mm} mm` : '-'}</td>
                      <td className="py-3 px-4 text-[var(--color-text-secondary)]">{us.femur_length_mm ? `${us.femur_length_mm} mm` : '-'}</td>
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

            {data && data.items.length === 0 && <div className="text-center py-12 text-[var(--color-text-tertiary)]">Aucune echographie trouvee</div>}

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
